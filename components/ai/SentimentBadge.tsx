'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react'

type SentimentLevel = 'very_positive' | 'positive' | 'mixed' | 'negative' | 'very_negative'
type TrendDirection = 'up' | 'down' | 'stable'

type GameSentiment = {
  overall_sentiment: SentimentLevel
  sentiment_score: number
  trending: TrendDirection
  positive_factors: string[]
  negative_factors: string[]
}

type Props = {
  gameId: string
  showDetails?: boolean
}

const SENTIMENT_STYLES: Record<SentimentLevel, { color: string; bgColor: string; label: string }> = {
  very_positive: { color: 'text-green-400', bgColor: 'bg-green-500/10', label: 'Thriving' },
  positive: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', label: 'Positive' },
  mixed: { color: 'text-amber-400', bgColor: 'bg-amber-500/10', label: 'Mixed' },
  negative: { color: 'text-orange-400', bgColor: 'bg-orange-500/10', label: 'Struggling' },
  very_negative: { color: 'text-red-400', bgColor: 'bg-red-500/10', label: 'In Crisis' },
}

const TREND_ICONS = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
}

export function SentimentBadge({ gameId, showDetails = false }: Props) {
  const [loading, setLoading] = useState(true)
  const [sentiment, setSentiment] = useState<GameSentiment | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    fetchSentiment()
  }, [gameId])

  const fetchSentiment = async () => {
    try {
      const response = await fetch(`/api/ai/sentiment?gameId=${gameId}`)
      if (response.ok) {
        const data = await response.json()
        setSentiment(data)
      }
    } catch (error) {
      console.error('Failed to fetch sentiment:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted">
        <Loader2 className="w-3 h-3 animate-spin" />
      </span>
    )
  }

  if (!sentiment) {
    return null
  }

  const style = SENTIMENT_STYLES[sentiment.overall_sentiment]
  const TrendIcon = TREND_ICONS[sentiment.trending]

  return (
    <div className="relative inline-block">
      <button
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${style.bgColor} ${style.color}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <TrendIcon className="w-3 h-3" />
        {style.label}
      </button>

      {showTooltip && (showDetails || sentiment.positive_factors.length > 0 || sentiment.negative_factors.length > 0) && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-64 p-3 rounded-lg bg-popover border border-border shadow-lg">
          <div className="text-sm font-medium mb-2">Community Pulse</div>

          {sentiment.positive_factors.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-green-400 mb-1">What's good:</div>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {sentiment.positive_factors.slice(0, 3).map((f, i) => (
                  <li key={i}>• {f}</li>
                ))}
              </ul>
            </div>
          )}

          {sentiment.negative_factors.length > 0 && (
            <div>
              <div className="text-xs text-orange-400 mb-1">Current issues:</div>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {sentiment.negative_factors.slice(0, 3).map((f, i) => (
                  <li key={i}>• {f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Inline version for cards
export function SentimentIndicator({ gameId }: { gameId: string }) {
  const [sentiment, setSentiment] = useState<GameSentiment | null>(null)

  useEffect(() => {
    fetch(`/api/ai/sentiment?gameId=${gameId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => setSentiment(data))
      .catch(() => {})
  }, [gameId])

  if (!sentiment) return null

  const style = SENTIMENT_STYLES[sentiment.overall_sentiment]
  const TrendIcon = TREND_ICONS[sentiment.trending]

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${style.color}`}>
      <TrendIcon className="w-3 h-3" />
    </span>
  )
}
