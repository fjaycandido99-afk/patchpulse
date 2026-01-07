'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState, useCallback, ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type SwipeableNewsProps = {
  children: ReactNode
  prevId: string | null
  nextId: string | null
}

export function SwipeableNews({ children, prevId, nextId }: SwipeableNewsProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [swiping, setSwiping] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)

  // Minimum swipe distance to trigger navigation (in pixels)
  const minSwipeDistance = 80

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setSwiping(true)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return
    const currentTouch = e.targetTouches[0].clientX
    setTouchEnd(currentTouch)

    const distance = touchStart - currentTouch
    if (Math.abs(distance) > 30) {
      setSwipeDirection(distance > 0 ? 'left' : 'right')
    } else {
      setSwipeDirection(null)
    }
  }, [touchStart])

  const onTouchEnd = useCallback(() => {
    setSwiping(false)
    setSwipeDirection(null)

    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && nextId) {
      // Swipe left = go to next (newer) article
      router.push(`/news/${nextId}`)
    } else if (isRightSwipe && prevId) {
      // Swipe right = go to previous (older) article
      router.push(`/news/${prevId}`)
    }
  }, [touchStart, touchEnd, prevId, nextId, router])

  const goToPrev = useCallback(() => {
    if (prevId) router.push(`/news/${prevId}`)
  }, [prevId, router])

  const goToNext = useCallback(() => {
    if (nextId) router.push(`/news/${nextId}`)
  }, [nextId, router])

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative"
    >
      {/* Swipe indicators - show during swipe */}
      {swiping && swipeDirection === 'right' && prevId && (
        <div className="fixed left-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
            <ChevronLeft className="w-6 h-6 text-primary" />
          </div>
        </div>
      )}
      {swiping && swipeDirection === 'left' && nextId && (
        <div className="fixed right-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
            <ChevronRight className="w-6 h-6 text-primary" />
          </div>
        </div>
      )}

      {/* Navigation arrows - always visible on mobile */}
      {prevId && (
        <button
          onClick={goToPrev}
          className="fixed left-2 bottom-24 z-40 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/80 transition-colors sm:hidden"
          aria-label="Previous article"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {nextId && (
        <button
          onClick={goToNext}
          className="fixed right-2 bottom-24 z-40 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/80 transition-colors sm:hidden"
          aria-label="Next article"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Swipe hint - show on first visit */}
      <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-40 sm:hidden pointer-events-none">
        <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-xs text-white/60 flex items-center gap-2">
          <ChevronLeft className="w-3 h-3" />
          <span>Swipe for more</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>

      {children}
    </div>
  )
}
