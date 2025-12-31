import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Handle errors from Supabase
  if (error) {
    const errorUrl = new URL('/auth/error', origin)
    errorUrl.searchParams.set('error', error)
    if (error_description) {
      errorUrl.searchParams.set('message', error_description)
    }
    return NextResponse.redirect(errorUrl)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      // Check if user has completed onboarding
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()

        // Redirect to onboarding if not completed, otherwise home
        const redirectTo = profile?.onboarding_completed ? '/home' : '/onboarding'
        return NextResponse.redirect(new URL(redirectTo, origin))
      }

      return NextResponse.redirect(new URL(next, origin))
    }
  }

  // If no code or exchange failed, redirect to error page
  return NextResponse.redirect(new URL('/auth/error?error=auth_error&message=Could not verify email', origin))
}
