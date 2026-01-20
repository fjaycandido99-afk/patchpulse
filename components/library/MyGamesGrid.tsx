'use client'

import { useState, useMemo } from 'react'
import { BacklogCard } from '@/components/backlog/BacklogCard'
import { GenreFilter } from '@/components/ui/GenreFilter'
import { relativeDaysText } from '@/lib/dates'
import { Play, Pause, Clock, Check, X, Gamepad2 } from 'lucide-react'

type BacklogStatus = 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped'

type BacklogItem = {
  id: string
  game_id: string
  status: BacklogStatus
  progress: number
  next_note: string | null
  last_played_at: string | null
  game: {
    name: string
    cover_url: string | null
    steam_app_id?: number | null
    genre?: string | null
  }
  latestPatch: {
    id: string
    title: string
    published_at: string
    summary_tldr: string | null
  } | null
  recentPatches: { id: string }[]
  steamStats?: {
    playtime_minutes: number | null
    last_played_at: string | null
  } | null
}

type MyGamesGridProps = {
  items: BacklogItem[]
}

const STATUS_ORDER: BacklogStatus[] = ['playing', 'paused', 'backlog', 'finished', 'dropped']

const STATUS_CONFIG: Record<BacklogStatus, {
  icon: typeof Play
  label: string
  color: string
}> = {
  playing: { icon: Play, label: 'Currently Playing', color: 'text-green-400' },
  paused: { icon: Pause, label: 'Paused', color: 'text-amber-400' },
  backlog: { icon: Clock, label: 'In Backlog', color: 'text-blue-400' },
  finished: { icon: Check, label: 'Completed', color: 'text-purple-400' },
  dropped: { icon: X, label: 'Dropped', color: 'text-zinc-400' },
}

export function MyGamesGrid({ items }: MyGamesGridProps) {
  const [selectedGenre, setSelectedGenre] = useState('')

  const filteredItems = useMemo(() => {
    if (!selectedGenre) return items
    return items.filter((item) =>
      item.game.genre?.toLowerCase().includes(selectedGenre.toLowerCase())
    )
  }, [items, selectedGenre])

  // Group items by status
  const groupedItems = useMemo(() => {
    const groups: Record<BacklogStatus, BacklogItem[]> = {
      playing: [],
      paused: [],
      backlog: [],
      finished: [],
      dropped: [],
    }

    filteredItems.forEach((item) => {
      groups[item.status].push(item)
    })

    return groups
  }, [filteredItems])

  // Get non-empty groups in order
  const activeGroups = STATUS_ORDER.filter((status) => groupedItems[status].length > 0)

  return (
    <div className="space-y-4">
      <GenreFilter
        selected={selectedGenre}
        onChange={setSelectedGenre}
      />

      {selectedGenre && (
        <p className="text-sm text-muted-foreground">
          {filteredItems.length} {filteredItems.length === 1 ? 'game' : 'games'} in {selectedGenre}
        </p>
      )}

      {filteredItems.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
            <Gamepad2 className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            {selectedGenre ? `No ${selectedGenre} games in your library` : 'No games in your library'}
          </p>
          <p className="text-xs text-muted-foreground">
            {selectedGenre ? 'Try a different genre' : 'Add games to start tracking'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeGroups.map((status, groupIndex) => {
            const config = STATUS_CONFIG[status]
            const Icon = config.icon
            const statusItems = groupedItems[status]

            return (
              <div key={status}>
                {/* Section header - only show if multiple groups */}
                {activeGroups.length > 1 && (
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <Icon className={`h-4 w-4 ${config.color}`} />
                    <span className={`font-medium ${config.color}`}>{config.label}</span>
                    <span className="text-muted-foreground">({statusItems.length})</span>
                  </div>
                )}

                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {statusItems.map((item) => (
                    <BacklogCard
                      key={item.id}
                      href={`/backlog/${item.game_id}`}
                      title={item.game.name}
                      imageUrl={item.game.cover_url}
                      status={item.status}
                      nextNote={item.next_note}
                      lastPlayedText={
                        item.last_played_at
                          ? `Last played ${relativeDaysText(item.last_played_at)}`
                          : null
                      }
                      latestPatch={item.latestPatch}
                      patchCount={item.recentPatches.length}
                      steamAppId={item.game.steam_app_id}
                      steamStats={item.steamStats}
                      genre={item.game.genre}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
