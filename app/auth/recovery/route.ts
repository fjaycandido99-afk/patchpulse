import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Handle errors from Supabase
  if (error) {
    const errorUrl = new URL('/forgot-password', origin)
    errorUrl.searchParams.set('error', error_description || error)
    return NextResponse.redirect(errorUrl)
  }

  if (code) {
    // Pass code to client for exchange (PKCE verifier is stored client-side)
    const resetUrl = new URL('/reset-password', origin)
    resetUrl.searchParams.set('code', code)
    return NextResponse.redirect(resetUrl)
  }

  // No code provided
  const errorUrl = new URL('/forgot-password', origin)
  errorUrl.searchParams.set('error', 'Invalid reset link. Please request a new one.')
  return NextResponse.redirect(errorUrl)
}
