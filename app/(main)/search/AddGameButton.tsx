'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, Check, AlertCircle, Sparkles } from 'lucide-react'
import { discoverAndAddGame, type DiscoverGameResult } from './actions'

type AddGameButtonProps = {
  searchQuery: string
  onGameAdded?: (game: { id: string; name: string; slug: string }) => void
}

export function AddGameButton({ searchQuery, onGameAdded }: AddGameButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'queued' | 'error'>('idle')
  const [result, setResult] = useState<DiscoverGameResult | null>(null)
  const router = useRouter()

  async function handleAddGame() {
    if (status === 'loading') return

    setStatus('loading')
    setResult(null)

    try {
      const res = await discoverAndAddGame(searchQuery)
      setResult(res)

      if (res.success && res.game) {
        setStatus('success')
        onGameAdded?.(res.game)
        // Refresh the page to show the new game in results
        setTimeout(() => {
          router.refresh()
        }, 1500)
      } else if (res.needsReview) {
        setStatus('queued')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
      setResult({ success: false, message: 'Something went wrong' })
    }
  }

  if (status === 'success' && result?.game) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-green-500/30 bg-green-500/10">
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <p className="font-medium text-green-400">{result.game.name} added!</p>
          <p className="text-xs text-muted-foreground">You can now follow and track it</p>
        </div>
      </div>
    )
  }

  if (status === 'queued') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <p className="font-medium text-amber-400">Queued for review</p>
          <p className="text-xs text-muted-foreground">{result?.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
        <Sparkles className="w-6 h-6 text-primary" />
      </div>

      <h3 className="font-semibold mb-1">Can't find "{searchQuery}"?</h3>
      <p className="text-sm text-muted-foreground mb-4">
        We'll use AI to find and add it automatically
      </p>

      <button
        onClick={handleAddGame}
        disabled={status === 'loading'}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Add This Game
          </>
        )}
      </button>

      {status === 'error' && result && (
        <p className="mt-3 text-sm text-red-400">{result.message}</p>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        3 game adds per day • Takes ~5 seconds
      </p>
    </div>
  )
}
