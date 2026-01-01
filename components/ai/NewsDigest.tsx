'use client'

import { useState, useEffect } from 'react'
import { Loader2, Sparkles, RefreshCw } from 'lucide-react'

type DigestResult = {
  summary: string
  total_news: number
}

export function NewsDigest() {
  const [digestType, setDigestType] = useState<'daily' | 'weekly'>('daily')
  const [loading, setLoading] = useState(true)
  const [digest, setDigest] = useState<DigestResult | null>(null)
  const [error, setError] = useState<string | null>(null)

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
        <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <p className="text-sm">{digest.summary}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {digest.total_news} articles from your followed games
          </p>
        </div>
      ) : null}
    </div>
  )
}
