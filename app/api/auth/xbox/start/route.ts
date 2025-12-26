import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.XBOX_CLIENT_ID
  const returnUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const callbackUrl = `${returnUrl}/api/auth/xbox/callback`

  if (!clientId) {
    return NextResponse.redirect(`${returnUrl}/profile?error=xbox_not_configured`)
  }

  // Microsoft OAuth 2.0 parameters for Xbox Live
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: callbackUrl,
    scope: 'XboxLive.signin XboxLive.offline_access',
    response_mode: 'query',
  })

  const authUrl = `https://login.live.com/oauth20_authorize.srf?${params.toString()}`

  return NextResponse.redirect(authUrl)
}
