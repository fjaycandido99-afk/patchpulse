'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, Play, X, ChevronRight, Zap } from 'lucide-react'
import { dismissReturnSuggestion, actOnReturnSuggestion } from '@/app/(main)/backlog/actions'
import { formatDate } from '@/lib/dates'

type ReturnSuggestion = {
  id: string
  gameId: string
  gameName: string
  coverUrl: string | null
  patchTitle: string
  pauseReason: string
  matchReason: string
  confidence: number
  patchPublishedAt: string
}

type Props = {
  suggestions: ReturnSuggestion[]
}

export function ReturnSuggestions({ suggestions: initialSuggestions }: Props) {
  const [suggestions, setSuggestions] = useState(initialSuggestions)
  const [isPending, startTransition] = useTransition()

  if (suggestions.length === 0) {
    return null
  }

  function handleDismiss(suggestionId: string) {
    startTransition(async () => {
      try {
        await dismissReturnSuggestion(suggestionId)
        setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId))
      } catch (error) {
        console.error('Failed to dismiss:', error)
      }
    })
  }

  function handleReturn(suggestion: ReturnSuggestion) {
    startTransition(async () => {
      try {
        await actOnReturnSuggestion(suggestion.id, suggestion.gameId)
        setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id))
      } catch (error) {
        console.error('Failed to return:', error)
      }
    })
  }

  // Get confidence label
  function getConfidenceLabel(confidence: number): string {
    if (confidence >= 0.8) return 'High match'
    if (confidence >= 0.6) return 'Good match'
    return 'Possible match'
  }

  return (
    <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-full bg-violet-500/20">
          <Sparkles className="h-4 w-4 text-violet-400" />
        </div>
        <h2 className="font-semibold text-violet-300">Time to Return?</h2>
        <span className="ml-auto px-2 py-0.5 rounded-full bg-violet-500/20 text-[10px] text-violet-400 font-medium">
          AI
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Based on why you paused, these updates might bring you back.
      </p>

      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="rounded-xl bg-card border border-border overflow-hidden"
          >
            <div className="flex">
              {/* Larger cover image with AI indicator */}
              <Link
                href={`/backlog/${suggestion.gameId}`}
                className="relative w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0"
              >
                {suggestion.coverUrl ? (
                  <Image
                    src={suggestion.coverUrl}
                    alt={suggestion.gameName}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <span className="text-lg font-bold text-muted-foreground">
                      {suggestion.gameName.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                {/* AI match indicator */}
                <div className="absolute top-1 left-1 p-1 rounded bg-violet-500/90">
                  <Zap className="h-3 w-3 text-white" />
                </div>
                {/* Confidence bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                    style={{ width: `${Math.round(suggestion.confidence * 100)}%` }}
                  />
                </div>
              </Link>

              {/* Content */}
              <div className="flex-1 p-3 min-w-0 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <Link
                      href={`/backlog/${suggestion.gameId}`}
                      className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
                    >
                      {suggestion.gameName}
                    </Link>
                    <p className="text-xs text-violet-400 line-clamp-1">
                      {suggestion.patchTitle}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDismiss(suggestion.id)}
                    disabled={isPending}
                    className="p-1 -m-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                    title="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Match Reason - the key value prop */}
                <div className="flex-1 my-2">
                  <p className="text-xs text-foreground/90 line-clamp-2">
                    {suggestion.matchReason}
                  </p>
                </div>

                {/* Original pause reason */}
                <p className="text-[11px] text-muted-foreground/70 line-clamp-1 mb-2">
                  You said: &ldquo;{suggestion.pauseReason}&rdquo;
                </p>

                {/* Confidence + Actions */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-violet-400/80 font-medium">
                    {getConfidenceLabel(suggestion.confidence)}
                  </span>
                  <div className="flex-1" />
                  <button
                    onClick={() => handleReturn(suggestion)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30 active:bg-violet-500/40 transition-colors disabled:opacity-50"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Resume</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {suggestions.length > 0 && (
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
          <Sparkles className="h-3 w-3" />
          <span>Matches based on patch content + your pause reasons</span>
        </div>
      )}
    </div>
  )
}
