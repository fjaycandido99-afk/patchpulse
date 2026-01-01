'use client'

import { useState } from 'react'
import { Sparkles, Clock, Gamepad2, Brain, ChevronRight, Loader2, Zap, Calendar, X, TrendingUp, Minus, TrendingDown, AlertTriangle, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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
  { id: 'any', label: 'Surprise me', icon: Sparkles },
  { id: 'chill', label: 'Chill', icon: Gamepad2 },
  { id: 'challenge', label: 'Challenge', icon: Brain },
  { id: 'story', label: 'Story', icon: ChevronRight },
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
  const [result, setResult] = useState<RecommendationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [dismissingId, setDismissingId] = useState<string | null>(null)

  const fetchRecommendations = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (mood !== 'any') params.set('mood', mood)
      if (time) params.set('time', time.toString())

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

  // Filter out dismissed recommendations
  const visibleRecommendations = result?.recommendations.filter(
    rec => !dismissedIds.has(rec.game_id)
  ) || []

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">What Should I Play?</h3>
          <p className="text-sm text-muted-foreground">From your backlog + trending discoveries</p>
        </div>
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
        onClick={fetchRecommendations}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Brain className="w-4 h-4" />
        )}
        Get Recommendations
      </button>

      {error && (
        <div className="mt-4 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
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
                  <div className="flex gap-4 p-4">
                    {/* Game Cover - Larger with glow */}
                    <div className={`relative flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden bg-zinc-800 ${
                      isDiscovery
                        ? 'ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/20'
                        : isHot
                          ? 'ring-2 ring-primary/30 shadow-lg shadow-primary/20'
                          : 'ring-1 ring-white/10'
                    }`}>
                      <GameCoverImage src={rec.cover_url} alt={rec.game_name} />
                      {/* Rank badge */}
                      <div className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg">
                        {i + 1}
                      </div>
                      {/* Momentum indicator on cover */}
                      {isHot && !rec.is_discovery && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg animate-pulse">
                          <TrendingUp className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      {/* Discovery badge on cover */}
                      {rec.is_discovery && (
                        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-[10px] font-bold text-black shadow-lg">
                          NEW
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      {/* Signal Chips Row */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_LABELS[rec.recommendation_type].bg} ${TYPE_LABELS[rec.recommendation_type].color}`}>
                          {TYPE_LABELS[rec.recommendation_type].label}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${momentumConfig.bg} ${momentumConfig.color}`}>
                          <MomentumIcon className="w-3 h-3" />
                          {momentumConfig.label}
                        </span>
                        {rec.recent_patch && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400">
                            <Calendar className="w-3 h-3" />
                            Patch
                          </span>
                        )}
                        {rec.is_discovery && rec.follower_count && rec.follower_count > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400">
                            <Users className="w-3 h-3" />
                            {rec.follower_count} following
                          </span>
                        )}
                      </div>

                      <h4 className="font-semibold text-lg truncate">{rec.game_name}</h4>

                      {rec.progress > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${rec.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{rec.progress}%</span>
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{rec.reason}</p>

                      {/* Why Now - the key selling point */}
                      {rec.why_now && (
                        <div className="mt-3 p-2 rounded-lg bg-primary/10 border border-primary/20">
                          <div className="flex items-start gap-2 text-sm">
                            <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="font-medium text-primary">{rec.why_now}</span>
                          </div>
                        </div>
                      )}

                      {/* What You'd Miss */}
                      {rec.what_youd_miss && (
                        <div className="mt-2 flex items-start gap-2 text-xs text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          <span>{rec.what_youd_miss}</span>
                        </div>
                      )}

                      {/* Patch indicator */}
                      {rec.recent_patch && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <span className={rec.recent_patch.is_major ? 'text-amber-400 font-medium' : ''}>
                            {rec.recent_patch.is_major ? '🔥 Major: ' : ''}
                            {rec.recent_patch.title}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Dismiss button */}
                <button
                  onClick={(e) => handleDismiss(rec.game_id, e)}
                  disabled={dismissingId === rec.game_id}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-zinc-800/80 text-zinc-400 opacity-0 group-hover:opacity-100 hover:bg-zinc-700 hover:text-zinc-200 transition-all disabled:opacity-50"
                  title="Not interested"
                >
                  {dismissingId === rec.game_id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
