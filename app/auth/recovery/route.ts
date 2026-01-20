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
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      // Successfully exchanged code, redirect to reset password page
      return NextResponse.redirect(new URL('/reset-password', origin))
    } else {
      // Code exchange failed - likely expired
      const errorUrl = new URL('/forgot-password', origin)
      errorUrl.searchParams.set('error', 'Reset link has expired. Please request a new one.')
      return NextResponse.redirect(errorUrl)
    }
  }

  // No code provided
  const errorUrl = new URL('/forgot-password', origin)
  errorUrl.searchParams.set('error', 'Invalid reset link. Please request a new one.')
  return NextResponse.redirect(errorUrl)
}
