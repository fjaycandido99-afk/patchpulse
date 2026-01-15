'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Refresh token 5 minutes before expiry
const REFRESH_MARGIN_MS = 5 * 60 * 1000

export function SessionKeeper() {
  const router = useRouter()
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Schedule a token refresh before it expires
    const scheduleRefresh = (expiresAt: number) => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }

      const now = Date.now()
      const expiresAtMs = expiresAt * 1000
      const refreshAt = expiresAtMs - REFRESH_MARGIN_MS

      if (refreshAt > now) {
        const delay = refreshAt - now
        console.log(`[SessionKeeper] Scheduling token refresh in ${Math.round(delay / 1000 / 60)} minutes`)

        refreshTimerRef.current = setTimeout(async () => {
          console.log('[SessionKeeper] Refreshing token...')
          const { data, error } = await supabase.auth.refreshSession()

          if (error || !data.session) {
            console.error('[SessionKeeper] Failed to refresh session:', error)
            // Don't redirect here - let the middleware/NativeAuthGuard handle it
            return
          }

          console.log('[SessionKeeper] Token refreshed successfully')
          // Schedule next refresh
          if (data.session.expires_at) {
            scheduleRefresh(data.session.expires_at)
          }
        }, delay)
      }
    }

    // Initial session check and schedule
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.expires_at) {
        scheduleRefresh(session.expires_at)
      }
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[SessionKeeper] Auth state changed:', event)

      if (event === 'SIGNED_OUT') {
        if (refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current)
        }
        // Clear was-verified and redirect to login
        localStorage.removeItem('patchpulse-was-verified')
        router.replace('/login')
        return
      }

      if (event === 'TOKEN_REFRESHED' && session?.expires_at) {
        console.log('[SessionKeeper] Token was refreshed, scheduling next refresh')
        scheduleRefresh(session.expires_at)
      }

      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.expires_at) {
        // Mark user as verified
        localStorage.setItem('patchpulse-was-verified', 'true')
        scheduleRefresh(session.expires_at)
      }
    })

    initSession()

    return () => {
      subscription.unsubscribe()
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
    }
  }, [router])

  // Also refresh on visibility change (when user returns to app)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('[SessionKeeper] App became visible, checking session...')
        const supabase = createClient()
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error || !session) {
          console.log('[SessionKeeper] No valid session on visibility change')
          return
        }

        // Check if token is close to expiring
        const now = Date.now()
        const expiresAtMs = (session.expires_at || 0) * 1000

        if (expiresAtMs - now < REFRESH_MARGIN_MS) {
          console.log('[SessionKeeper] Token expiring soon, refreshing...')
          await supabase.auth.refreshSession()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return null
}
