'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// Check if running in iOS WKWebView (native app)
function isIOSWebView(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent
  // iOS WKWebView: has Mobile and AppleWebKit but NOT "Safari/"
  return /iPhone|iPad/.test(ua) && ua.includes('AppleWebKit') && !ua.includes('Safari/')
}

export function NativeAuthGuard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const setupAuth = async () => {
      // Only do special handling for iOS WKWebView
      if (!isIOSWebView()) {
        return
      }

      // Check if we have stored auth in localStorage
      const storedSession = localStorage.getItem('patchpulse-auth')
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession)
          if (parsed?.refresh_token) {
            // Try to set the session in Supabase client
            const supabase = createClient()
            const { error } = await supabase.auth.setSession({
              access_token: parsed.access_token || '',
              refresh_token: parsed.refresh_token,
            })

            if (!error) {
              console.log('[NativeAuthGuard] Session restored from localStorage')
            }
          }
        } catch (e) {
          console.error('[NativeAuthGuard] Failed to restore session:', e)
        }
      }
    }

    setupAuth()
  }, [])

  // Always render children to avoid hydration mismatch
  // Auth restoration happens in background
  return <>{children}</>
}
