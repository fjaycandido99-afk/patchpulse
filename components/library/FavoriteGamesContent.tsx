'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, Plus, X, Loader2, Gamepad2 } from 'lucide-react'
import { updateFavoriteGames } from '@/app/(main)/profile/actions'

type Game = {
  id: string
  name: string
  slug: string
  cover_url: string | null
}

type FavoriteGamesContentProps = {
  favoriteGames: Game[]
  allGames: Game[]
  maxFavorites?: number
}

export function FavoriteGamesContent({
  favoriteGames,
  allGames,
  maxFavorites = 5,
}: FavoriteGamesContentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>(
    favoriteGames.map((g) => g.id)
  )
  const [isSaving, setIsSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const availableGames = allGames.filter(
    (g) =>
      !selectedIds.includes(g.id) &&
      g.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  async function handleSave() {
    setIsSaving(true)
    try {
      const result = await updateFavoriteGames(selectedIds)
      if (result.error) {
        alert(result.error)
      } else {
        setIsEditing(false)
      }
    } catch {
      alert('Failed to save favorites')
    } finally {
      setIsSaving(false)
    }
  }

  function handleAdd(gameId: string) {
    if (selectedIds.length < maxFavorites) {
      setSelectedIds([...selectedIds, gameId])
    }
  }

  function handleRemove(gameId: string) {
    setSelectedIds(selectedIds.filter((id) => id !== gameId))
  }

  const selectedGames = selectedIds
    .map((id) => allGames.find((g) => g.id === id))
    .filter((g): g is Game => g !== undefined)

  if (!isEditing && favoriteGames.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/10 flex items-center justify-center">
          <Star className="h-6 w-6 text-amber-400" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No favorites yet</p>
        <p className="text-muted-foreground text-xs mb-4">Pin up to 5 games you love</p>
        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-sm font-medium border border-amber-500/20 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Favorites
        </button>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* Header with actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => {
              setSelectedIds(favoriteGames.map((g) => g.id))
              setIsEditing(false)
            }}
            className="px-3 py-1.5 text-sm rounded-lg hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </button>
        </div>

        {/* Selected favorites */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Selected ({selectedIds.length}/{maxFavorites})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedGames.map((game) => (
              <div
                key={game.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30"
              >
                {game.cover_url && (
                  <div className="relative h-6 w-6 rounded overflow-hidden">
                    <Image
                      src={game.cover_url}
                      alt={game.name}
                      fill
                      className="object-cover"
                      sizes="24px"
                    />
                  </div>
                )}
                <span className="text-sm">{game.name}</span>
                <button
                  onClick={() => handleRemove(game.id)}
                  className="p-0.5 rounded hover:bg-amber-500/20"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {selectedIds.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No favorites selected</p>
            )}
          </div>
        </div>

        {/* Search and add */}
        {selectedIds.length < maxFavorites && (
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your games..."
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />

            {searchQuery && (
              <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border bg-card">
                {availableGames.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground text-center">No games found</p>
                ) : (
                  availableGames.slice(0, 10).map((game) => (
                    <button
                      key={game.id}
                      onClick={() => handleAdd(game.id)}
                      className="flex items-center gap-3 w-full p-2 hover:bg-muted text-left transition-colors"
                    >
                      {game.cover_url ? (
                        <div className="relative h-8 w-8 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={game.cover_url}
                            alt={game.name}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                          <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-sm truncate">{game.name}</span>
                      <Plus className="h-4 w-4 ml-auto text-muted-foreground" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-3">
        <button
          onClick={() => setIsEditing(true)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Edit
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {favoriteGames.map((game) => (
          <div key={game.id} className="flex-shrink-0 w-20">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
              {game.cover_url ? (
                <Image
                  src={game.cover_url}
                  alt={game.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Gamepad2 className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-1 right-1 p-0.5 rounded-full bg-amber-500">
                <Star className="h-2 w-2 text-white fill-white" />
              </div>
            </div>
            <p className="text-xs font-medium mt-1.5 truncate text-center">{game.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
