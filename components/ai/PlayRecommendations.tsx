'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Clock, Gamepad2, Brain, ChevronRight, Loader2, X, Library, BookOpen, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

function GameCoverImage({ src, alt }: { src: string | null; alt: string }) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-zinc-600 bg-gradient-to-br from-zinc-800 to-zinc-900">
        <Gamepad2 className="w-10 h-10" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 640px) 50vw, 200px"
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

export function PlayRecommendations() {
  const [mood, setMood] = useState<string>('any')
  const [time, setTime] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [result, setResult] = useState<RecommendationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [dismissingId, setDismissingId] = useState<string | null>(null)

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
        <div className="mt-4">
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

          <div className="grid grid-cols-2 gap-3">
            {visibleRecommendations.map((rec) => (
              <div key={rec.game_id} className="relative group">
                <Link
                  href={`/games/${rec.slug || rec.game_id}`}
                  className="block relative overflow-hidden rounded-xl border border-white/10 bg-black/40 h-full"
                >
                  {/* Image - 3:4 aspect for game covers */}
                  <div className="relative aspect-[3/4]">
                    <GameCoverImage src={rec.cover_url} alt={rec.game_name} />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                    {/* Type badge */}
                    <span className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-medium backdrop-blur-sm ${TYPE_LABELS[rec.recommendation_type].bg} ${TYPE_LABELS[rec.recommendation_type].color}`}>
                      {TYPE_LABELS[rec.recommendation_type].label}
                    </span>

                    {/* Content at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h4 className="font-semibold text-sm text-white line-clamp-1 leading-tight group-hover:text-primary transition-colors">
                        {rec.game_name}
                      </h4>
                      <p className="text-[11px] text-white/60 mt-1 line-clamp-2 leading-snug">
                        {rec.reason}
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Dismiss button */}
                <button
                  onClick={(e) => handleDismiss(rec.game_id, e)}
                  disabled={dismissingId === rec.game_id}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white/70 hover:bg-black/70 hover:text-white transition-all disabled:opacity-50 backdrop-blur-sm"
                  title="Not interested"
                >
                  {dismissingId === rec.game_id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
