'use client'

import { LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { disableGuestMode } from '@/lib/guest'

export function GuestSignInButton() {
  const router = useRouter()

  const handleSignIn = () => {
    disableGuestMode()
    router.push('/login')
  }

  return (
    <button
      onClick={handleSignIn}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
    >
      <LogIn className="w-4 h-4" />
      Sign In
    </button>
  )
}
