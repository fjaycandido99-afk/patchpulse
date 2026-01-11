'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Check if running in native app
function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
}

// Check if on iOS device (for fallback auth handling)
function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod/.test(navigator.userAgent)
}

export function NativeAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)
  const [isNative, setIsNative] = useState(false)

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

        // Try to restore from localStorage (skip getSession - it hangs in WKWebView)
        const storedSession = localStorage.getItem('patchpulse-auth')
        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession)
            if (parsed?.refresh_token) {
              const { data, error } = await supabase.auth.refreshSession({
                refresh_token: parsed.refresh_token,
              })
              if (data?.session && !error) {
                setIsAuthed(true)
                setIsChecking(false)
                return
              }
            }
          } catch {
            // Invalid stored session
          }
        }

        // Try to restore from biometric credentials
        const biometricData = localStorage.getItem('patchpulse-biometric')
        if (biometricData) {
          try {
            const parsed = JSON.parse(biometricData)
            if (parsed?.refreshToken) {
              const { data, error } = await supabase.auth.refreshSession({
                refresh_token: parsed.refreshToken,
              })
              if (data?.session && !error) {
                setIsAuthed(true)
                setIsChecking(false)
                return
              }
            }
          } catch {
            // Invalid biometric data
          }
        }

        // Check for guest mode
        const isGuest = localStorage.getItem('patchpulse-guest') === 'true'
        if (isGuest) {
          setIsAuthed(true)
          setIsChecking(false)
          return
        }

        // No valid session, redirect to login
        router.replace('/login')
      } catch (err) {
        console.error('Auth check failed:', err)
        router.replace('/login')
      } finally {
        setIsChecking(false)
      }
    }

    // Timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setIsChecking(false)
      router.replace('/login')
    }, 5000)

    checkAuth().finally(() => clearTimeout(timeout))
  }, [router])

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
