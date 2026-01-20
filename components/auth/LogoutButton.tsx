'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, UserCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)

    // Clear all auth-related local storage and cookies FIRST
    localStorage.removeItem('patchpulse-auth')
    localStorage.removeItem('patchpulse-biometric')
    localStorage.removeItem('patchpulse-was-verified')
    sessionStorage.removeItem('patchpulse-guest')
    document.cookie = 'patchpulse-was-verified=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'patchpulse-guest=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'patchpulse-native-app=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

    // Try to sign out from Supabase (may fail/hang in WKWebView)
    try {
      const supabase = createClient()
      // Add timeout to prevent hanging
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => setTimeout(() => reject('timeout'), 2000))
      ])
    } catch (error) {
      console.log('Supabase signOut skipped:', error)
    }

    // Hard redirect to ensure full page refresh
    window.location.href = '/login'
  }

  const handleSwitchUser = async () => {
    setIsLoading(true)

    // Clear all auth-related local storage and cookies FIRST
    localStorage.removeItem('patchpulse-auth')
    localStorage.removeItem('patchpulse-biometric')
    localStorage.removeItem('patchpulse-was-verified')
    sessionStorage.removeItem('patchpulse-guest')
    document.cookie = 'patchpulse-was-verified=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'patchpulse-guest=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'patchpulse-native-app=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

    // Try to sign out from Supabase (may fail/hang in WKWebView)
    try {
      const supabase = createClient()
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => setTimeout(() => reject('timeout'), 2000))
      ])
    } catch (error) {
      console.log('Supabase signOut skipped:', error)
    }

    // Hard redirect to ensure full page refresh
    window.location.href = '/login'
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={handleSwitchUser}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium transition-colors disabled:opacity-50"
      >
        <UserCircle className="h-4 w-4" />
        Switch Account
      </button>
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-sm font-medium transition-colors disabled:opacity-50"
      >
        <LogOut className="h-4 w-4" />
        {isLoading ? 'Signing out...' : 'Sign Out'}
      </button>
    </div>
  )
}
