import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type XboxProfile = {
  xuid: string
  gamertag: string
  gamerscore: number
  avatarUrl: string | null
}

type MicrosoftTokens = {
  access_token: string
  refresh_token: string
}

async function exchangeCodeForToken(code: string, redirectUri: string): Promise<MicrosoftTokens> {
  const clientId = process.env.XBOX_CLIENT_ID!
  const clientSecret = process.env.XBOX_CLIENT_SECRET!

  const response = await fetch('https://login.live.com/oauth20_token.srf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get Microsoft token: ${error}`)
  }

  const data = await response.json()
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  }
}

async function getXboxUserToken(microsoftToken: string): Promise<string> {
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
        RpsTicket: `d=${microsoftToken}`,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get Xbox user token: ${error}`)
  }

  const data = await response.json()
  return data.Token
}

async function getXstsToken(userToken: string): Promise<{ token: string; xuid: string; gamertag: string }> {
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

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get XSTS token: ${error}`)
  }

  const data = await response.json()
  const xui = data.DisplayClaims?.xui?.[0]

  return {
    token: data.Token,
    xuid: xui?.xid || '',
    gamertag: xui?.gtg || '',
  }
}

async function getXboxProfile(xstsToken: string, userHash: string, xuid: string): Promise<XboxProfile | null> {
  try {
    const response = await fetch(
      `https://profile.xboxlive.com/users/xuid(${xuid})/profile/settings?settings=Gamertag,GameDisplayPicRaw,Gamerscore`,
      {
        headers: {
          'Authorization': `XBL3.0 x=${userHash};${xstsToken}`,
          'x-xbl-contract-version': '3',
          'Accept-Language': 'en-US',
        },
      }
    )

    if (!response.ok) {
      console.error('Failed to fetch Xbox profile:', await response.text())
      return null
    }

    const data = await response.json()
    const settings = data.profileUsers?.[0]?.settings || []

    const gamertag = settings.find((s: { id: string }) => s.id === 'Gamertag')?.value || ''
    const avatarUrl = settings.find((s: { id: string }) => s.id === 'GameDisplayPicRaw')?.value || null
    const gamerscore = parseInt(settings.find((s: { id: string }) => s.id === 'Gamerscore')?.value || '0', 10)

    return { xuid, gamertag, gamerscore, avatarUrl }
  } catch (err) {
    console.error('Error fetching Xbox profile:', err)
    return null
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const returnUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const callbackUrl = `${returnUrl}/api/auth/xbox/callback`

  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${returnUrl}/profile?error=xbox_auth_denied`)
  }

  if (!code) {
    return NextResponse.redirect(`${returnUrl}/profile?error=xbox_auth_failed`)
  }

  try {
    // Step 1: Exchange code for Microsoft tokens (access + refresh)
    const microsoftTokens = await exchangeCodeForToken(code, callbackUrl)

    // Step 2: Get Xbox user token
    const userToken = await getXboxUserToken(microsoftTokens.access_token)

    // Step 3: Get XSTS token with user info
    const xsts = await getXstsToken(userToken)

    // Step 4: Get user hash from XSTS for API calls
    const userHashResponse = await fetch('https://xsts.auth.xboxlive.com/xsts/authorize', {
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
    const userHashData = await userHashResponse.json()
    const userHash = userHashData.DisplayClaims?.xui?.[0]?.uhs || ''

    // Step 5: Get full profile
    const profile = await getXboxProfile(xsts.token, userHash, xsts.xuid)

    const displayName = profile?.gamertag || xsts.gamertag || xsts.xuid
    const avatarUrl = profile?.avatarUrl || null

    // Step 6: Save to database
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(`${returnUrl}/login?error=not_authenticated`)
    }

    const { error: dbError } = await supabase
      .from('connected_accounts')
      .upsert({
        user_id: user.id,
        provider: 'xbox',
        external_user_id: xsts.xuid,
        display_name: displayName,
        avatar_url: avatarUrl,
        access_token: microsoftTokens.access_token, // Microsoft OAuth token for Xbox auth
        refresh_token: microsoftTokens.refresh_token, // For token refresh
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,provider',
      })

    if (dbError) {
      console.error('Failed to save Xbox account:', dbError)
      return NextResponse.redirect(`${returnUrl}/profile?error=save_failed`)
    }

    // Auto-sync library after connecting
    return NextResponse.redirect(`${returnUrl}/api/sync/xbox`)
  } catch (err) {
    console.error('Xbox auth error:', err)
    return NextResponse.redirect(`${returnUrl}/profile?error=xbox_auth_error`)
  }
}
