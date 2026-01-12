import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCronAuth } from '@/lib/cron-auth'
import { acquireCronLock, releaseCronLock } from '@/lib/cron-lock'

export const runtime = 'nodejs'
export const maxDuration = 300

const SYNC_LIBRARIES_LOCK = 'sync-libraries'
const LOCK_DURATION_MINUTES = 30 // Allow 30 min for large libraries

type SteamGame = {
  appid: number
  name: string
  playtime_forever: number
  playtime_2weeks?: number
  img_icon_url?: string
  rtime_last_played?: number
}

type XboxGame = {
  titleId: string
  name: string
  displayImage?: string
  titleHistory?: {
    lastTimePlayed: string
    minutesPlayed?: number
  }
}

type SyncResult = {
  userId: string
  provider: string
  success: boolean
  gamesCount?: number
  error?: string
}

async function syncSteamLibrary(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  steamId: string,
  steamApiKey: string
): Promise<SyncResult> {
  try {
    const gamesResponse = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steamApiKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1&format=json`
    )

    if (!gamesResponse.ok) {
      return { userId, provider: 'steam', success: false, error: 'API request failed' }
    }

    const gamesData = await gamesResponse.json()
    const games: SteamGame[] = gamesData?.response?.games || []

    if (games.length === 0) {
      await supabase
        .from('connected_accounts')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('provider', 'steam')

      return { userId, provider: 'steam', success: true, gamesCount: 0 }
    }

    const libraryGames = games.map((game) => ({
      user_id: userId,
      provider: 'steam',
      provider_game_id: game.appid.toString(),
      name: game.name,
      cover_url: game.img_icon_url
        ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
        : null,
      playtime_minutes: game.playtime_forever || 0,
      last_played_at: game.rtime_last_played
        ? new Date(game.rtime_last_played * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    }))

    // Upsert in batches
    const batchSize = 100
    for (let i = 0; i < libraryGames.length; i += batchSize) {
      const batch = libraryGames.slice(i, i + batchSize)
      await supabase
        .from('user_library_games')
        .upsert(batch, { onConflict: 'user_id,provider,provider_game_id' })
    }

    // Update last_sync_at
    await supabase
      .from('connected_accounts')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('provider', 'steam')

    // Auto-follow matched games
    const steamAppIds = games.map(g => g.appid.toString())
    const { data: matchedGames } = await supabase
      .from('games')
      .select('id')
      .in('steam_app_id', steamAppIds)

    if (matchedGames && matchedGames.length > 0) {
      const followRecords = matchedGames.map(game => ({
        user_id: userId,
        game_id: game.id,
      }))
      await supabase
        .from('user_followed_games')
        .upsert(followRecords, { onConflict: 'user_id,game_id', ignoreDuplicates: true })
    }

    return { userId, provider: 'steam', success: true, gamesCount: games.length }
  } catch (err) {
    return { userId, provider: 'steam', success: false, error: String(err) }
  }
}

async function syncXboxLibrary(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  xuid: string,
  accessToken: string,
  refreshToken: string | null
): Promise<SyncResult> {
  try {
    // Get Xbox Live user token
    const userTokenResponse = await fetch('https://user.auth.xboxlive.com/user/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-xbl-contract-version': '1',
      },
      body: JSON.stringify({
        RelyingParty: 'http://auth.xboxlive.com',
        TokenType: 'JWT',
        Properties: {
          AuthMethod: 'RPS',
          SiteName: 'user.auth.xboxlive.com',
          RpsTicket: `d=${accessToken}`,
        },
      }),
    })

    if (!userTokenResponse.ok) {
      // Try refresh token
      if (refreshToken) {
        const clientId = process.env.XBOX_CLIENT_ID!
        const clientSecret = process.env.XBOX_CLIENT_SECRET!

        const refreshResponse = await fetch('https://login.live.com/oauth20_token.srf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
            scope: 'XboxLive.signin XboxLive.offline_access',
          }),
        })

        if (!refreshResponse.ok) {
          return { userId, provider: 'xbox', success: false, error: 'Token refresh failed' }
        }

        const refreshData = await refreshResponse.json()
        accessToken = refreshData.access_token

        // Update tokens in database
        await supabase
          .from('connected_accounts')
          .update({
            access_token: refreshData.access_token,
            refresh_token: refreshData.refresh_token,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('provider', 'xbox')

        // Retry with new token
        return syncXboxLibrary(supabase, userId, xuid, accessToken, null)
      }
      return { userId, provider: 'xbox', success: false, error: 'Auth failed' }
    }

    const userTokenData = await userTokenResponse.json()
    const userToken = userTokenData.Token

    // Get XSTS token
    const xstsResponse = await fetch('https://xsts.auth.xboxlive.com/xsts/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-xbl-contract-version': '1',
      },
      body: JSON.stringify({
        RelyingParty: 'http://xboxlive.com',
        TokenType: 'JWT',
        Properties: {
          SandboxId: 'RETAIL',
          UserTokens: [userToken],
        },
      }),
    })

    if (!xstsResponse.ok) {
      return { userId, provider: 'xbox', success: false, error: 'XSTS token failed' }
    }

    const xstsData = await xstsResponse.json()
    const xstsToken = xstsData.Token
    const userHash = xstsData.DisplayClaims?.xui?.[0]?.uhs || ''

    // Fetch games
    const gamesResponse = await fetch(
      `https://titlehub.xboxlive.com/users/xuid(${xuid})/titles/titlehistory/decoration/achievement,image`,
      {
        headers: {
          'Authorization': `XBL3.0 x=${userHash};${xstsToken}`,
          'x-xbl-contract-version': '2',
          'Accept-Language': 'en-US',
        },
      }
    )

    if (!gamesResponse.ok) {
      return { userId, provider: 'xbox', success: false, error: 'Games fetch failed' }
    }

    const gamesData = await gamesResponse.json()
    const games: XboxGame[] = gamesData.titles || []

    if (games.length === 0) {
      await supabase
        .from('connected_accounts')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('provider', 'xbox')

      return { userId, provider: 'xbox', success: true, gamesCount: 0 }
    }

    const libraryGames = games.map((game) => ({
      user_id: userId,
      provider: 'xbox',
      provider_game_id: game.titleId,
      name: game.name,
      cover_url: game.displayImage || null,
      playtime_minutes: game.titleHistory?.minutesPlayed || 0,
      last_played_at: game.titleHistory?.lastTimePlayed
        ? new Date(game.titleHistory.lastTimePlayed).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    }))

    // Upsert in batches
    const batchSize = 100
    for (let i = 0; i < libraryGames.length; i += batchSize) {
      const batch = libraryGames.slice(i, i + batchSize)
      await supabase
        .from('user_library_games')
        .upsert(batch, { onConflict: 'user_id,provider,provider_game_id' })
    }

    // Update last_sync_at
    await supabase
      .from('connected_accounts')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('provider', 'xbox')

    return { userId, provider: 'xbox', success: true, gamesCount: games.length }
  } catch (err) {
    return { userId, provider: 'xbox', success: false, error: String(err) }
  }
}

export async function GET(req: Request) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Acquire lock to prevent overlapping runs
  const lockAcquired = await acquireCronLock(SYNC_LIBRARIES_LOCK, LOCK_DURATION_MINUTES)
  if (!lockAcquired) {
    console.log('[SYNC-LIBRARIES] Previous run still in progress, skipping')
    return NextResponse.json({
      ok: false,
      skipped: true,
      reason: 'Previous run still in progress',
    })
  }

  const startTime = Date.now()
  console.log('[SYNC-LIBRARIES] Starting daily library sync...')

  const supabase = createAdminClient()
  const steamApiKey = process.env.STEAM_API_KEY
  const results: SyncResult[] = []

  // Get all connected accounts that support library sync
  const { data: accounts, error } = await supabase
    .from('connected_accounts')
    .select('user_id, provider, external_user_id, access_token, refresh_token')
    .in('provider', ['steam', 'xbox'])

  if (error) {
    console.error('[SYNC-LIBRARIES] Failed to fetch accounts:', error)
    return NextResponse.json({ ok: false, error: 'Failed to fetch accounts' })
  }

  const accountCount = accounts?.length || 0
  console.log(`[SYNC-LIBRARIES] Found ${accountCount} accounts to sync`)

  // Process accounts with rate limiting
  for (const account of accounts || []) {
    if (account.provider === 'steam' && steamApiKey) {
      const result = await syncSteamLibrary(
        supabase,
        account.user_id,
        account.external_user_id,
        steamApiKey
      )
      results.push(result)
      console.log(`[SYNC-LIBRARIES] Steam sync for ${account.user_id}: ${result.success ? 'OK' : 'FAILED'} (${result.gamesCount || 0} games)`)
    } else if (account.provider === 'xbox' && account.access_token) {
      const result = await syncXboxLibrary(
        supabase,
        account.user_id,
        account.external_user_id,
        account.access_token,
        account.refresh_token
      )
      results.push(result)
      console.log(`[SYNC-LIBRARIES] Xbox sync for ${account.user_id}: ${result.success ? 'OK' : 'FAILED'} (${result.gamesCount || 0} games)`)
    }

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  const successCount = results.filter(r => r.success).length
  const failCount = results.filter(r => !r.success).length
  const totalGames = results.reduce((sum, r) => sum + (r.gamesCount || 0), 0)
  const duration = Date.now() - startTime

  console.log(`[SYNC-LIBRARIES] Completed in ${duration}ms: ${successCount} success, ${failCount} failed, ${totalGames} total games`)

  // Release lock
  await releaseCronLock(SYNC_LIBRARIES_LOCK)

  return NextResponse.json({
    ok: true,
    accountsProcessed: results.length,
    successCount,
    failCount,
    totalGames,
    durationMs: duration,
  })
}
