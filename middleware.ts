import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Routes that require authentication
const protectedRoutes = ['/home', '/backlog', '/patches', '/news', '/videos', '/insights', '/bookmarks', '/deals', '/upcoming', '/releases', '/settings', '/notifications']

// Routes that should redirect to home if already authenticated
const authRoutes = ['/', '/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if this is a mobile app request (iOS WKWebView or Android WebView)
  const userAgent = request.headers.get('user-agent') || ''

  // iOS WKWebView: has Mobile and AppleWebKit but NOT "Safari/" (regular Safari has "Safari/xxx")
  const isIOSWebView = userAgent.includes('Mobile') &&
                       userAgent.includes('AppleWebKit') &&
                       !userAgent.includes('Safari/')

  // Android WebView: has "wv" in the user agent
  const isAndroidWebView = userAgent.includes('wv') && userAgent.includes('Android')

  // Check for existing native app cookie (set on first successful login)
  const hasNativeAppCookie = request.cookies.get('patchpulse-native-app')?.value === 'true'

  // Also treat ANY iPhone/iPad request as potential native app
  // This is a fallback since WKWebView detection can be unreliable

  // Only detect actual native apps (WKWebView/WebView) or those with native cookie
  // Don't treat all iOS devices as native - Safari mobile should work normally
  const isNativeApp = isIOSWebView || isAndroidWebView || hasNativeAppCookie

  // Create response to potentially modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // If detected as native app, set a persistent cookie for future requests
  if ((isIOSWebView || isAndroidWebView) && !hasNativeAppCookie) {
    response.cookies.set('patchpulse-native-app', 'true', {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })
  }

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Get user session
  const { data: { user } } = await supabase.auth.getUser()

  // If user has a valid session, clear any old guest cookies and mark them as "was verified"
  // This ensures logged-in users don't accidentally get treated as guests
  if (user) {
    const guestCookie = request.cookies.get('patchpulse-guest')
    if (guestCookie) {
      response.cookies.set('patchpulse-guest', '', {
        path: '/',
        expires: new Date(0),
      })
    }
    // Set a marker that this user was authenticated (used to prevent guest fallback on session expiry)
    const wasVerified = request.cookies.get('patchpulse-was-verified')
    if (!wasVerified) {
      response.cookies.set('patchpulse-was-verified', 'true', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      })
    }
  }

  // Check if accessing a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  // Check if accessing auth routes
  const isAuthRoute = authRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  // For native apps without a session, don't redirect - let client handle auth
  if (isNativeApp && !user && isProtectedRoute) {
    // Set cookie to tell layout this is a native app
    response.cookies.set('patchpulse-native-app', 'true', {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    })
    return response
  }

  // For web: redirect to login if accessing protected route without session
  if (!user && isProtectedRoute && !isNativeApp) {
    // Check if user was previously verified - if so, they should sign in again, not fall back to guest
    const wasVerified = request.cookies.get('patchpulse-was-verified')
    if (wasVerified) {
      // Previously authenticated user - clear the was-verified cookie and redirect to login
      const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
      redirectResponse.cookies.set('patchpulse-was-verified', '', {
        path: '/',
        expires: new Date(0),
      })
      // Also clear any stale guest cookies
      redirectResponse.cookies.set('patchpulse-guest', '', {
        path: '/',
        expires: new Date(0),
      })
      // Copy any Supabase cookies that were set
      response.cookies.getAll().forEach(cookie => {
        if (cookie.name.startsWith('sb-')) {
          redirectResponse.cookies.set(cookie.name, cookie.value)
        }
      })
      return redirectResponse
    }

    // Check for guest mode cookie (only for users who were never verified)
    const guestCookie = request.cookies.get('patchpulse-guest')
    if (!guestCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect to home if accessing auth routes while logged in
  if (user && isAuthRoute) {
    const redirectResponse = NextResponse.redirect(new URL('/home', request.url))
    // Copy Supabase cookies (including refreshed tokens) to redirect response
    response.cookies.getAll().forEach(cookie => {
      if (cookie.name.startsWith('sb-') || cookie.name.startsWith('patchpulse-')) {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      }
    })
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api).*)',
  ],
}
