import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.RIOT_CLIENT_ID
  const returnUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const redirectUri = `${returnUrl}/api/auth/riot/callback`

  if (!clientId) {
    return NextResponse.redirect(`${returnUrl}/profile?error=riot_not_configured`)
  }

  // Riot Sign On (RSO) OAuth URL
  const params = new URLSearchParams({
    redirect_uri: redirectUri,
    client_id: clientId,
    response_type: 'code',
    scope: 'openid',
  })

  const rsoUrl = `https://auth.riotgames.com/authorize?${params.toString()}`

  return NextResponse.redirect(rsoUrl)
}
