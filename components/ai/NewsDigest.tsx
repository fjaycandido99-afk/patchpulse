'use client'

import { useState, useEffect } from 'react'
import { Loader2, Sparkles, RefreshCw, Newspaper } from 'lucide-react'
import Link from 'next/link'

type DigestResult = {
  summary: string
  total_news: number
}

export function NewsDigest() {
  const [digestType, setDigestType] = useState<'daily' | 'weekly'>('daily')
  const [loading, setLoading] = useState(true)
  const [digest, setDigest] = useState<DigestResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [needsUpgrade, setNeedsUpgrade] = useState(false)

  useEffect(() => {
    fetchDigest()
  }, [digestType])

  const fetchDigest = async (forceRefresh = false) => {
    if (needsUpgrade) return // Don't re-fetch if we know it needs upgrade

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ type: digestType })
      if (forceRefresh) params.set('refresh', 'true')
      const response = await fetch(`/api/ai/digest?${params}`)
      const data = await response.json()

      if (response.status === 403 && data.upgrade) {
        setNeedsUpgrade(true)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get digest')
      }

      setDigest({
        summary: data?.summary || 'No news to summarize',
        total_news: typeof data?.total_news === 'number' ? data.total_news : 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (needsUpgrade) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-primary/10 p-2">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">News Summary</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Get AI-powered digests of news from your followed games.
            </p>
            <Link
              href="/pricing"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Upgrade to Pro to unlock
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">News Summary</h3>
            <p className="text-sm text-muted-foreground">AI digest of your followed games</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDigest(true)}
            disabled={loading}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            title="Refresh"
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
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      ) : digest ? (
        <div className="flex gap-4 p-4 rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          {/* Visual */}
          <div className="hidden sm:flex flex-shrink-0 w-16 h-16 rounded-xl bg-primary/20 items-center justify-center">
            <Newspaper className="w-8 h-8 text-primary" />
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed">{digest.summary}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {digest.total_news} articles from your followed games
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
