'use client'

import { useState, useEffect, useRef } from 'react'
import { Gamepad2, FileText, X, ChevronRight, Flame, Zap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type Patch = {
  id: string
  title: string
  published_at: string
  summary_tldr: string | null
  impact_score: number
  game: {
    id: string
    name: string
    slug: string
    cover_url: string | null
  }
}

type LatestPatchesStats = {
  total_today: number
  high_impact_count: number
}

function getRelativeTime(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return then.toLocaleDateString()
}

function getImpactColor(score: number) {
  if (score >= 8) return 'text-red-400'
  if (score >= 6) return 'text-amber-400'
  if (score >= 4) return 'text-cyan-400'
  return 'text-zinc-400'
}

function getImpactBg(score: number) {
  if (score >= 8) return 'bg-red-500/20 border-red-500/30'
  if (score >= 6) return 'bg-amber-500/20 border-amber-500/30'
  if (score >= 4) return 'bg-cyan-500/20 border-cyan-500/30'
  return 'bg-zinc-500/20 border-zinc-500/30'
}

type Props = {
  initialStats?: LatestPatchesStats
  size?: 'sm' | 'md'
}

export function LatestPatchesBell({ initialStats, size = 'md' }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [patches, setPatches] = useState<Patch[]>([])
  const [stats, setStats] = useState<LatestPatchesStats>(
    initialStats || { total_today: 0, high_impact_count: 0 }
  )
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when modal is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Fetch patches when dropdown opens
  useEffect(() => {
    if (isOpen && patches.length === 0) {
      fetchPatches()
    }
  }, [isOpen])

  // Poll for updates every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchStats, 300000)
    return () => clearInterval(interval)
  }, [])

  async function fetchPatches() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/patches/discover?limit=10')
      const data = await res.json()
      setPatches(data.patches || [])
      setStats(data.stats || { total_today: 0, high_impact_count: 0 })
    } catch (error) {
      console.error('Failed to fetch discover patches:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/patches/discover?stats=true')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch patch stats:', error)
    }
  }

  const hasPatches = stats.total_today > 0
  const hasHighImpact = stats.high_impact_count > 0

  return (
    <>
      {/* Gamepad Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="relative p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-white/10 active:bg-white/20 active:scale-95 transition-all touch-manipulation group"
        title="Discover Patches"
        aria-label={`Discover patches${hasPatches ? ` (${stats.total_today} today)` : ''}`}
      >
        {/* Pulsing halo effect when there are new patches */}
        {hasHighImpact && (
          <span className="absolute inset-0 rounded-xl bg-cyan-500/20 animate-ping-slow opacity-75" />
        )}

        {/* Subtle glow ring on hover */}
        <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300" />

        <Gamepad2 className={`relative h-5 w-5 transition-colors duration-200 ${
          hasPatches ? 'text-cyan-400' : 'text-muted-foreground'
        }`} />

        {/* Badge showing today's count */}
        {hasPatches && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
            <span className={`absolute w-4 h-4 rounded-full ${hasHighImpact ? 'bg-red-500 animate-ping' : 'bg-cyan-500'} opacity-75`} />
            <span className={`relative w-4 h-4 rounded-full ${hasHighImpact ? 'bg-red-500' : 'bg-cyan-500'} flex items-center justify-center text-[9px] font-bold text-white`}>
              {stats.total_today > 9 ? '9+' : stats.total_today}
            </span>
          </span>
        )}
      </button>

      {/* Modal/Sheet */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:bg-black/40 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Mobile: Bottom Sheet | Desktop: Dropdown */}
          <div
            ref={dropdownRef}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-3xl bg-card/95 backdrop-blur-xl border-t border-white/10 shadow-2xl shadow-black/50 animate-in slide-in-from-bottom duration-300
                       md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:w-[420px] md:rounded-2xl md:border md:border-white/10 md:max-h-[70vh] md:slide-in-from-top-2"
          >
            {/* Animated gradient border (top) */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 animate-gradient-x" />

            {/* Drag Handle (mobile only) */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            {/* Header with gradient background */}
            <div className="relative px-5 py-4 border-b border-white/10 overflow-hidden">
              {/* Subtle animated gradient sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-cyan-500/5 animate-gradient-x opacity-50" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold tracking-tight">Discover</h3>
                  {hasPatches && (
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-in zoom-in duration-200">
                      {stats.total_today} today
                    </span>
                  )}
                  {hasHighImpact && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                      <Flame className="w-3 h-3 fill-red-400" />
                      {stats.high_impact_count} major
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 active:scale-90 transition-all touch-manipulation"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Patches from games you don&apos;t follow</p>
            </div>

            {/* Content */}
            <div className="overflow-y-auto overscroll-contain max-h-[60vh] md:max-h-[50vh]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
                    <Gamepad2 className="absolute inset-0 m-auto w-5 h-5 text-cyan-500/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">Loading patches...</p>
                </div>
              ) : patches.length === 0 ? (
                <div className="relative flex flex-col items-center justify-center py-20 px-6 overflow-hidden">
                  {/* Ghost cards in background */}
                  <div className="absolute inset-0 flex flex-col gap-3 p-4 opacity-[0.03] pointer-events-none">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-20 rounded-xl bg-white" />
                    ))}
                  </div>

                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping opacity-50" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
                      <Gamepad2 className="w-10 h-10 text-cyan-500/60" />
                    </div>
                  </div>

                  <p className="text-lg font-semibold text-foreground">No new patches</p>
                  <p className="text-sm text-muted-foreground mt-2 text-center max-w-[250px]">
                    No recent patches from games outside your library
                  </p>

                  <Link
                    href="/search"
                    onClick={() => setIsOpen(false)}
                    className="mt-6 px-4 py-2 text-sm font-medium text-cyan-400 bg-cyan-500/10 rounded-xl hover:bg-cyan-500/20 transition-colors"
                  >
                    Discover games
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {patches.map((patch, index) => (
                    <Link
                      key={patch.id}
                      href={`/patches/${patch.id}`}
                      onClick={() => setIsOpen(false)}
                      className="group flex gap-4 p-4 hover:bg-white/5 active:bg-white/10 transition-all duration-200 touch-manipulation"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Game Cover */}
                      <div className="flex-shrink-0 relative">
                        {patch.impact_score >= 8 && (
                          <div className="absolute -inset-1 rounded-xl bg-red-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                        {patch.game.cover_url ? (
                          <div className="relative w-14 h-[72px] rounded-xl overflow-hidden bg-zinc-800 shadow-lg ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
                            <Image
                              src={patch.game.cover_url}
                              alt={patch.game.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="56px"
                            />
                          </div>
                        ) : (
                          <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center ring-1 ring-white/10">
                            <FileText className="w-5 h-5 text-cyan-400" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 py-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-[15px] font-semibold leading-tight line-clamp-1 text-foreground">
                                {patch.title}
                              </p>
                              {patch.impact_score >= 8 && (
                                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-red-500/20 text-red-400 flex items-center gap-0.5">
                                  <Zap className="w-2.5 h-2.5 fill-red-400" />
                                  Major
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground/80 mt-0.5 font-medium">
                              {patch.game.name}
                            </p>
                          </div>
                          {/* Impact score badge */}
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-lg border ${getImpactBg(patch.impact_score)} ${getImpactColor(patch.impact_score)}`}>
                            {patch.impact_score}/10
                          </span>
                        </div>
                        {patch.summary_tldr && (
                          <p className="text-sm text-muted-foreground/70 line-clamp-2 mt-1.5 leading-relaxed">
                            {patch.summary_tldr}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground/50 mt-2 font-medium tracking-wide uppercase">
                          {getRelativeTime(patch.published_at)}
                        </p>
                      </div>

                      {/* Chevron */}
                      <ChevronRight className="w-5 h-5 text-muted-foreground/30 flex-shrink-0 self-center group-hover:text-muted-foreground/60 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {patches.length > 0 && (
              <div className="p-4 border-t border-white/10 safe-area-pb bg-gradient-to-t from-background/50 to-transparent">
                <Link
                  href="/patches"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 font-semibold hover:from-cyan-500/30 hover:to-blue-500/30 active:scale-[0.98] transition-all touch-manipulation border border-cyan-500/20"
                >
                  View all patches
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
