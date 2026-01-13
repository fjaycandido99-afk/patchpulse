'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { Zap, Calendar, Gamepad2 } from 'lucide-react'

type PatchPreviewData = {
  title: string
  gameName: string
  impactScore: number
  summary: string | null
  publishedAt: string
}

type PatchHoverPreviewProps = {
  children: ReactNode
  patch: PatchPreviewData
  className?: string
}

function getImpactLabel(score: number): { label: string; color: string } {
  if (score >= 8) return { label: 'Major', color: 'text-red-400' }
  if (score >= 6) return { label: 'Moderate', color: 'text-amber-400' }
  if (score >= 4) return { label: 'Minor', color: 'text-cyan-400' }
  return { label: 'Low', color: 'text-zinc-400' }
}

function getRelativeTime(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return then.toLocaleDateString()
}

export function PatchHoverPreview({ children, patch, className = '' }: PatchHoverPreviewProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState<'right' | 'left'>('right')
  const [isBrowser, setIsBrowser] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check if we're in a browser (not Capacitor native app)
  useEffect(() => {
    const isNative = typeof window !== 'undefined' &&
      (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    setIsBrowser(!isNative)
  }, [])

  // Calculate position based on screen space
  useEffect(() => {
    if (isVisible && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const windowWidth = window.innerWidth
      // If more than halfway across screen, show on left
      setPosition(rect.left > windowWidth / 2 ? 'left' : 'right')
    }
  }, [isVisible])

  const handleMouseEnter = () => {
    if (!isBrowser) return
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, 300) // 300ms delay before showing
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  // Don't add hover functionality on native apps or mobile
  if (!isBrowser) {
    return <div className={className}>{children}</div>
  }

  const impact = getImpactLabel(patch.impactScore)

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {/* Hover Preview Card - Desktop only */}
      {isVisible && (
        <div
          className={`absolute z-50 hidden md:block w-80 p-4 rounded-xl border border-white/15 bg-[#0a0f1a]/95 backdrop-blur-xl shadow-2xl shadow-black/50 animate-fade-in ${
            position === 'right' ? 'left-full ml-3' : 'right-full mr-3'
          } top-0`}
          style={{ pointerEvents: 'none' }}
        >
          {/* Header */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>{patch.gameName}</span>
            </div>
            <h4 className="font-semibold text-sm leading-snug line-clamp-2">
              {patch.title}
            </h4>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <Zap className={`w-3.5 h-3.5 ${impact.color}`} />
              <span className={`text-xs font-medium ${impact.color}`}>
                {impact.label} ({patch.impactScore}/10)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{getRelativeTime(patch.publishedAt)}</span>
            </div>
          </div>

          {/* Summary */}
          {patch.summary && !patch.summary.toLowerCase().includes('pending') ? (
            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
              {patch.summary}
            </p>
          ) : (
            <p className="text-xs text-zinc-500 italic">
              No summary available
            </p>
          )}

          {/* Hint */}
          <div className="mt-3 pt-2 border-t border-white/5">
            <p className="text-[10px] text-muted-foreground/60">
              Click to view full patch notes
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
