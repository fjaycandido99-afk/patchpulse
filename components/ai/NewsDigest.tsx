'use client'

import { useState, useEffect } from 'react'
import { Newspaper, Loader2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

type DigestHighlight = {
  news_id: string
  title: string
  game_name: string
  tldr: string
  importance: 'high' | 'medium' | 'low'
  category: string
}

type GameUpdate = {
  game_name: string
  update_count: number
  summary: string
  highlights: string[]
}

type DigestResult = {
  summary: string
  highlights: DigestHighlight[]
  game_updates: Record<string, GameUpdate>
  total_news: number
}

const IMPORTANCE_STYLES = {
  high: 'border-l-primary',
  medium: 'border-l-amber-500',
  low: 'border-l-zinc-500',
}

export function NewsDigest() {
  const [digestType, setDigestType] = useState<'daily' | 'weekly'>('daily')
  const [loading, setLoading] = useState(true)
  const [digest, setDigest] = useState<DigestResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchDigest()
  }, [digestType])

  const fetchDigest = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/ai/digest?type=${digestType}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get digest')
      }

      setDigest(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const toggleGame = (game: string) => {
    const newExpanded = new Set(expandedGames)
    if (newExpanded.has(game)) {
      newExpanded.delete(game)
    } else {
      newExpanded.add(game)
    }
    setExpandedGames(newExpanded)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">News Digest</h3>
            <p className="text-sm text-muted-foreground">AI-curated news for your games</p>
          </div>
        </div>

        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          <button
            onClick={() => setDigestType('daily')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              digestType === 'daily'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDigestType('weekly')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              digestType === 'weekly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      ) : digest ? (
        <div className="space-y-6">
          {/* Summary */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">{digest.summary}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {digest.total_news} articles from your followed games
            </p>
          </div>

          {/* Highlights */}
          {digest.highlights.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Top Stories</h4>
              <div className="space-y-2">
                {digest.highlights.map((h) => (
                  <div
                    key={h.news_id}
                    className={`pl-3 py-2 border-l-2 ${IMPORTANCE_STYLES[h.importance]}`}
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <span>{h.game_name}</span>
                      <span>•</span>
                      <span className="capitalize">{h.category}</span>
                    </div>
                    <p className="text-sm font-medium">{h.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{h.tldr}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* By Game */}
          {Object.keys(digest.game_updates).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">By Game</h4>
              <div className="space-y-2">
                {Object.entries(digest.game_updates).map(([game, update]) => (
                  <div key={game} className="rounded-lg bg-muted/50">
                    <button
                      onClick={() => toggleGame(game)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-muted transition-colors rounded-lg"
                    >
                      <div>
                        <span className="font-medium">{update.game_name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {update.update_count} update{update.update_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {expandedGames.has(game) ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>

                    {expandedGames.has(game) && (
                      <div className="px-3 pb-3">
                        <p className="text-sm text-muted-foreground mb-2">{update.summary}</p>
                        {update.highlights.length > 0 && (
                          <ul className="text-sm space-y-1">
                            {update.highlights.map((h, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                <span>{h}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
