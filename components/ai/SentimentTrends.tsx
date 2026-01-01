'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, TrendingUp, TrendingDown, Minus, Gamepad2, Calendar, Zap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type GameSentiment = {
  game_id: string
  game_name: string
  game_slug: string
  cover_url: string | null
  trend: 'improving' | 'stable' | 'declining'
  trend_score: number
  reason: string
  patch_activity: {
    last_7_days: number
    last_30_days: number
    avg_impact: number
  }
  last_patch: {
    title: string
    published_at: string
    impact_score: number
  } | null
}

type SentimentData = {
  games: GameSentiment[]
  summary: {
    improving: number
    stable: number
    declining: number
  }
  message: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
}

const TREND_CONFIG = {
  improving: {
    icon: TrendingUp,
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    label: 'Improving',
  },
  stable: {
    icon: Minus,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    label: 'Stable',
  },
  declining: {
    icon: TrendingDown,
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    label: 'Declining',
  },
}

export function SentimentTrends({ isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<SentimentData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/sentiment-trends')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get sentiment trends')
      }

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card">
          <div>
            <h2 className="text-lg font-semibold">Sentiment Trends</h2>
            <p className="text-sm text-muted-foreground">How your games are doing after updates</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-2xl font-bold text-green-400">{data.summary.improving}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Improving</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Minus className="w-4 h-4 text-blue-400" />
                    <span className="text-2xl font-bold text-blue-400">{data.summary.stable}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Stable</p>
                </div>
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-2xl font-bold text-red-400">{data.summary.declining}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Declining</p>
                </div>
              </div>

              {/* Message */}
              <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
                <p className="text-sm">{data.message}</p>
              </div>

              {/* Games List */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Your Games</h3>
                {data.games.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No games in your backlog.
                  </p>
                ) : (
                  data.games.map((game) => {
                    const config = TREND_CONFIG[game.trend]
                    const TrendIcon = config.icon

                    return (
                      <Link
                        key={game.game_id}
                        href={`/games/${game.game_slug}`}
                        className={`block rounded-xl border ${config.border} hover:border-opacity-60 transition-colors overflow-hidden`}
                      >
                        <div className="flex gap-3 p-3">
                          {/* Game Cover */}
                          <div className="relative flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden bg-zinc-800 ring-1 ring-white/10">
                            {game.cover_url ? (
                              <Image
                                src={game.cover_url}
                                alt={game.game_name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                <Gamepad2 className="w-5 h-5" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm truncate">{game.game_name}</p>
                              <span className={`ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${config.bg} ${config.color}`}>
                                <TrendIcon className="w-3 h-3" />
                                {config.label}
                              </span>
                            </div>

                            <p className="text-xs text-muted-foreground">{game.reason}</p>

                            {/* Activity Stats */}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                {game.patch_activity.last_7_days} this week
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {game.patch_activity.last_30_days} this month
                              </span>
                              {game.patch_activity.avg_impact > 0 && (
                                <span>Avg impact: {game.patch_activity.avg_impact}/10</span>
                              )}
                            </div>

                            {/* Last Patch */}
                            {game.last_patch && (
                              <div className="mt-2 p-2 rounded-lg bg-white/5">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-muted-foreground">Last patch:</span>
                                  <span className="truncate">{game.last_patch.title}</span>
                                  <span className="ml-auto text-muted-foreground flex-shrink-0">
                                    {formatDate(game.last_patch.published_at)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    )
                  })
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
