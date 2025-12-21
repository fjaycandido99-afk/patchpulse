import { NextResponse } from 'next/server'

export async function GET() {
  const returnUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const callbackUrl = `${returnUrl}/api/auth/steam/callback`

  // Steam OpenID 2.0 parameters
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': callbackUrl,
    'openid.realm': returnUrl,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  })

  const steamLoginUrl = `https://steamcommunity.com/openid/login?${params.toString()}`

  return NextResponse.redirect(steamLoginUrl)
}
