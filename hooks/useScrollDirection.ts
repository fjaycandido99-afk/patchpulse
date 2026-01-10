'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

type ScrollDirection = 'up' | 'down' | null

export function useScrollDirection(threshold = 10) {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null)
  const [isAtTop, setIsAtTop] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  const updateScrollDirection = useCallback(() => {
    const scrollY = window.scrollY

    // Always show when at top
    if (scrollY < 50) {
      setIsAtTop(true)
      setScrollDirection(null)
      lastScrollY.current = scrollY
      ticking.current = false
      return
    }

    setIsAtTop(false)

    const diff = scrollY - lastScrollY.current

    // Only update direction if we've scrolled more than threshold
    if (Math.abs(diff) > threshold) {
      const newDirection = diff > 0 ? 'down' : 'up'
      setScrollDirection(newDirection)
      lastScrollY.current = scrollY
    }

    ticking.current = false
  }, [threshold])

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection)
        ticking.current = true
      }
    }

    // Set initial values
    lastScrollY.current = window.scrollY
    setIsAtTop(window.scrollY < 50)

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [updateScrollDirection])

  // Header should be visible when scrolling up or at top
  const showHeader = scrollDirection !== 'down' || isAtTop
  // Bottom nav should be visible when scrolling up or at top
  const showBottomNav = scrollDirection !== 'down' || isAtTop

  return {
    scrollDirection,
    isAtTop,
    showHeader,
    showBottomNav,
  }
}
