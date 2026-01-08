'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Check, Loader2, Crown } from 'lucide-react'
import Link from 'next/link'
import { addToBacklog } from '@/app/(main)/backlog/actions'

type AddToBacklogButtonProps = {
  gameId: string
  gameName: string
}

type LimitError = {
  limitReached: true
  currentCount: number
  maxCount: number
}

export function AddToBacklogButton({ gameId, gameName }: AddToBacklogButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isAdded, setIsAdded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [limitError, setLimitError] = useState<LimitError | null>(null)
  const router = useRouter()

  function handleClick() {
    setError(null)
    setLimitError(null)
    startTransition(async () => {
      try {
        const result = await addToBacklog(gameId)
        if (result && 'limitReached' in result && result.limitReached) {
          setLimitError(result as LimitError)
          return
        }
        setIsAdded(true)
        // Refresh the page to show the backlog view
        setTimeout(() => {
          router.refresh()
        }, 500)
      } catch {
        setError('Failed to add to backlog')
      }
    })
  }

  if (isAdded) {
    return (
      <div className="flex items-center gap-2 text-green-400">
        <Check className="h-4 w-4" />
        <span className="text-sm font-medium">Added to backlog!</span>
      </div>
    )
  }

  if (limitError) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-amber-400">
          <span className="text-sm font-medium">
            Backlog full ({limitError.currentCount}/{limitError.maxCount})
          </span>
        </div>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          <Crown className="h-4 w-4" />
          Upgrade for unlimited
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        Add to Backlog
      </button>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}
