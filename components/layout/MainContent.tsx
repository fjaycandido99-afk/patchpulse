'use client'

import { useScrollDirection } from '@/hooks/useScrollDirection'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { useEffect, useState } from 'react'

export function MainContent({ children }: { children: React.ReactNode }) {
  const { showHeader } = useScrollDirection()
  const [isMobile, setIsMobile] = useState(false)
  const [isNative, setIsNative] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Check if native app
    const native = !!(window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    setIsNative(native)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Only apply dynamic padding on mobile
  const mobilePadding = showHeader
    ? 'calc(5rem + env(safe-area-inset-top, 0px))' // header + safe area when visible
    : 'max(env(safe-area-inset-top, 0px), 0.5rem)' // safe area when hidden

  const content = (
    <div
      className="h-full pb-6 md:pt-6 md:px-8 lg:px-12 w-full"
      style={{
        paddingTop: isMobile ? mobilePadding : undefined,
      }}
    >
      {children}
    </div>
  )

  // Only enable pull to refresh on native mobile
  if (isNative && isMobile) {
    return <PullToRefresh>{content}</PullToRefresh>
  }

  return content
}
