'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppStoreBadge } from '@/components/AppStoreBadge'
import { createClient } from '@/lib/supabase/client'

export default function LandingPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [showSkip, setShowSkip] = useState(false)

  const skipAuth = () => {
    localStorage.removeItem('patchpulse-auth')
    setChecking(false)
  }

  useEffect(() => {
    // Show skip button after 3 seconds
    const skipTimer = setTimeout(() => setShowSkip(true), 3000)

    const checkAuth = async () => {
      try {
        // Check for guest mode first (fastest check)
        const isGuest = localStorage.getItem('patchpulse-guest') === 'true'
        if (isGuest) {
          router.replace('/home')
          return
        }

        // Check if native app
        const isNative = !!(window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()

        // For native: check localStorage for stored session
        const storedSession = localStorage.getItem('patchpulse-auth')
        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession)
            if (parsed?.refresh_token) {
              const supabase = createClient()
              // Add timeout for refresh to prevent hanging
              const refreshPromise = supabase.auth.refreshSession({
                refresh_token: parsed.refresh_token,
              })
              const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Refresh timeout')), 4000)
              )

              const { data, error } = await Promise.race([refreshPromise, timeoutPromise]) as any
              if (data?.session && !error) {
                router.replace('/home')
                return
              }
            }
          } catch (e) {
            console.error('Auth refresh failed:', e)
            localStorage.removeItem('patchpulse-auth')
          }
        }

        // For web only: check session from cookies
        if (!isNative && !storedSession) {
          try {
            const supabase = createClient()
            const sessionPromise = supabase.auth.getSession()
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Session timeout')), 4000)
            )
            const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any
            if (session) {
              router.replace('/home')
              return
            }
          } catch (e) {
            console.error('Session check failed:', e)
          }
        }

        setChecking(false)
      } catch (e) {
        console.error('Auth check error:', e)
        setChecking(false)
      }
    }

    // Add overall timeout to prevent black screen forever
    const timeout = setTimeout(() => {
      setChecking(false)
    }, 6000)

    checkAuth().finally(() => clearTimeout(timeout))

    return () => {
      clearTimeout(skipTimer)
      clearTimeout(timeout)
    }
  }, [router])

  // Show loading while checking auth
  if (checking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        {showSkip && (
          <button
            onClick={skipAuth}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Taking too long? Tap to skip
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12">
      <div className="flex max-w-2xl flex-col items-center text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Your Gaming Command Center
        </h1>

        <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
          Stay on top of the latest patch notes, track gaming news, and manage your backlog—all in one place.
          Never miss an update for your favorite games.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-input bg-background px-8 py-3 text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Log In
          </Link>
        </div>

        {/* App Store Download - hidden in native app */}
        <AppStoreBadge />
      </div>
    </div>
  )
}
