import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type SteamGame = {
  appid: number
  name: string
  playtime_forever: number
  playtime_2weeks?: number
  img_icon_url?: string
  rtime_last_played?: number
}

export async function GET() {
  const returnUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const steamApiKey = process.env.STEAM_API_KEY

  if (!steamApiKey) {
    return NextResponse.redirect(`${returnUrl}/profile?error=steam_api_not_configured`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${returnUrl}/login`)
  }

  // Get Steam account
  const { data: steamAccount } = await supabase
    .from('connected_accounts')
    .select('external_user_id')
    .eq('user_id', user.id)
    .eq('provider', 'steam')
    .single()

  if (!steamAccount) {
    return NextResponse.redirect(`${returnUrl}/profile?error=steam_not_connected`)
  }

  const steamId = steamAccount.external_user_id

  try {
    // Fetch owned games from Steam
    const gamesResponse = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steamApiKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1&format=json`
    )

    if (!gamesResponse.ok) {
      throw new Error('Failed to fetch Steam games')
    }

    const gamesData = await gamesResponse.json()
    const games: SteamGame[] = gamesData?.response?.games || []

    if (games.length === 0) {
      // Update last_sync_at even if no games (might be private)
      await supabase
        .from('connected_accounts')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('provider', 'steam')

      return NextResponse.redirect(`${returnUrl}/profile?steam=synced&count=0`)
    }

    // Prepare games for upsert
    const libraryGames = games.map((game) => ({
      user_id: user.id,
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
      .eq('provider', 'steam')

    // Auto-follow games that match our database
    const steamAppIds = games.map(g => g.appid.toString())
    const { data: matchedGames } = await supabase
      .from('games')
      .select('id')
      .in('steam_app_id', steamAppIds)

    if (matchedGames && matchedGames.length > 0) {
      const followRecords = matchedGames.map(game => ({
        user_id: user.id,
        game_id: game.id,
      }))

      // Upsert to avoid duplicates
      await supabase
        .from('user_followed_games')
        .upsert(followRecords, { onConflict: 'user_id,game_id', ignoreDuplicates: true })
    }

    const followedCount = matchedGames?.length || 0
    return NextResponse.redirect(`${returnUrl}/profile?steam=synced&count=${games.length}&followed=${followedCount}`)
  } catch (err) {
    console.error('Steam sync error:', err)
    return NextResponse.redirect(`${returnUrl}/profile?error=steam_sync_failed`)
  }
}
