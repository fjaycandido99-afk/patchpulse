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

type FavoriteGamesProps = {
  favoriteGames: Game[]
  allGames: Game[] // All followed + backlog games to pick from
  maxFavorites?: number
}

export function FavoriteGames({
  favoriteGames,
  allGames,
  maxFavorites = 5,
}: FavoriteGamesProps) {
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
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-semibold">Favorite Games</h3>
          </div>
        </div>

        <div className="text-center py-6">
          <Star className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground mb-3">Showcase your favorite games</p>
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Favorites
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
          <h3 className="text-lg font-semibold">Favorite Games</h3>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
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
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Save'
              )}
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
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
                <p className="text-sm text-muted-foreground italic">
                  No favorites selected
                </p>
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
                    <p className="p-3 text-sm text-muted-foreground text-center">
                      No games found
                    </p>
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
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {favoriteGames.map((game) => (
            <div
              key={game.id}
              className="flex-shrink-0 w-24 group"
            >
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                {game.cover_url ? (
                  <Image
                    src={game.cover_url}
                    alt={game.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Gamepad2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-1 right-1 p-1 rounded-full bg-amber-500">
                  <Star className="h-2.5 w-2.5 text-white fill-white" />
                </div>
              </div>
              <p className="text-xs font-medium mt-1.5 truncate text-center">
                {game.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
