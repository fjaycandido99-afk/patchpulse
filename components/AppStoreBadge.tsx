'use client'

import { useEffect, useState } from 'react'

export function AppStoreBadge() {
  const [isNative, setIsNative] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isNativePlatform =
      typeof window !== 'undefined' &&
      (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    setIsNative(!!isNativePlatform)
  }, [])

  // Don't render on native app or until mounted (avoids hydration mismatch)
  if (!mounted || isNative) {
    return null
  }

  return (
    <div className="mt-8">
      <a
        href="https://apps.apple.com/app/id6757092034"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block transition-opacity hover:opacity-80"
      >
        <img
          src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
          alt="Download on the App Store"
          className="h-12"
        />
      </a>
    </div>
  )
}
