'use client'

import { useState, useRef, useCallback, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

type PullToRefreshProps = {
  children: ReactNode
  onRefresh?: () => Promise<void>
  threshold?: number
  disabled?: boolean
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  disabled = false,
}: PullToRefreshProps) {
  const router = useRouter()
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const isPullingRef = useRef(false)
  const startYRef = useRef(0)
  const currentDistanceRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const canPull = useCallback(() => {
    // Check if we're at the top of the page
    const scrollTop = Math.max(
      window.scrollY,
      document.documentElement.scrollTop,
      document.body.scrollTop
    )
    return scrollTop <= 5
  }, [])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    setPullDistance(threshold * 0.6)

    try {
      if (onRefresh) {
        await onRefresh()
      } else {
        router.refresh()
        await new Promise((resolve) => setTimeout(resolve, 800))
      }
    } finally {
      setIsRefreshing(false)
      setPullDistance(0)
    }
  }, [onRefresh, router, threshold])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: globalThis.TouchEvent) => {
      if (disabled || isRefreshing) return
      if (!canPull()) return

      startYRef.current = e.touches[0].clientY
      isPullingRef.current = true
      currentDistanceRef.current = 0
    }

    const handleTouchMove = (e: globalThis.TouchEvent) => {
      if (!isPullingRef.current || disabled || isRefreshing) return

      const currentY = e.touches[0].clientY
      const diff = currentY - startYRef.current

      if (diff > 0 && canPull()) {
        // Apply resistance
        const resistance = 0.5
        const distance = Math.min(diff * resistance, threshold * 1.5)
        currentDistanceRef.current = distance
        setPullDistance(distance)

        // Prevent scrolling while pulling
        if (distance > 10) {
          e.preventDefault()
        }
      } else if (diff < 0) {
        // User is scrolling up, cancel pull
        isPullingRef.current = false
        setPullDistance(0)
      }
    }

    const handleTouchEnd = () => {
      if (!isPullingRef.current) return

      isPullingRef.current = false

      if (currentDistanceRef.current >= threshold && !isRefreshing) {
        handleRefresh()
      } else {
        setPullDistance(0)
      }
    }

    // Use passive: false to allow preventDefault
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [disabled, isRefreshing, canPull, threshold, handleRefresh])

  const progress = Math.min(pullDistance / threshold, 1)
  const isReady = progress >= 1

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center overflow-hidden pointer-events-none z-50"
        style={{
          height: pullDistance,
          top: 0,
          transform: `translateY(-${Math.max(0, threshold * 0.6 - pullDistance)}px)`,
        }}
      >
        <div
          className={`
            flex flex-col items-center gap-1 transition-opacity duration-200
            ${pullDistance > 20 ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <div
            className={`
              flex items-center justify-center w-8 h-8 rounded-full
              bg-white/10 border border-white/20 backdrop-blur-sm
              ${isRefreshing ? 'pull-spinner' : ''}
            `}
            style={{
              transform: isRefreshing ? undefined : `rotate(${progress * 180}deg)`,
            }}
          >
            <RefreshCw className="w-4 h-4 text-primary" />
          </div>

          <span className="text-xs text-muted-foreground">
            {isRefreshing ? 'Refreshing...' : isReady ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Content with pull offset */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  )
}
