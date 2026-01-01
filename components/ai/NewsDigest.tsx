'use client'

import { useState, useEffect } from 'react'
import { Newspaper, Loader2, ChevronDown, ChevronUp, Sparkles, Gamepad2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type DigestHighlight = {
  news_id: string
  title: string
  game_name: string
  game_slug: string
  game_cover_url: string | null
  tldr: string
  importance: 'high' | 'medium' | 'low'
  category: string
}

type GameUpdate = {
  game_name: string
  game_slug: string
  game_cover_url: string | null
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
  high: { border: 'border-l-primary', bg: 'bg-primary/5', label: 'Important', color: 'text-primary' },
  medium: { border: 'border-l-amber-500', bg: 'bg-amber-500/5', label: 'Notable', color: 'text-amber-400' },
  low: { border: 'border-l-zinc-500', bg: 'bg-zinc-500/5', label: '', color: 'text-zinc-400' },
}

const CATEGORY_LABELS: Record<string, string> = {
  update: 'Update',
  dlc: 'DLC',
  esports: 'Esports',
  review: 'Review',
  announcement: 'Announcement',
  other: 'News',
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

      // Ensure data has required fields with safe defaults
      setDigest({
        summary: data?.summary || 'No news to summarize',
        highlights: Array.isArray(data?.highlights) ? data.highlights : [],
        game_updates: data?.game_updates && typeof data.game_updates === 'object' ? data.game_updates : {},
        total_news: typeof data?.total_news === 'number' ? data.total_news : 0,
      })
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
              <div className="space-y-3">
                {digest.highlights.map((h) => {
                  const style = IMPORTANCE_STYLES[h.importance]
                  return (
                    <Link
                      key={h.news_id}
                      href={`/news/${h.news_id}`}
                      className={`block rounded-lg ${style.bg} hover:bg-muted/80 transition-colors overflow-hidden`}
                    >
                      <div className="flex gap-3 p-3">
                        {/* Game Cover */}
                        <div className="relative flex-shrink-0 w-12 h-16 rounded-md overflow-hidden bg-zinc-800">
                          {h.game_cover_url && h.game_cover_url.length > 0 ? (
                            <Image
                              src={h.game_cover_url}
                              alt={h.game_name || 'Game'}
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
                          <div className="flex items-center gap-2 text-xs mb-1 flex-wrap">
                            <span className="text-muted-foreground">{h.game_name}</span>
                            <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] uppercase">
                              {CATEGORY_LABELS[h.category] || h.category}
                            </span>
                            {style.label && (
                              <span className={`text-[10px] font-medium ${style.color}`}>
                                {style.label}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium line-clamp-2">{h.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{h.tldr}</p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* By Game */}
          {Object.keys(digest.game_updates).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">By Game</h4>
              <div className="space-y-2">
                {Object.entries(digest.game_updates).map(([game, update]) => (
                  <div key={game} className="rounded-lg bg-muted/50 overflow-hidden">
                    <button
                      onClick={() => toggleGame(game)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted transition-colors"
                    >
                      {/* Game Cover */}
                      <div className="relative flex-shrink-0 w-10 h-12 rounded overflow-hidden bg-zinc-800">
                        {update.game_cover_url && update.game_cover_url.length > 0 ? (
                          <Image
                            src={update.game_cover_url}
                            alt={update.game_name || 'Game'}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <Gamepad2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate block">{update.game_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {update.update_count} update{update.update_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {expandedGames.has(game) ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>

                    {expandedGames.has(game) && (
                      <div className="px-3 pb-3 ml-[52px]">
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
                        {update.game_slug && (
                          <Link
                            href={`/games/${update.game_slug}`}
                            className="inline-block mt-2 text-xs text-primary hover:text-primary/80"
                          >
                            View game →
                          </Link>
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
