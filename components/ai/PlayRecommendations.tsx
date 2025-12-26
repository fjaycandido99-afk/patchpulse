'use client'

import { useState } from 'react'
import { Sparkles, Clock, Gamepad2, Brain, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

type Recommendation = {
  game_id: string
  game_name: string
  reason: string
  match_score: number
  recommendation_type: 'return' | 'start' | 'finish' | 'discover'
  factors: string[]
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

          {result.recommendations.map((rec, i) => (
            <Link
              key={rec.game_id}
              href={`/games/${rec.game_id}`}
              className="block p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${TYPE_LABELS[rec.recommendation_type].color}`}>
                      {TYPE_LABELS[rec.recommendation_type].label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {rec.match_score}% match
                    </span>
                  </div>
                  <h4 className="font-medium">{rec.game_name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{rec.reason}</p>
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {i + 1}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
