import { createClient } from '@/lib/supabase/server'
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
    const supabase = await createClient()

    // Exchange code for session - this sets auth cookies
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      // Success - redirect to reset password page
      // The session is now stored in cookies
      return NextResponse.redirect(new URL('/reset-password?verified=true', origin))
    }

    console.error('[Recovery] Code exchange failed:', exchangeError.message)
    const errorUrl = new URL('/forgot-password', origin)
    errorUrl.searchParams.set('error', 'Reset link has expired. Please request a new one.')
    return NextResponse.redirect(errorUrl)
  }

  // No code provided
  const errorUrl = new URL('/forgot-password', origin)
  errorUrl.searchParams.set('error', 'Invalid reset link. Please request a new one.')
  return NextResponse.redirect(errorUrl)
}
