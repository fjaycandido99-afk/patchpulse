'use client'

import { useState } from 'react'
import { Sparkles, Clock, Gamepad2, Brain, ChevronRight, Loader2, Zap, Calendar, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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
  recent_patch: {
    title: string
    published_at: string
    is_major: boolean
  } | null
  days_since_played: number | null
  progress: number
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
  return: { label: 'Return to', color: 'text-blue-400' },
  start: { label: 'Start', color: 'text-green-400' },
  finish: { label: 'Finish', color: 'text-purple-400' },
  discover: { label: 'Discover', color: 'text-amber-400' },
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

      setResult(data)
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
          <p className="text-sm text-muted-foreground">AI-powered recommendations from your backlog</p>
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

          {visibleRecommendations.map((rec, i) => (
            <div key={rec.game_id} className="relative group">
              <Link
                href={`/games/${rec.slug || rec.game_id}`}
                className="block rounded-lg bg-muted/50 hover:bg-muted transition-colors overflow-hidden"
              >
                <div className="flex gap-3 p-3">
                  {/* Game Cover */}
                  <div className="relative flex-shrink-0 w-16 h-20 rounded-md overflow-hidden bg-zinc-800">
                    {rec.cover_url ? (
                      <Image
                        src={rec.cover_url}
                        alt={rec.game_name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Gamepad2 className="w-6 h-6" />
                      </div>
                    )}
                    {/* Rank badge */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shadow-lg">
                      {i + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-medium ${TYPE_LABELS[rec.recommendation_type].color}`}>
                        {TYPE_LABELS[rec.recommendation_type].label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {rec.match_score}% match
                      </span>
                      {rec.progress > 0 && (
                        <span className="text-xs text-muted-foreground">
                          · {rec.progress}% complete
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium truncate">{rec.game_name}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{rec.reason}</p>

                    {/* Why Now - the key selling point */}
                    {rec.why_now && (
                      <div className="mt-2 flex items-start gap-1.5 text-xs text-primary">
                        <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span className="font-medium">{rec.why_now}</span>
                      </div>
                    )}

                    {/* Patch indicator */}
                    {rec.recent_patch && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-400">
                        <Calendar className="w-3 h-3" />
                        <span className={rec.recent_patch.is_major ? 'font-medium' : ''}>
                          {rec.recent_patch.is_major ? '🔥 ' : ''}
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
                className="absolute top-2 right-2 p-1.5 rounded-full bg-zinc-800/80 text-zinc-400 opacity-0 group-hover:opacity-100 hover:bg-zinc-700 hover:text-zinc-200 transition-all disabled:opacity-50"
                title="Not interested"
              >
                {dismissingId === rec.game_id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <X className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
