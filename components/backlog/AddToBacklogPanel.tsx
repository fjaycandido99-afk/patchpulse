'use client'

import { useState, useTransition } from 'react'
import { addToBacklog } from '@/app/(main)/backlog/actions'

type BacklogStatus = 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped'

type FollowedGame = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  inBacklog: boolean
  backlogStatus: BacklogStatus | null
}

type AddToBacklogPanelProps = {
  games: FollowedGame[]
}

const STATUS_LABELS: Record<BacklogStatus, string> = {
  playing: 'Playing',
  paused: 'Paused',
  backlog: 'Backlog',
  finished: 'Finished',
  dropped: 'Dropped',
}

const STATUS_COLORS: Record<BacklogStatus, string> = {
  playing: 'bg-green-500/10 text-green-400',
  paused: 'bg-yellow-500/10 text-yellow-400',
  backlog: 'bg-blue-500/10 text-blue-400',
  finished: 'bg-purple-500/10 text-purple-400',
  dropped: 'bg-gray-500/10 text-gray-400',
}

export function AddToBacklogPanel({ games }: AddToBacklogPanelProps) {
  const [search, setSearch] = useState('')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleAdd(gameId: string, gameName: string) {
    setMessage(null)
    setPendingId(gameId)
    startTransition(async () => {
      try {
        await addToBacklog(gameId)
        setAddedIds((prev) => new Set(prev).add(gameId))
        setMessage({ type: 'success', text: `Added ${gameName}` })
        setTimeout(() => setMessage(null), 2000)
      } catch {
        setMessage({ type: 'error', text: 'Failed to add' })
      } finally {
        setPendingId(null)
      }
    })
  }

  const gamesNotInBacklog = filteredGames.filter(
    (g) => !g.inBacklog && !addedIds.has(g.id)
  )
  const gamesInBacklog = filteredGames.filter(
    (g) => g.inBacklog || addedIds.has(g.id)
  )

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="font-semibold mb-3">Add to Backlog</h3>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search followed games..."
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-3"
      />

      {message && (
        <p
          className={`text-sm mb-3 ${
            message.type === 'success' ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {message.text}
        </p>
      )}

      {filteredGames.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {games.length === 0
            ? 'Follow some games first to add them to your backlog.'
            : 'No games match your search.'}
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {gamesNotInBacklog.map((game) => (
            <div
              key={game.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-background p-2"
            >
              <span className="text-sm truncate">{game.name}</span>
              <button
                onClick={() => handleAdd(game.id, game.name)}
                disabled={isPending}
                className="flex-shrink-0 rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {pendingId === game.id ? 'Adding...' : 'Add'}
              </button>
            </div>
          ))}

          {gamesInBacklog.length > 0 && gamesNotInBacklog.length > 0 && (
            <div className="border-t border-border my-2 pt-2">
              <p className="text-xs text-muted-foreground mb-2">Already in backlog</p>
            </div>
          )}

          {gamesInBacklog.map((game) => {
            const status = addedIds.has(game.id) ? 'backlog' : game.backlogStatus
            return (
              <div
                key={game.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-background/50 p-2 opacity-70"
              >
                <span className="text-sm truncate">{game.name}</span>
                {status && (
                  <span
                    className={`flex-shrink-0 rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}
                  >
                    {STATUS_LABELS[status]}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
