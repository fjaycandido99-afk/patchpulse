'use client'

import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { SpotlightGameCard } from './SpotlightGameCard'
import { GenreFilter } from '@/components/ui/GenreFilter'

type Game = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  hero_url?: string | null
  release_date: string | null
  days_until?: number
  days_since?: number
  genre: string | null
  is_live_service: boolean
  platforms?: string[] | null
}

type GameGridWithSearchProps = {
  games: Game[]
  type: 'upcoming' | 'new'
  variant?: 'default' | 'featured'
  columns?: 'default' | 'featured'
  placeholder?: string
  showGenreFilter?: boolean
}

export function GameGridWithSearch({
  games,
  type,
  variant = 'default',
  columns = 'default',
  placeholder = 'Search games...',
  showGenreFilter = false,
}: GameGridWithSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')

  const filteredGames = useMemo(() => {
    let result = games

    // Filter by genre
    if (selectedGenre) {
      result = result.filter((game) =>
        game.genre?.toLowerCase().includes(selectedGenre.toLowerCase())
      )
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter((game) => {
        const nameMatch = game.name.toLowerCase().includes(query)
        const genreMatch = game.genre?.toLowerCase().includes(query)
        return nameMatch || genreMatch
      })
    }

    return result
  }, [games, searchQuery, selectedGenre])

  const gridClass =
    columns === 'featured'
      ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
      : 'grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'

  return (
    <div className="space-y-4">
      {/* Genre Filter */}
      {showGenreFilter && (
        <GenreFilter
          selected={selectedGenre}
          onChange={setSelectedGenre}
        />
      )}

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results count when filtering */}
      {(searchQuery || selectedGenre) && (
        <p className="text-sm text-muted-foreground">
          {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'} found
          {selectedGenre && ` in ${selectedGenre}`}
        </p>
      )}

      {/* Game Grid */}
      {filteredGames.length > 0 ? (
        <div className={gridClass}>
          {filteredGames.map((game) => (
            <SpotlightGameCard
              key={game.id}
              game={{
                ...game,
                platforms: game.platforms ?? undefined,
              }}
              type={type}
              variant={variant}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border py-12 text-center">
          <p className="text-muted-foreground">
            No games found for "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  )
}
