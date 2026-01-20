import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Handle errors from Supabase
  if (error) {
    const errorUrl = new URL('/forgot-password', origin)
    errorUrl.searchParams.set('error', error_description || error)
    return NextResponse.redirect(errorUrl)
  }

  // Handle token_hash (non-PKCE flow)
  if (token_hash && type === 'recovery') {
    const resetUrl = new URL('/reset-password', origin)
    resetUrl.searchParams.set('token_hash', token_hash)
    resetUrl.searchParams.set('type', type)
    return NextResponse.redirect(resetUrl)
  }

  // Handle code (PKCE flow)
  if (code) {
    const resetUrl = new URL('/reset-password', origin)
    resetUrl.searchParams.set('code', code)
    return NextResponse.redirect(resetUrl)
  }

  // No code or token provided
  const errorUrl = new URL('/forgot-password', origin)
  errorUrl.searchParams.set('error', 'Invalid reset link. Please request a new one.')
  return NextResponse.redirect(errorUrl)
}
