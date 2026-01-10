'use client'

import { useScrollDirection } from '@/hooks/useScrollDirection'

export function MainContent({ children }: { children: React.ReactNode }) {
  const { showHeader } = useScrollDirection()

  return (
    <div
      className={`h-full px-4 pb-6 md:pt-6 md:px-8 lg:px-12 w-full overflow-x-hidden transition-[padding] duration-300 ${
        showHeader ? 'pt-20' : 'pt-4'
      } md:pt-6`}
    >
      {children}
    </div>
  )
}
