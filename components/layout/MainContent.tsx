'use client'

import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { useEffect, useState } from 'react'

export function MainContent({ children }: { children: React.ReactNode }) {
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

  // Fixed padding on mobile - matches header height exactly (safe-area + py-3 + content + py-3)
  // Header slides in/out over this fixed space
  const mobilePadding = 'calc(3rem + env(safe-area-inset-top, 0px))'

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
