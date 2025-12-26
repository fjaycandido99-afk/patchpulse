'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, X, Play, Pause } from 'lucide-react'
import { updateBacklogItem } from '@/app/(main)/backlog/actions'

type StaleGame = {
  backlogItemId: string
  gameId: string
  gameName: string
  coverUrl: string | null
  lastPlayedAt: string
  daysSincePlayed: number
}

type Props = {
  staleGames: StaleGame[]
}

const PAUSE_REASONS = [
  'Stuck on a difficult part',
  'Too many bugs/crashes',
  'Waiting for DLC/update',
  'Not enough time',
  'Lost interest',
]

export function StaleGamesPrompt({ staleGames }: Props) {
  const [games, setGames] = useState(staleGames)
  const [selectedGame, setSelectedGame] = useState<StaleGame | null>(null)
  const [pauseReason, setPauseReason] = useState('')
  const [isPending, startTransition] = useTransition()

  if (games.length === 0) {
    return null
  }

  function handleDismiss(gameId: string) {
    setGames((prev) => prev.filter((g) => g.gameId !== gameId))
  }

  function handleStillPlaying(game: StaleGame) {
    startTransition(async () => {
      try {
        await updateBacklogItem({
          gameId: game.gameId,
          status: 'playing',
        })
        handleDismiss(game.gameId)
      } catch (error) {
        console.error('Failed to update:', error)
      }
    })
  }

  function handlePause(game: StaleGame) {
    setSelectedGame(game)
    setPauseReason('')
  }

  function handleSubmitPause() {
    if (!selectedGame) return

    startTransition(async () => {
      try {
        await updateBacklogItem({
          gameId: selectedGame.gameId,
          status: 'paused',
          pauseReason: pauseReason.trim() || null,
        })
        handleDismiss(selectedGame.gameId)
        setSelectedGame(null)
      } catch (error) {
        console.error('Failed to pause:', error)
      }
    })
  }

  return (
    <>
      {/* Bottom Sheet Modal (mobile-friendly) */}
      {selectedGame && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedGame(null)}
        >
          {/* Bottom sheet container */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl p-5 pb-8 space-y-4 animate-in slide-in-from-bottom duration-300 sm:relative sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md sm:rounded-xl sm:border sm:pb-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle (mobile) */}
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto sm:hidden" />

            {/* Game info header */}
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                {selectedGame.coverUrl ? (
                  <Image
                    src={selectedGame.coverUrl}
                    alt={selectedGame.gameName}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                    {selectedGame.gameName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold">
                  Pausing {selectedGame.gameName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll notify you when relevant updates arrive
                </p>
              </div>
            </div>

            {/* Reason chips - larger touch targets */}
            <div className="flex flex-wrap gap-2">
              {PAUSE_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setPauseReason(reason)}
                  className={`px-4 py-2.5 text-sm rounded-full border transition-colors active:scale-95 ${
                    pauseReason === reason
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-card border-border hover:border-amber-500/30 active:bg-muted'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <textarea
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              rows={2}
              placeholder="Or type your own reason..."
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />

            {/* Actions - full width on mobile */}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedGame(null)}
                disabled={isPending}
                className="w-full sm:w-auto px-5 py-3 text-sm font-medium rounded-lg border border-border hover:bg-muted active:bg-muted/80 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitPause}
                disabled={isPending}
                className="w-full sm:w-auto px-5 py-3 text-sm font-medium rounded-lg bg-amber-500 text-black hover:bg-amber-400 active:bg-amber-600 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Pausing...' : 'Pause Game'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stale Games Card */}
      <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-full bg-amber-500/20">
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <h2 className="font-semibold text-amber-300">Still Playing?</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          These games haven&apos;t been updated in a while.
        </p>

        <div className="space-y-3">
          {games.slice(0, 3).map((game) => (
            <div
              key={game.gameId}
              className="rounded-xl bg-card border border-border overflow-hidden"
            >
              <div className="flex">
                {/* Larger cover image */}
                <Link
                  href={`/backlog/${game.gameId}`}
                  className="relative w-20 h-24 sm:w-16 sm:h-20 flex-shrink-0"
                >
                  {game.coverUrl ? (
                    <Image
                      src={game.coverUrl}
                      alt={game.gameName}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {game.gameName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  {/* Days indicator overlay */}
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-amber-400 font-medium">
                    {game.daysSincePlayed}d
                  </div>
                </Link>

                {/* Content */}
                <div className="flex-1 p-3 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Link
                      href={`/backlog/${game.gameId}`}
                      className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
                    >
                      {game.gameName}
                    </Link>
                    <button
                      onClick={() => handleDismiss(game.gameId)}
                      className="p-1 -m-1 text-muted-foreground hover:text-foreground transition-colors"
                      title="Dismiss"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground mb-auto">
                    Last played {game.daysSincePlayed} days ago
                  </p>

                  {/* Mobile-friendly action buttons */}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleStillPlaying(game)}
                      disabled={isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 active:bg-green-500/40 transition-colors disabled:opacity-50"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Still Playing</span>
                    </button>
                    <button
                      onClick={() => handlePause(game)}
                      disabled={isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 active:bg-amber-500/40 transition-colors disabled:opacity-50"
                    >
                      <Pause className="h-3.5 w-3.5" />
                      <span>Pause</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {games.length > 3 && (
          <p className="mt-3 text-xs text-muted-foreground text-center">
            +{games.length - 3} more games
          </p>
        )}
      </div>
    </>
  )
}
