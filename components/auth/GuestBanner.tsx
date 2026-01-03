'use client'

import Link from 'next/link'
import { X, Sparkles } from 'lucide-react'
import { useState } from 'react'

export function GuestBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="fixed top-[env(safe-area-inset-top,0)] md:top-0 inset-x-0 z-50 bg-gradient-to-r from-primary/90 to-violet-600/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-white">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">You're browsing as a guest.</span>
            <span className="hidden sm:inline text-white/80">Create an account to follow games and save your progress.</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/signup"
              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary hover:bg-white/90 transition-colors"
            >
              Sign Up Free
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
