'use client'

import { useState, useEffect } from 'react'

type ScrollDirection = 'up' | 'down' | null

export function useScrollDirection(threshold = 10) {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null)
  const [isAtTop, setIsAtTop] = useState(true)

  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const updateScrollDirection = () => {
      const scrollY = window.scrollY
      const diff = scrollY - lastScrollY

      // Update isAtTop
      setIsAtTop(scrollY < 10)

      // If at top, reset direction
      if (scrollY < 10) {
        setScrollDirection(null)
        lastScrollY = scrollY
        ticking = false
        return
      }

      // Only update if scrolled more than threshold
      if (diff > threshold) {
        // Scrolling down
        setScrollDirection('down')
      } else if (diff < -threshold) {
        // Scrolling up
        setScrollDirection('up')
      }

      // Always update lastScrollY for responsive tracking
      lastScrollY = scrollY
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  // Header/nav visible when scrolling up, at top, or direction is null
  const showBars = scrollDirection !== 'down' || isAtTop

  return {
    scrollDirection,
    isAtTop,
    showHeader: showBars,
    showBottomNav: showBars,
  }
}
