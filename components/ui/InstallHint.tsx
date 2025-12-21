'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const STORAGE_KEY = 'patchpulse-install-hint-dismissed'

export function InstallHint() {
  const [visible, setVisible] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const isDismissed = localStorage.getItem(STORAGE_KEY) === 'true'
    if (isDismissed) return

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && window.navigator.standalone)
    if (isStandalone) return

    const userAgent = window.navigator.userAgent.toLowerCase()
    const isMobile = /iphone|ipad|ipod|android/.test(userAgent)
    if (!isMobile) return

    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIOSDevice)
    setVisible(true)
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:hidden">
      <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-zinc-900/95 p-3 shadow-lg backdrop-blur-sm">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">Install PatchPulse</p>
          <p className="mt-0.5 text-xs text-zinc-400">
            {isIOS ? (
              <>
                Tap{' '}
                <span className="inline-flex items-center">
                  <svg
                    className="inline h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </span>{' '}
                then &quot;Add to Home Screen&quot;
              </>
            ) : (
              <>Tap menu, then &quot;Install app&quot; or &quot;Add to Home Screen&quot;</>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="flex-shrink-0 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
