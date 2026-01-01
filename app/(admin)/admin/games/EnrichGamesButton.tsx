'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

export function EnrichGamesButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    processed: number
    updated: number
    errors: number
  } | null>(null)

  const handleEnrich = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/enrich-games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 20 }),
      })

      const data = await res.json()

      if (data.success) {
        setResult({
          processed: data.processed,
          updated: data.updated,
          errors: data.errors,
        })
      } else {
        alert(data.error || 'Failed to enrich games')
      }
    } catch (error) {
      alert('Failed to enrich games')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleEnrich}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30 hover:bg-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {isLoading ? 'Enriching...' : 'Enrich Missing Data'}
      </button>

      {result && (
        <span className="text-sm text-zinc-400">
          Processed {result.processed} games, updated {result.updated}, {result.errors} errors
        </span>
      )}
    </div>
  )
}
