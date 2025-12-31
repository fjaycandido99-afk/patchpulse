import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RiotAccount = {
  puuid: string
  gameName: string
  tagLine: string
}

async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
  const clientId = process.env.RIOT_CLIENT_ID!
  const clientSecret = process.env.RIOT_CLIENT_SECRET!

  const response = await fetch('https://auth.riotgames.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get Riot token: ${error}`)
  }

  const data = await response.json()
  return data.access_token
}

async function getRiotAccount(accessToken: string): Promise<RiotAccount> {
  const response = await fetch('https://americas.api.riotgames.com/riot/account/v1/accounts/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get Riot account info')
  }

  return response.json()
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const returnUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const redirectUri = `${returnUrl}/api/auth/riot/callback`

  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${returnUrl}/profile?error=riot_auth_denied`)
  }

  if (!code) {
    return NextResponse.redirect(`${returnUrl}/profile?error=riot_auth_failed`)
  }

  try {
    // Exchange code for access token
    const accessToken = await exchangeCodeForToken(code, redirectUri)

    // Get Riot account info (PUUID, gameName, tagLine)
    const account = await getRiotAccount(accessToken)

    // Save to database
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(`${returnUrl}/login?error=not_authenticated`)
    }

    const displayName = `${account.gameName}#${account.tagLine}`

    const { error: dbError } = await supabase
      .from('connected_accounts')
      .upsert({
        user_id: user.id,
        provider: 'riot',
        external_user_id: account.puuid,
        display_name: displayName,
        metadata: {
          gameName: account.gameName,
          tagLine: account.tagLine,
          puuid: account.puuid,
        },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,provider',
      })

    if (dbError) {
      console.error('Failed to save Riot account:', dbError)
      return NextResponse.redirect(`${returnUrl}/profile?error=save_failed`)
    }

    // Auto-sync stats after connecting
    return NextResponse.redirect(`${returnUrl}/api/sync/riot`)
  } catch (err) {
    console.error('Riot auth error:', err)
    return NextResponse.redirect(`${returnUrl}/profile?error=riot_auth_error`)
  }
}
