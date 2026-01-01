'use client'

import { useState, useEffect } from 'react'
import { Loader2, ChevronDown, ChevronUp, Sparkles, Gamepad2, Zap, AlertCircle, TrendingUp, Radio, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type DigestHighlight = {
  news_id: string
  title: string
  game_name: string
  game_slug: string
  game_cover_url: string | null
  tldr: string
  why_it_matters?: string | null
  is_early_signal?: boolean
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
  high: { border: 'border-l-primary', bg: 'bg-gradient-to-r from-primary/10 to-transparent', label: 'High Impact', color: 'text-primary', icon: Zap },
  medium: { border: 'border-l-amber-500', bg: 'bg-gradient-to-r from-amber-500/10 to-transparent', label: 'Notable', color: 'text-amber-400', icon: AlertCircle },
  low: { border: 'border-l-zinc-500', bg: 'bg-zinc-800/30', label: '', color: 'text-zinc-400', icon: null },
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

  const fetchDigest = async (forceRefresh = false) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ type: digestType })
      if (forceRefresh) params.set('refresh', 'true')
      const response = await fetch(`/api/ai/digest?${params}`)
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
            <Radio className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Early Signal Feed</h3>
            <p className="text-sm text-muted-foreground">News ranked by impact, not recency</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDigest(true)}
            disabled={loading}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            title="Refresh digest"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
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
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Priority Signals</h4>
              <div className="space-y-3">
                {digest.highlights.map((h) => {
                  const style = IMPORTANCE_STYLES[h.importance]
                  const ImportanceIcon = style.icon
                  return (
                    <Link
                      key={h.news_id}
                      href={`/news/${h.news_id}`}
                      className={`block rounded-xl border transition-all overflow-hidden ${
                        h.importance === 'high'
                          ? 'border-primary/30 hover:border-primary/50'
                          : 'border-border hover:border-border/80'
                      } ${style.bg}`}
                    >
                      <div className="flex gap-3 p-3">
                        {/* Game Cover */}
                        <div className={`relative flex-shrink-0 w-14 h-[72px] rounded-lg overflow-hidden bg-zinc-800 ${
                          h.importance === 'high' ? 'ring-2 ring-primary/30' : 'ring-1 ring-white/10'
                        }`}>
                          {h.game_cover_url && h.game_cover_url.length > 0 ? (
                            <Image
                              src={h.game_cover_url}
                              alt={h.game_name || 'Game'}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                              <Gamepad2 className="w-5 h-5" />
                            </div>
                          )}
                          {/* Early Signal Badge */}
                          {h.is_early_signal && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                              <TrendingUp className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Signal Chips */}
                          <div className="flex items-center gap-2 text-xs mb-1.5 flex-wrap">
                            <span className="text-muted-foreground font-medium">{h.game_name}</span>
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] uppercase ${
                              h.category === 'update' ? 'bg-amber-500/20 text-amber-400' :
                              h.category === 'dlc' ? 'bg-purple-500/20 text-purple-400' :
                              h.category === 'announcement' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {CATEGORY_LABELS[h.category] || h.category}
                            </span>
                            {style.label && ImportanceIcon && (
                              <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${style.color}`}>
                                <ImportanceIcon className="w-3 h-3" />
                                {style.label}
                              </span>
                            )}
                            {h.is_early_signal && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-400 font-medium">
                                Early Signal
                              </span>
                            )}
                          </div>

                          <p className="text-sm font-semibold line-clamp-2">{h.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{h.tldr}</p>

                          {/* Why It Matters */}
                          {h.why_it_matters && (
                            <div className="mt-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
                              <div className="flex items-start gap-1.5 text-xs">
                                <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                                <span className="text-primary font-medium">{h.why_it_matters}</span>
                              </div>
                            </div>
                          )}
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
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Updates By Game</h4>
              <div className="space-y-2">
                {Object.entries(digest.game_updates).map(([game, update]) => {
                  const hasMultipleUpdates = update.update_count >= 3
                  return (
                    <div
                      key={game}
                      className={`rounded-xl border overflow-hidden transition-all ${
                        hasMultipleUpdates
                          ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent'
                          : 'border-border bg-muted/30'
                      }`}
                    >
                      <button
                        onClick={() => toggleGame(game)}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-colors"
                      >
                        {/* Game Cover */}
                        <div className={`relative flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden bg-zinc-800 ${
                          hasMultipleUpdates ? 'ring-2 ring-amber-500/30' : 'ring-1 ring-white/10'
                        }`}>
                          {update.game_cover_url && update.game_cover_url.length > 0 ? (
                            <Image
                              src={update.game_cover_url}
                              alt={update.game_name || 'Game'}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                              <Gamepad2 className="w-5 h-5" />
                            </div>
                          )}
                          {/* Update count badge */}
                          {update.update_count > 1 && (
                            <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg ${
                              hasMultipleUpdates ? 'bg-amber-500 text-black' : 'bg-zinc-700 text-white'
                            }`}>
                              {update.update_count}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold truncate">{update.game_name}</span>
                            {hasMultipleUpdates && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-400 font-medium">
                                Active
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {update.update_count} update{update.update_count !== 1 ? 's' : ''} this period
                          </span>
                        </div>
                        {expandedGames.has(game) ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </button>

                      {expandedGames.has(game) && (
                        <div className="px-3 pb-3 ml-[60px] border-t border-white/5 pt-3">
                          <p className="text-sm text-muted-foreground mb-3">{update.summary}</p>
                          {update.highlights.length > 0 && (
                            <ul className="text-sm space-y-2">
                              {update.highlights.map((h, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                                  <span>{h}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {update.game_slug && (
                            <Link
                              href={`/games/${update.game_slug}`}
                              className="inline-flex items-center gap-1 mt-3 text-xs text-primary hover:text-primary/80 font-medium"
                            >
                              View game details
                              <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
