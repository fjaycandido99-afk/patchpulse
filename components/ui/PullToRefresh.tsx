'use client'

import { useState, useRef, useCallback, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Check } from 'lucide-react'

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
  const [showSuccess, setShowSuccess] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const isPullingRef = useRef(false)
  const startYRef = useRef(0)
  const currentDistanceRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Only enable on mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const canPull = useCallback(() => {
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
      // Show success state
      setShowSuccess(true)
      await new Promise((resolve) => setTimeout(resolve, 600))
    } finally {
      setShowSuccess(false)
      setIsRefreshing(false)
      setPullDistance(0)
    }
  }, [onRefresh, router, threshold])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: globalThis.TouchEvent) => {
      if (disabled || isRefreshing || !isMobile) return
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
        // Apply rubber-band resistance (gets harder to pull as you go)
        const resistance = Math.max(0.3, 0.6 - (diff / 500))
        const distance = Math.min(diff * resistance, threshold * 1.5)
        currentDistanceRef.current = distance
        setPullDistance(distance)

        if (distance > 10) {
          e.preventDefault()
        }
      } else if (diff < 0) {
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

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [disabled, isRefreshing, isMobile, canPull, threshold, handleRefresh])

  const progress = Math.min(pullDistance / threshold, 1)
  const isReady = progress >= 1

  // Circle progress calculation
  const circleRadius = 14
  const circumference = 2 * Math.PI * circleRadius
  const strokeDashoffset = circumference * (1 - progress)

  // On desktop, just render children without pull-to-refresh
  if (!isMobile) {
    return <>{children}</>
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Pull indicator - mobile only */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center overflow-hidden pointer-events-none z-50"
        style={{
          height: Math.max(pullDistance, isRefreshing ? threshold * 0.6 : 0),
          top: 0,
        }}
      >
        <div
          className={`
            flex flex-col items-center gap-2 transition-all duration-300
            ${pullDistance > 15 || isRefreshing ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
          `}
          style={{
            transform: `translateY(${Math.min(pullDistance * 0.3, 20)}px)`,
          }}
        >
          {/* Animated circle with icon */}
          <div
            className={`
              relative flex items-center justify-center w-11 h-11 rounded-full
              transition-all duration-300 ease-out
              ${showSuccess
                ? 'bg-emerald-500/20 border-2 border-emerald-500 scale-110'
                : isReady
                  ? 'bg-primary/20 border-2 border-primary scale-105'
                  : 'bg-white/5 border-2 border-white/20'
              }
            `}
          >
            {/* Progress ring */}
            {!isRefreshing && !showSuccess && (
              <svg
                className="absolute inset-0 -rotate-90"
                viewBox="0 0 44 44"
              >
                <circle
                  cx="22"
                  cy="22"
                  r={circleRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className={`transition-all duration-150 ${isReady ? 'text-primary' : 'text-white/40'}`}
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: strokeDashoffset,
                  }}
                />
              </svg>
            )}

            {/* Icon */}
            <div
              className={`
                transition-all duration-300
                ${isRefreshing ? 'animate-spin' : ''}
                ${showSuccess ? 'scale-110' : ''}
              `}
              style={{
                transform: !isRefreshing && !showSuccess ? `rotate(${progress * 180}deg)` : undefined,
              }}
            >
              {showSuccess ? (
                <Check className="w-5 h-5 text-emerald-400" strokeWidth={3} />
              ) : (
                <RefreshCw
                  className={`w-5 h-5 transition-colors duration-200 ${isReady ? 'text-primary' : 'text-white/70'}`}
                />
              )}
            </div>
          </div>

          {/* Status text */}
          <span
            className={`
              text-xs font-medium transition-all duration-200
              ${showSuccess
                ? 'text-emerald-400'
                : isReady
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }
            `}
          >
            {showSuccess
              ? 'Updated!'
              : isRefreshing
                ? 'Refreshing...'
                : isReady
                  ? 'Release to refresh'
                  : 'Pull to refresh'
            }
          </span>
        </div>
      </div>

      {/* Content with pull offset */}
      <div
        className="pull-content"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPullingRef.current ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
