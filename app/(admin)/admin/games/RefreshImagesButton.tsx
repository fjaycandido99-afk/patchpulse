'use client'

import { useState } from 'react'
import { RefreshCw, Loader2, ImageIcon } from 'lucide-react'

export function RefreshImagesButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const handleRefreshAll = async () => {
    if (!confirm('This will refresh cover images for up to 50 games from IGDB. Continue?')) {
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/refresh-game-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshAll: true }),
      })

      const data = await response.json()

      if (response.ok && data.ok) {
        setResult({
          type: 'success',
          message: `Updated ${data.updated}/${data.processed} game images${data.failed.length > 0 ? `. Failed: ${data.failed.length}` : ''}`,
        })
      } else {
        setResult({
          type: 'error',
          message: data.error || 'Failed to refresh images',
        })
      }
    } catch (err) {
      setResult({
        type: 'error',
        message: 'Network error. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleRefreshAll}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        Refresh All Images from IGDB
      </button>

      {result && (
        <div
          className={`px-3 py-2 rounded-lg text-sm ${
            result.type === 'success'
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          {result.message}
        </div>
      )}
    </div>
  )
}

// Individual game refresh button for use in game list
export function RefreshGameImageButton({ gameId, gameName }: { gameId: string; gameName: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/refresh-game-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameIds: [gameId] }),
      })

      const data = await response.json()

      if (response.ok && data.updated > 0) {
        // Reload to show new image
        window.location.reload()
      } else {
        alert(data.failed?.[0] || 'Could not find image on IGDB')
      }
    } catch {
      alert('Failed to refresh image')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isLoading}
      className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-cyan-400 transition-colors disabled:opacity-50"
      title="Refresh image from IGDB"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <ImageIcon className="w-4 h-4" />
      )}
    </button>
  )
}
