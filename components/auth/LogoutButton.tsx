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
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      // Clear all auth-related local storage and cookies
      localStorage.removeItem('patchpulse-auth')
      localStorage.removeItem('patchpulse-biometric')
      localStorage.removeItem('patchpulse-was-verified')
      sessionStorage.removeItem('patchpulse-guest')
      // Clear was-verified cookie
      document.cookie = 'patchpulse-was-verified=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'patchpulse-guest=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchUser = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      // Clear all auth-related local storage and cookies
      localStorage.removeItem('patchpulse-auth')
      localStorage.removeItem('patchpulse-biometric')
      localStorage.removeItem('patchpulse-was-verified')
      sessionStorage.removeItem('patchpulse-guest')
      // Clear was-verified cookie
      document.cookie = 'patchpulse-was-verified=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'patchpulse-guest=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Switch user failed:', error)
    } finally {
      setIsLoading(false)
    }
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
