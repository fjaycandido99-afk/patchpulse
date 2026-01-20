'use client'

import { LogOut, UserCircle } from 'lucide-react'

export function LogoutButton() {
  const handleLogout = () => {
    console.log('[Logout] Button clicked')
    // Clear all auth data immediately (synchronous)
    try {
      localStorage.clear() // Clear everything to be safe
      sessionStorage.clear()
    } catch (e) {
      console.error('Clear storage failed:', e)
    }

    // Clear ALL cookies including Supabase auth cookies
    document.cookie.split(';').forEach(c => {
      const name = c.split('=')[0].trim()
      // Clear with multiple path variations
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    })

    // Redirect to server-side logout endpoint that properly clears session
    window.location.replace('/api/auth/logout')
  }

  const handleSwitchUser = () => {
    console.log('[SwitchUser] Button clicked')
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch (e) {
      console.error('Clear storage failed:', e)
    }

    document.cookie.split(';').forEach(c => {
      const name = c.split('=')[0].trim()
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    })

    window.location.replace('/api/auth/logout')
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        type="button"
        onClick={handleSwitchUser}
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium transition-colors active:scale-95"
      >
        <UserCircle className="h-4 w-4" />
        Switch Account
      </button>
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-sm font-medium transition-colors active:scale-95"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  )
}
