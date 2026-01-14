import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type XboxGame = {
  titleId: string
  name: string
  displayImage?: string
  achievement?: {
    currentAchievements: number
    totalAchievements: number
    currentGamerscore: number
    totalGamerscore: number
  }
  titleHistory?: {
    lastTimePlayed: string
    minutesPlayed?: number
  }
}

async function refreshXboxToken(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  refreshToken: string
): Promise<string | null> {
  const clientId = process.env.XBOX_CLIENT_ID!
  const clientSecret = process.env.XBOX_CLIENT_SECRET!

  try {
    const response = await fetch('https://login.live.com/oauth20_token.srf', {
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

    if (!response.ok) return null

    const data = await response.json()

    // Update tokens in database
    await supabase
      .from('connected_accounts')
      .update({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('provider', 'xbox')

    return data.access_token
  } catch {
    return null
  }
}

// Get Xbox Live user token from Microsoft OAuth token
async function getXboxUserToken(accessToken: string): Promise<string | null> {
  const response = await fetch('https://user.auth.xboxlive.com/user/authenticate', {
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

  if (!response.ok) return null

  const data = await response.json()
  return data.Token
}

// Get XSTS token from Xbox user token
async function getXstsToken(userToken: string): Promise<{ token: string; userHash: string } | null> {
  const response = await fetch('https://xsts.auth.xboxlive.com/xsts/authorize', {
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

  if (!response.ok) return null

  const data = await response.json()
  return {
    token: data.Token,
    userHash: data.DisplayClaims?.xui?.[0]?.uhs || '',
  }
}

export async function GET() {
  const returnUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${returnUrl}/login`)
  }

  // Get Xbox account
  const { data: xboxAccount } = await supabase
    .from('connected_accounts')
    .select('external_user_id, access_token, refresh_token')
    .eq('user_id', user.id)
    .eq('provider', 'xbox')
    .single()

  if (!xboxAccount) {
    return NextResponse.redirect(`${returnUrl}/profile?error=xbox_not_connected`)
  }

  const xuid = xboxAccount.external_user_id
  let accessToken = xboxAccount.access_token

  // If no access token, need to re-authenticate
  if (!accessToken) {
    return NextResponse.redirect(`${returnUrl}/profile?error=xbox_reauth_required`)
  }

  try {
    // Try to get Xbox user token
    let userToken = await getXboxUserToken(accessToken)

    // If failed, try refreshing the Microsoft OAuth token
    if (!userToken && xboxAccount.refresh_token) {
      const newToken = await refreshXboxToken(supabase, user.id, xboxAccount.refresh_token)
      if (newToken) {
        accessToken = newToken
        userToken = await getXboxUserToken(accessToken)
      }
    }

    if (!userToken) {
      return NextResponse.redirect(`${returnUrl}/profile?error=xbox_reauth_required`)
    }

    // Get XSTS token
    const xsts = await getXstsToken(userToken)
    if (!xsts) {
      throw new Error('Failed to get XSTS token')
    }

    // Fetch title history (games played)
    const gamesResponse = await fetch(
      `https://titlehub.xboxlive.com/users/xuid(${xuid})/titles/titlehistory/decoration/achievement,image`,
      {
        headers: {
          'Authorization': `XBL3.0 x=${xsts.userHash};${xsts.token}`,
          'x-xbl-contract-version': '2',
          'Accept-Language': 'en-US',
        },
      }
    )

    if (!gamesResponse.ok) {
      throw new Error('Failed to fetch Xbox games')
    }

    const gamesData = await gamesResponse.json()
    const games: XboxGame[] = gamesData.titles || []

    if (games.length === 0) {
      await supabase
        .from('connected_accounts')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('provider', 'xbox')

      return NextResponse.redirect(`${returnUrl}/profile?xbox=synced&count=0`)
    }

    // Prepare games for upsert
    const libraryGames = games.map((game) => ({
      user_id: user.id,
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

    // Upsert in batches of 100
    const batchSize = 100
    for (let i = 0; i < libraryGames.length; i += batchSize) {
      const batch = libraryGames.slice(i, i + batchSize)
      await supabase
        .from('user_library_games')
        .upsert(batch, {
          onConflict: 'user_id,provider,provider_game_id',
        })
    }

    // Update last_sync_at
    await supabase
      .from('connected_accounts')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('provider', 'xbox')

    return NextResponse.redirect(`${returnUrl}/profile?xbox=synced&count=${games.length}`)
  } catch (err) {
    console.error('Xbox sync error:', err)
    return NextResponse.redirect(`${returnUrl}/profile?error=xbox_sync_failed`)
  }
}
