import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = await createClient()

  // Sign out from Supabase (clears server-side session)
  await supabase.auth.signOut()

  // Clear all auth-related cookies
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  // Create response that redirects to login
  const response = NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'https://patchpulse.app'))

  // Clear all cookies in the response
  for (const cookie of allCookies) {
    response.cookies.set(cookie.name, '', {
      path: '/',
      expires: new Date(0),
    })
  }

  // Explicitly clear known auth cookies
  const authCookies = [
    'patchpulse-auth',
    'patchpulse-guest',
    'patchpulse-was-verified',
    'patchpulse-native-app',
  ]

  for (const name of authCookies) {
    response.cookies.set(name, '', {
      path: '/',
      expires: new Date(0),
    })
  }

  return response
}
