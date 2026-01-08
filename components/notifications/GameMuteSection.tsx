'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Search, VolumeX, Volume2, Loader2, Gamepad2 } from 'lucide-react'
import { updateGameMuteStatus } from '@/app/(main)/notifications/settings/actions'
import { useToastUI } from '@/components/ui/toast'

type Game = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  muted: boolean
}

type Props = {
  games: Game[]
}

export function GameMuteSection({ games: initialGames }: Props) {
  const [games, setGames] = useState(initialGames)
  const [search, setSearch] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToastUI()

  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleToggleMute(gameId: string) {
    const game = games.find(g => g.id === gameId)
    if (!game) return

    const newMuted = !game.muted
    setLoadingId(gameId)

    // Optimistic update
    setGames(prev => prev.map(g =>
      g.id === gameId ? { ...g, muted: newMuted } : g
    ))

    startTransition(async () => {
      const result = await updateGameMuteStatus(gameId, newMuted)

      if (!result.success) {
        // Revert on failure
        setGames(prev => prev.map(g =>
          g.id === gameId ? { ...g, muted: !newMuted } : g
        ))
        toast.error(result.error || 'Failed to update mute status')
      } else {
        toast.success(newMuted ? `Muted ${game.name}` : `Unmuted ${game.name}`)
      }

      setLoadingId(null)
    })
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">Per-Game Settings</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Mute notifications for specific games you follow.
      </p>

      {games.length === 0 ? (
        <div className="text-center py-8">
          <Gamepad2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No followed games yet. Follow some games to customize notifications.
          </p>
        </div>
      ) : (
        <>
          {games.length > 5 && (
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter games..."
                className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
              />
            </div>
          )}

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredGames.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No games match your search.
              </p>
            ) : (
              filteredGames.map(game => {
                const isLoading = loadingId === game.id

                return (
                  <div
                    key={game.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-800/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
                        {game.cover_url ? (
                          <Image
                            src={game.cover_url}
                            alt={game.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-zinc-700">
                            <Gamepad2 className="w-5 h-5 text-zinc-500" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium truncate">{game.name}</span>
                    </div>

                    <button
                      onClick={() => handleToggleMute(game.id)}
                      disabled={isLoading || isPending}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        game.muted
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : game.muted ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                      {game.muted ? 'Muted' : 'Mute'}
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {games.some(g => g.muted) && (
            <p className="text-xs text-muted-foreground mt-4">
              Muted games will not trigger any notifications.
            </p>
          )}
        </>
      )}
    </section>
  )
}
