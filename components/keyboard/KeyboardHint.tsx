'use client'

import { useState, useEffect } from 'react'
import { Keyboard } from 'lucide-react'

export function KeyboardHint() {
  const [isVisible, setIsVisible] = useState(false)
  const [isBrowser, setIsBrowser] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if we're in a browser (not Capacitor native app)
    const isNative = typeof window !== 'undefined' &&
      (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    setIsBrowser(!isNative)

    // Check if user has already dismissed or used shortcuts
    const hasSeenHint = localStorage.getItem('keyboard-hint-dismissed')
    if (hasSeenHint) {
      setIsDismissed(true)
      return
    }

    // Show hint after a delay
    const showTimer = setTimeout(() => {
      setIsVisible(true)
    }, 3000)

    // Auto-hide after 15 seconds if not interacted
    const hideTimer = setTimeout(() => {
      setIsVisible(false)
    }, 18000)

    // Listen for ? key to dismiss permanently
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?') {
        localStorage.setItem('keyboard-hint-dismissed', 'true')
        setIsDismissed(true)
        setIsVisible(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Don't render on native apps or if dismissed
  if (!isBrowser || isDismissed) {
    return null
  }

  const handleDismiss = () => {
    localStorage.setItem('keyboard-hint-dismissed', 'true')
    setIsDismissed(true)
    setIsVisible(false)
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 hidden md:flex items-center gap-2 px-3 py-2 rounded-full bg-zinc-800/90 border border-zinc-700/50 backdrop-blur-sm shadow-lg transition-all duration-500 ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <Keyboard className="w-4 h-4 text-zinc-400" />
      <span className="text-sm text-zinc-300">
        Press <kbd className="px-1.5 py-0.5 mx-0.5 rounded bg-zinc-700 text-zinc-200 font-mono text-xs">?</kbd> for shortcuts
      </span>
      <button
        onClick={handleDismiss}
        className="ml-1 p-1 rounded-full hover:bg-zinc-700/50 text-zinc-500 hover:text-zinc-300 transition-colors"
        aria-label="Dismiss hint"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
