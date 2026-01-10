'use client'

import { useState, useEffect, useRef } from 'react'

type ScrollDirection = 'up' | 'down' | null

export function useScrollDirection(threshold = 5) {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null)
  const [isAtTop, setIsAtTop] = useState(true)
  const lastScrollY = useRef(0)
  const lastDirection = useRef<ScrollDirection>(null)

  useEffect(() => {
    let ticking = false

    const updateScrollDirection = () => {
      const scrollY = window.scrollY

      // Always show when at top
      if (scrollY < 10) {
        setIsAtTop(true)
        if (lastDirection.current !== null) {
          setScrollDirection(null)
          lastDirection.current = null
        }
        lastScrollY.current = scrollY
        ticking = false
        return
      }

      setIsAtTop(false)

      const diff = scrollY - lastScrollY.current

      // Only update direction if we've scrolled more than threshold
      if (diff > threshold) {
        // Scrolling down
        if (lastDirection.current !== 'down') {
          setScrollDirection('down')
          lastDirection.current = 'down'
        }
        lastScrollY.current = scrollY
      } else if (diff < -threshold) {
        // Scrolling up
        if (lastDirection.current !== 'up') {
          setScrollDirection('up')
          lastDirection.current = 'up'
        }
        lastScrollY.current = scrollY
      }

      ticking = false
    }

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection)
        ticking = true
      }
    }

    // Set initial values
    lastScrollY.current = window.scrollY
    setIsAtTop(window.scrollY < 10)

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [threshold])

  // Header/nav should be visible when scrolling up, at top, or direction is null
  const showBars = scrollDirection !== 'down' || isAtTop

  return {
    scrollDirection,
    isAtTop,
    showHeader: showBars,
    showBottomNav: showBars,
  }
}
