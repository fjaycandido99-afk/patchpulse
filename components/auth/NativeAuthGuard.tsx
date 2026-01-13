'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Check if running in native app
function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
}

export function NativeAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)
  const [isNative, setIsNative] = useState(false)

  // Clear all auth data and redirect to login
  const clearAuthAndRedirect = useCallback(() => {
    localStorage.removeItem('patchpulse-auth')
    localStorage.removeItem('patchpulse-biometric')
    setIsAuthed(false)
    setIsChecking(false)
    router.replace('/login')
  }, [router])

  useEffect(() => {
    // Check if native on client side only
    const native = isNativePlatform()
    setIsNative(native)

    const checkAuth = async () => {
      // Only run client-side auth for native Capacitor apps
      // Web (including iOS Safari) is handled by server middleware
      if (!native) {
        setIsAuthed(true)
        setIsChecking(false)
        return
      }

      try {
        const supabase = createClient()

        // Try to restore session from localStorage FIRST (prioritize real auth over guest)
        const storedSession = localStorage.getItem('patchpulse-auth')
        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession)
            if (parsed?.refresh_token) {
              // Add timeout to prevent hanging
              const refreshPromise = supabase.auth.refreshSession({
                refresh_token: parsed.refresh_token,
              })
              const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Refresh timeout')), 4000)
              )

              const { data, error } = await Promise.race([refreshPromise, timeoutPromise]) as any
              
              if (data?.session && !error) {
                // Update stored session with new tokens
                localStorage.setItem('patchpulse-auth', JSON.stringify({
                  access_token: data.session.access_token,
                  refresh_token: data.session.refresh_token,
                  expires_at: data.session.expires_at,
                }))
                setIsAuthed(true)
                setIsChecking(false)
                return
              } else {
                // Refresh failed - clear bad data
                console.log('Session refresh failed, clearing auth data')
                localStorage.removeItem('patchpulse-auth')
              }
            }
          } catch (e) {
            // Invalid stored session - clear it
            console.error('Auth parse/refresh error:', e)
            localStorage.removeItem('patchpulse-auth')
          }
        }

        // Try biometric credentials as fallback
        const biometricData = localStorage.getItem('patchpulse-biometric')
        if (biometricData) {
          try {
            const parsed = JSON.parse(biometricData)
            if (parsed?.refreshToken) {
              const { data, error } = await supabase.auth.refreshSession({
                refresh_token: parsed.refreshToken,
              })
              if (data?.session && !error) {
                // Save new session
                localStorage.setItem('patchpulse-auth', JSON.stringify({
                  access_token: data.session.access_token,
                  refresh_token: data.session.refresh_token,
                  expires_at: data.session.expires_at,
                }))
                setIsAuthed(true)
                setIsChecking(false)
                return
              }
            }
          } catch {
            // Invalid biometric data
            localStorage.removeItem('patchpulse-biometric')
          }
        }

        // No valid session found - check for guest mode as last resort
        const isGuest = localStorage.getItem('patchpulse-guest') === 'true'
        if (isGuest) {
          setIsAuthed(true)
          setIsChecking(false)
          return
        }

        // No session and not guest - redirect to login
        clearAuthAndRedirect()
      } catch (err) {
        console.error('Auth check failed:', err)
        clearAuthAndRedirect()
      }
    }

    // Timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Auth check timed out')
      clearAuthAndRedirect()
    }, 5000)

    checkAuth().finally(() => clearTimeout(timeout))
  }, [router, clearAuthAndRedirect])

  // Show loading for native apps while checking auth
  if (isChecking && isNative) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Don't render until auth check complete for native apps
  if (!isAuthed && isNative) {
    return null
  }

  return <>{children}</>
}
