'use client'

import { useState, useEffect, useRef } from 'react'

type ScrollDirection = 'up' | 'down' | null

export function useScrollDirection(threshold = 5) {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null)
  const [isAtTop, setIsAtTop] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    lastScrollY.current = window.scrollY

    const updateScrollDirection = () => {
      const scrollY = window.scrollY
      const diff = scrollY - lastScrollY.current

      // Update isAtTop
      setIsAtTop(scrollY < 10)

      // If at top, reset direction
      if (scrollY < 10) {
        setScrollDirection(null)
        lastScrollY.current = scrollY
        ticking.current = false
        return
      }

      // Only update if scrolled more than threshold
      if (diff > threshold) {
        setScrollDirection('down')
      } else if (diff < -threshold) {
        setScrollDirection('up')
      }

      lastScrollY.current = scrollY
      ticking.current = false
    }

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection)
        ticking.current = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  const showBars = scrollDirection !== 'down' || isAtTop

  return {
    scrollDirection,
    isAtTop,
    showHeader: showBars,
    showBottomNav: showBars,
  }
}
