'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Clock, Gamepad2, Brain, ChevronRight, Loader2, Zap, Calendar, X, TrendingUp, Minus, TrendingDown, AlertTriangle, Users, Library, BookOpen, Bookmark, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toggleRecommendationBookmark } from '@/app/(main)/actions/bookmarks'

function GameCoverImage({ src, alt }: { src: string | null; alt: string }) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-gradient-to-br from-zinc-800 to-zinc-900">
        <Gamepad2 className="w-8 h-8" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="80px"
      unoptimized
      onError={() => setHasError(true)}
    />
  )
}

type Recommendation = {
  game_id: string
  game_name: string
  slug: string
  cover_url: string | null
  reason: string
  match_score: number
  recommendation_type: 'return' | 'start' | 'finish' | 'discover'
  factors: string[]
  why_now: string | null
  what_youd_miss?: string | null
  momentum?: 'rising' | 'stable' | 'cooling'
  recent_patch: {
    title: string
    published_at: string
    is_major: boolean
  } | null
  days_since_played: number | null
  progress: number
  is_discovery?: boolean
  follower_count?: number
}

type RecommendationResult = {
  recommendations: Recommendation[]
  message: string
}

const MOODS = [
  { id: 'any', label: 'Surprise me', icon: Sparkles, description: 'Discover new games' },
  { id: 'chill', label: 'Chill', icon: Gamepad2, description: 'Relaxing games' },
  { id: 'challenge', label: 'Challenge', icon: Brain, description: 'Test your skills' },
  { id: 'story', label: 'Story', icon: BookOpen, description: 'Narrative focused' },
  { id: 'backlog', label: 'My Backlog', icon: Library, description: 'From your library' },
]

const TIME_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2+ hours' },
]

const TYPE_LABELS = {
  return: { label: 'Return to', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  start: { label: 'Start', color: 'text-green-400', bg: 'bg-green-500/20' },
  finish: { label: 'Finish', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  discover: { label: 'Discover', color: 'text-amber-400', bg: 'bg-amber-500/20' },
}

const MOMENTUM_CONFIG = {
  rising: { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Rising', glow: 'shadow-green-500/20' },
  stable: { icon: Minus, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Stable', glow: '' },
  cooling: { icon: TrendingDown, color: 'text-zinc-400', bg: 'bg-zinc-500/20', label: 'Cooling', glow: '' },
}

export function PlayRecommendations() {
  const [mood, setMood] = useState<string>('any')
  const [time, setTime] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [result, setResult] = useState<RecommendationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [dismissingId, setDismissingId] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)

  // Load cached recommendations and dismissed IDs on mount
  useEffect(() => {
    const loadCached = async () => {
      try {
        // Load dismissed IDs and cached recommendations in parallel
        const [dismissedRes, recsRes] = await Promise.all([
          fetch('/api/ai/recommendations/dismiss'),
          fetch('/api/ai/recommendations'),
        ])

        // Load dismissed IDs
        if (dismissedRes.ok) {
          const dismissedData = await dismissedRes.json()
          if (dismissedData?.dismissed_game_ids?.length > 0) {
            setDismissedIds(new Set(dismissedData.dismissed_game_ids))
          }
        }

        // Load cached recommendations
        const data = await recsRes.json()
        if (recsRes.ok && data?.recommendations?.length > 0) {
          setResult({
            recommendations: data.recommendations,
            message: data.message || 'Your recommendations',
          })
        }
      } catch {
        // Silently fail - user can manually fetch
      } finally {
        setInitialLoading(false)
      }
    }

    loadCached()
  }, [])

  const fetchRecommendations = async (refresh: boolean) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      // For backlog mode, we only want backlog games
      if (mood === 'backlog') {
        params.set('backlogOnly', 'true')
      } else {
        // For mood options, focus on discovery (new games to try)
        if (mood !== 'any') params.set('mood', mood)
        params.set('discoveryOnly', 'true')
      }
      if (time) params.set('time', time.toString())
      if (refresh) params.set('refresh', 'true')

      const response = await fetch(`/api/ai/recommendations?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get recommendations')
      }

      // Ensure data has required fields with safe defaults
      setResult({
        recommendations: Array.isArray(data?.recommendations) ? data.recommendations : [],
        message: data?.message || 'Here are your recommendations',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = async (gameId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setDismissingId(gameId)

    try {
      await fetch('/api/ai/recommendations/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, reason: 'not_interested' }),
      })

      // Add to local dismissed set for immediate UI feedback
      setDismissedIds(prev => new Set([...prev, gameId]))
    } catch (err) {
      console.error('Failed to dismiss:', err)
    } finally {
      setDismissingId(null)
    }
  }

  const handleSave = async (rec: Recommendation, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setSavingId(rec.game_id)

    try {
      const result = await toggleRecommendationBookmark(rec.game_id, {
        game_id: rec.game_id,
        game_name: rec.game_name,
        slug: rec.slug,
        cover_url: rec.cover_url,
        reason: rec.reason,
        why_now: rec.why_now,
        recommendation_type: rec.recommendation_type,
        savedAt: new Date().toISOString(),
      })

      if (result.error) {
        console.error('Failed to save recommendation:', result.error)
        setError(`Failed to save: ${result.error}`)
        return
      }

      if (result.bookmarked) {
        setSavedIds(prev => new Set([...prev, rec.game_id]))
      } else {
        setSavedIds(prev => {
          const next = new Set(prev)
          next.delete(rec.game_id)
          return next
        })
      }
    } catch (err) {
      console.error('Failed to save:', err)
      setError('Failed to save recommendation')
    } finally {
      setSavingId(null)
    }
  }

  // Filter out dismissed recommendations and limit to 4 for the widget
  const visibleRecommendations = (result?.recommendations.filter(
    rec => !dismissedIds.has(rec.game_id)
  ) || []).slice(0, 4)

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">What Should I Play?</h3>
            <p className="text-sm text-muted-foreground">
              {mood === 'backlog' ? 'Personalized picks from your library' : 'Discover games you\'ll love'}
            </p>
          </div>
        </div>
        <Link
          href="/recommendations"
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
        >
          See all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">How are you feeling?</label>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMood(m.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  mood === m.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <m.icon className="w-4 h-4" />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Time available</label>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTime(time === t.value ? null : t.value)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  time === t.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <Clock className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => fetchRecommendations(true)}
        disabled={loading || initialLoading}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading || initialLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : result ? (
          <RefreshCw className="w-4 h-4" />
        ) : (
          <Brain className="w-4 h-4" />
        )}
        {initialLoading ? 'Loading...' : result ? 'Get New Recommendations' : 'Get Recommendations'}
      </button>

      {error && (
        <div className="mt-4 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-muted-foreground italic">{result.message}</p>

          {visibleRecommendations.length === 0 && dismissedIds.size > 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">You dismissed all recommendations.</p>
              <button
                onClick={() => setDismissedIds(new Set())}
                className="mt-2 text-xs text-primary hover:text-primary/80"
              >
                Reset dismissals
              </button>
            </div>
          )}

          {visibleRecommendations.map((rec, i) => {
            const momentum = rec.momentum || 'stable'
            const momentumConfig = MOMENTUM_CONFIG[momentum]
            const MomentumIcon = momentumConfig.icon
            const isHot = momentum === 'rising' || rec.recent_patch?.is_major
            const isDiscovery = rec.is_discovery || false

            return (
              <div key={rec.game_id} className="relative group">
                <Link
                  href={`/games/${rec.slug || rec.game_id}`}
                  className={`block rounded-xl border transition-all overflow-hidden ${
                    isDiscovery
                      ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent hover:border-amber-500/50 shadow-lg shadow-amber-500/5'
                      : isHot
                        ? 'border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent hover:border-primary/50 shadow-lg shadow-primary/5'
                        : 'border-border bg-muted/30 hover:bg-muted/50 hover:border-border/80'
                  }`}
                >
                  <div className="flex gap-3 p-2.5">
                    {/* Game Cover - Larger */}
                    <div className={`relative flex-shrink-0 w-16 h-22 sm:w-20 sm:h-28 rounded-lg overflow-hidden bg-zinc-800 ${
                      isDiscovery
                        ? 'ring-1 ring-amber-500/40'
                        : isHot
                          ? 'ring-1 ring-primary/40'
                          : 'ring-1 ring-white/10'
                    }`}>
                      <GameCoverImage src={rec.cover_url} alt={rec.game_name} />
                      {/* Rank badge */}
                      <div className="absolute -top-0.5 -left-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shadow">
                        {i + 1}
                      </div>
                    </div>

                    {/* Content - Minimal */}
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_LABELS[rec.recommendation_type].bg} ${TYPE_LABELS[rec.recommendation_type].color}`}>
                          {TYPE_LABELS[rec.recommendation_type].label}
                        </span>
                        {isHot && (
                          <TrendingUp className="w-3 h-3 text-green-400" />
                        )}
                      </div>

                      <h4 className="font-semibold text-sm truncate">{rec.game_name}</h4>

                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{rec.reason}</p>
                    </div>
                  </div>
                </Link>

                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  {/* Save button */}
                  <button
                    onClick={(e) => handleSave(rec, e)}
                    disabled={savingId === rec.game_id}
                    className={`p-1.5 rounded-full transition-all disabled:opacity-50 ${
                      savedIds.has(rec.game_id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                    }`}
                    title={savedIds.has(rec.game_id) ? 'Remove from saved' : 'Save for later'}
                  >
                    {savingId === rec.game_id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Bookmark className={`w-3.5 h-3.5 ${savedIds.has(rec.game_id) ? 'fill-current' : ''}`} />
                    )}
                  </button>

                  {/* Dismiss button */}
                  <button
                    onClick={(e) => handleDismiss(rec.game_id, e)}
                    disabled={dismissingId === rec.game_id}
                    className="p-1.5 rounded-full bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-all disabled:opacity-50"
                    title="Not interested"
                  >
                    {dismissingId === rec.game_id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <X className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
