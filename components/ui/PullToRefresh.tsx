'use client'

import { useState, useRef, useCallback, ReactNode, TouchEvent } from 'react'
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
  const [isPulling, setIsPulling] = useState(false)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const canPull = useCallback(() => {
    // Only allow pull when scrolled to top
    return window.scrollY === 0
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing || !canPull()) return
    startY.current = e.touches[0].clientY
    setIsPulling(true)
  }, [disabled, isRefreshing, canPull])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY.current

    // Only track downward pulls
    if (diff > 0 && canPull()) {
      // Apply resistance - the further you pull, the harder it gets
      const resistance = 0.5
      const distance = Math.min(diff * resistance, threshold * 1.5)
      setPullDistance(distance)

      // Prevent default scroll when pulling
      if (distance > 10) {
        e.preventDefault()
      }
    }
  }, [isPulling, disabled, isRefreshing, canPull, threshold])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return

    setIsPulling(false)

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(threshold * 0.6) // Keep indicator visible during refresh

      try {
        if (onRefresh) {
          await onRefresh()
        } else {
          // Default: use Next.js router refresh
          router.refresh()
          // Small delay to show the refresh animation
          await new Promise((resolve) => setTimeout(resolve, 800))
        }
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      // Snap back
      setPullDistance(0)
    }
  }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh, router])

  const progress = Math.min(pullDistance / threshold, 1)
  const isReady = progress >= 1

  return (
    <div
      ref={containerRef}
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
