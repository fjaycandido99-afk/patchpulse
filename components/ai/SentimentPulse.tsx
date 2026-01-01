'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, Sparkles, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react'

type SentimentLevel = 'very_positive' | 'positive' | 'mixed' | 'negative' | 'very_negative'
type TrendDirection = 'up' | 'down' | 'stable'

type GameSentiment = {
  overall_sentiment: SentimentLevel
  sentiment_score: number
  trending: TrendDirection
  positive_factors: string[]
  negative_factors: string[]
  summary: string
}

type Props = {
  gameId: string
  compact?: boolean
}

const SENTIMENT_CONFIG = {
  very_positive: {
    label: 'Thriving',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    emoji: '🔥',
  },
  positive: {
    label: 'Positive',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    emoji: '👍',
  },
  mixed: {
    label: 'Mixed',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    emoji: '🤔',
  },
  negative: {
    label: 'Struggling',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    emoji: '😕',
  },
  very_negative: {
    label: 'In Crisis',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    emoji: '🚨',
  },
}

const TREND_ICONS = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
}

const TREND_COLORS = {
  up: 'text-green-400',
  down: 'text-red-400',
  stable: 'text-zinc-400',
}

export function SentimentPulse({ gameId, compact = false }: Props) {
  const [sentiment, setSentiment] = useState<GameSentiment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSentiment() {
      try {
        const res = await fetch(`/api/ai/sentiment?gameId=${gameId}`)
        if (!res.ok) {
          if (res.status === 403) {
            // Pro feature, silently skip
            setLoading(false)
            return
          }
          throw new Error('Failed to fetch sentiment')
        }
        const data = await res.json()
        setSentiment(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchSentiment()
  }, [gameId])

  if (loading) {
    if (compact) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span className="text-xs text-muted-foreground">Analyzing...</span>
        </div>
      )
    }
    return (
      <div className="rounded-xl border border-border bg-card p-4 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded bg-muted" />
          <div className="w-24 h-5 rounded bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="w-full h-4 rounded bg-muted" />
          <div className="w-2/3 h-4 rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (error || !sentiment) {
    return null // Silently hide if no sentiment available
  }

  const config = SENTIMENT_CONFIG[sentiment.overall_sentiment]
  const TrendIcon = TREND_ICONS[sentiment.trending]
  const trendColor = TREND_COLORS[sentiment.trending]

  // Compact badge version for headers
  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bgColor} ${config.borderColor} border`}
        title={sentiment.summary}
      >
        <span className="text-sm">{config.emoji}</span>
        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        <TrendIcon className={`w-3 h-3 ${trendColor}`} />
      </div>
    )
  }

  // Full card version
  return (
    <div className={`rounded-xl border ${config.borderColor} ${config.bgColor} p-4 sm:p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-5 h-5 ${config.color}`} />
          <h3 className="font-semibold">Community Pulse</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${config.color}`}>
            {config.emoji} {config.label}
          </span>
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-xs capitalize">{sentiment.trending}</span>
          </div>
        </div>
      </div>

      {sentiment.summary && (
        <p className="text-sm text-muted-foreground mb-4">{sentiment.summary}</p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Positive Factors */}
        {sentiment.positive_factors.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 mb-2">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span className="font-medium">What players love</span>
            </div>
            <ul className="space-y-1">
              {sentiment.positive_factors.slice(0, 3).map((factor, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-1">•</span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Negative Factors */}
        {sentiment.negative_factors.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs text-orange-400 mb-2">
              <ThumbsDown className="w-3.5 h-3.5" />
              <span className="font-medium">Pain points</span>
            </div>
            <ul className="space-y-1">
              {sentiment.negative_factors.slice(0, 3).map((factor, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-1.5">
                  <span className="text-orange-400 mt-1">•</span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground/60 mt-4">
        Based on recent patches, news, and community activity
      </p>
    </div>
  )
}
