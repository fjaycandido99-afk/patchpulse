'use client'

import { useScrollDirection } from '@/hooks/useScrollDirection'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { useEffect, useState } from 'react'

export function MainContent({ children }: { children: React.ReactNode }) {
  const { showHeader } = useScrollDirection()
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isNative, setIsNative] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Check if native app
    const native = !!(window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    setIsNative(native)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Only apply dynamic padding on mobile after mount
  const mobilePadding = mounted && isMobile
    ? (showHeader
        ? 'calc(5rem + env(safe-area-inset-top, 0px))' // header + safe area when visible
        : 'max(env(safe-area-inset-top, 0px), 0.5rem)') // safe area when hidden
    : undefined

  const content = (
    <div
      className="h-full pb-6 md:pt-6 lg:px-2 xl:px-3 w-full"
      style={{
        paddingTop: mobilePadding,
      }}
    >
      {children}
    </div>
  )

  // Only enable pull to refresh on native mobile (after mount to avoid hydration mismatch)
  if (mounted && isNative && isMobile) {
    return <PullToRefresh>{content}</PullToRefresh>
  }

  return content
}
