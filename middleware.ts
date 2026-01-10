import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Routes that require authentication
const protectedRoutes = ['/home', '/backlog', '/patches', '/news', '/videos', '/insights', '/bookmarks', '/deals', '/upcoming', '/releases', '/settings', '/notifications']

// Routes that should redirect to home if already authenticated
const authRoutes = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if this is a native iOS/Android app request
  const userAgent = request.headers.get('user-agent') || ''
  const isNativeApp = userAgent.includes('Capacitor') ||
                      (userAgent.includes('Mobile') && userAgent.includes('AppleWebKit') && !userAgent.includes('Safari/'))

  // Create response to potentially modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
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

  // Check if accessing a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  // Check if accessing auth routes
  const isAuthRoute = authRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  // For native apps without a session, don't redirect from protected routes
  // Let client-side handle session restoration from localStorage
  if (isNativeApp && !user && isProtectedRoute) {
    // Set a header to indicate this is a native app request
    // The client can check this and handle auth
    response.headers.set('x-native-app', 'true')
    return response
  }

  // For web: redirect to login if accessing protected route without session
  if (!user && isProtectedRoute && !isNativeApp) {
    // Check for guest mode cookie
    const guestCookie = request.cookies.get('patchpulse-guest')
    if (!guestCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect to home if accessing auth routes while logged in
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/home', request.url))
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
