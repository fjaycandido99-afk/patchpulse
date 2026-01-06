'use client'

import { useState, useMemo } from 'react'
import { BacklogCard } from '@/components/backlog/BacklogCard'
import { GenreFilter } from '@/components/ui/GenreFilter'
import { relativeDaysText } from '@/lib/dates'

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

export function MyGamesGrid({ items }: MyGamesGridProps) {
  const [selectedGenre, setSelectedGenre] = useState('')

  const filteredItems = useMemo(() => {
    if (!selectedGenre) return items
    return items.filter((item) =>
      item.game.genre?.toLowerCase().includes(selectedGenre.toLowerCase())
    )
  }, [items, selectedGenre])

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
          <p className="text-sm font-medium text-muted-foreground">
            {selectedGenre ? `No ${selectedGenre} games in your library` : 'No games in your library'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedGenre ? 'Try a different genre' : 'Add games to start tracking'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
          {filteredItems.map((item) => (
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
            />
          ))}
        </div>
      )}
    </div>
  )
}
