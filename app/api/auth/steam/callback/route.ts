import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const returnUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Verify the OpenID response
  const claimedId = url.searchParams.get('openid.claimed_id')
  const sig = url.searchParams.get('openid.sig')

  if (!claimedId || !sig) {
    return NextResponse.redirect(`${returnUrl}/profile?error=steam_auth_failed`)
  }

  // Extract Steam ID from claimed_id
  // Format: https://steamcommunity.com/openid/id/76561198012345678
  const steamIdMatch = claimedId.match(/\/id\/(\d+)$/)
  if (!steamIdMatch) {
    return NextResponse.redirect(`${returnUrl}/profile?error=invalid_steam_id`)
  }

  const steamId = steamIdMatch[1]

  // Verify the signature with Steam
  const verifyParams = new URLSearchParams()
  url.searchParams.forEach((value, key) => {
    verifyParams.append(key, value)
  })
  verifyParams.set('openid.mode', 'check_authentication')

  try {
    const verifyResponse = await fetch('https://steamcommunity.com/openid/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verifyParams.toString(),
    })

    const verifyText = await verifyResponse.text()
    if (!verifyText.includes('is_valid:true')) {
      return NextResponse.redirect(`${returnUrl}/profile?error=steam_verification_failed`)
    }

    // Get Steam user info
    const steamApiKey = process.env.STEAM_API_KEY
    let displayName = steamId
    let avatarUrl: string | null = null

    if (steamApiKey) {
      const playerResponse = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`
      )
      const playerData = await playerResponse.json()
      const player = playerData?.response?.players?.[0]

      if (player) {
        displayName = player.personaname || steamId
        avatarUrl = player.avatarfull || player.avatar || null
      }
    }

    // Save to database
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(`${returnUrl}/login?error=not_authenticated`)
    }

    const { error } = await supabase
      .from('connected_accounts')
      .upsert({
        user_id: user.id,
        provider: 'steam',
        external_user_id: steamId,
        display_name: displayName,
        avatar_url: avatarUrl,
      }, {
        onConflict: 'user_id,provider',
      })

    if (error) {
      console.error('Failed to save Steam account:', error)
      return NextResponse.redirect(`${returnUrl}/profile?error=save_failed`)
    }

    // Auto-sync library after connecting
    return NextResponse.redirect(`${returnUrl}/api/sync/steam`)
  } catch (err) {
    console.error('Steam auth error:', err)
    return NextResponse.redirect(`${returnUrl}/profile?error=steam_auth_error`)
  }
}
