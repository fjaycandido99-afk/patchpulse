'use client'

import { useScrollDirection } from '@/hooks/useScrollDirection'
import { useEffect, useState } from 'react'

export function MainContent({ children }: { children: React.ReactNode }) {
  const { showHeader } = useScrollDirection()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Only apply dynamic padding on mobile
  const mobilePadding = showHeader
    ? '5rem' // pt-20 when header visible
    : 'max(env(safe-area-inset-top, 0px), 0.5rem)' // safe area when hidden

  return (
    <div
      className="h-full px-4 pb-6 md:pt-6 md:px-8 lg:px-12 w-full overflow-x-hidden transition-[padding] duration-300"
      style={isMobile ? { paddingTop: mobilePadding } : undefined}
    >
      {children}
    </div>
  )
}
