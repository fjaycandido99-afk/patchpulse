'use client'

import { useState, useEffect } from 'react'
import { WifiOff, X } from 'lucide-react'

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check initial state
    setIsOffline(!navigator.onLine)

    const handleOnline = () => {
      setIsOffline(false)
      setDismissed(false)
    }

    const handleOffline = () => {
      setIsOffline(true)
      setDismissed(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline || dismissed) return null

  return (
    <div className="fixed top-0 inset-x-0 z-[100] safe-area-pt">
      <div className="bg-amber-500/95 backdrop-blur-sm px-4 py-2.5">
        <div className="flex items-center justify-center gap-2 text-amber-950">
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">
            You&apos;re offline. Some features may not work.
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="ml-2 p-1 rounded hover:bg-amber-600/20 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
