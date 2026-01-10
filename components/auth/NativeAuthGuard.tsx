'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    const checkAuth = async () => {
      // Only run on native platform
      if (!isNativePlatform()) {
        setIsAuthed(true)
        setIsChecking(false)
        return
      }

      const supabase = createClient()

      // First check current session
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setIsAuthed(true)
        setIsChecking(false)
        return
      }

      // Try to restore from localStorage
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

      // Check for guest mode
      const isGuest = localStorage.getItem('patchpulse-guest') === 'true'
      if (isGuest) {
        setIsAuthed(true)
        setIsChecking(false)
        return
      }

      // No valid session, redirect to login
      router.replace('/login')
    }

    checkAuth()
  }, [router])

  if (isChecking && isNativePlatform()) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthed && isNativePlatform()) {
    return null
  }

  return <>{children}</>
}
