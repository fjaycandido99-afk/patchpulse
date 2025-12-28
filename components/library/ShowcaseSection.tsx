'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Gamepad2, Plus, X, Check } from 'lucide-react'
import { updateFavoriteGames } from '@/app/(main)/profile/actions'

type Game = {
  id: string
  name: string
  slug: string
  cover_url: string | null
}

type ShowcaseSectionProps = {
  favoriteGames: Game[]
  allGames: Game[]
  maxFavorites?: number
}

function ShowcaseCard({ game, rank }: { game: Game; rank: number }) {
  return (
    <Link
      href={`/backlog/${game.id}`}
      className="group relative flex flex-col"
    >
      {/* Cover with rank badge */}
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted ring-2 ring-amber-500/30 group-hover:ring-amber-500/50 transition-all">
        {game.cover_url ? (
          <Image
            src={game.cover_url}
            alt={game.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 30vw, 150px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <Gamepad2 className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Rank badge */}
        <div className="absolute top-2 left-2 flex items-center justify-center h-6 w-6 rounded-full bg-amber-500 text-white text-xs font-bold shadow-lg">
          {rank}
        </div>

        {/* Star icon */}
        <div className="absolute top-2 right-2">
          <Star className="h-4 w-4 text-amber-400 fill-amber-400 drop-shadow-lg" />
        </div>
      </div>

      {/* Game name */}
      <p className="mt-2 text-sm font-medium text-center truncate group-hover:text-primary transition-colors">
        {game.name}
      </p>
    </Link>
  )
}

function AddFavoriteCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-amber-500/50 bg-card/50 hover:bg-card transition-all group"
    >
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
        <Plus className="h-5 w-5 text-muted-foreground group-hover:text-amber-400 transition-colors" />
      </div>
      <p className="mt-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
        Add favorite
      </p>
    </button>
  )
}

export function ShowcaseSection({ favoriteGames, allGames, maxFavorites = 5 }: ShowcaseSectionProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>(favoriteGames.map(g => g.id))
  const [isSaving, setIsSaving] = useState(false)

  const availableGames = allGames.filter(g => !selectedIds.includes(g.id))
  const emptySlots = Math.max(0, maxFavorites - favoriteGames.length)

  const handleToggleGame = (gameId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(gameId)) {
        return prev.filter(id => id !== gameId)
      }
      if (prev.length >= maxFavorites) {
        return prev
      }
      return [...prev, gameId]
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    await updateFavoriteGames(selectedIds)
    setIsSaving(false)
    setShowPicker(false)
  }

  if (favoriteGames.length === 0 && !showPicker) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/10 flex items-center justify-center">
          <Star className="h-6 w-6 text-amber-400" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No favorite games yet</p>
        <p className="text-muted-foreground text-xs mb-4">Pin up to {maxFavorites} of your all-time favorites</p>
        <button
          onClick={() => setShowPicker(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-sm font-medium border border-amber-500/20 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Favorites
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Showcase grid */}
      {!showPicker && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {favoriteGames.map((game, index) => (
            <ShowcaseCard key={game.id} game={game} rank={index + 1} />
          ))}
          {emptySlots > 0 && (
            <AddFavoriteCard onClick={() => setShowPicker(true)} />
          )}
        </div>
      )}

      {/* Edit button */}
      {!showPicker && favoriteGames.length > 0 && (
        <button
          onClick={() => setShowPicker(true)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Edit favorites
        </button>
      )}

      {/* Picker modal */}
      {showPicker && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Select Favorites</h3>
              <p className="text-xs text-muted-foreground">
                {selectedIds.length}/{maxFavorites} selected
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedIds(favoriteGames.map(g => g.id))
                setShowPicker(false)
              }}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Selected games */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedIds.map((id) => {
                const game = allGames.find(g => g.id === id) || favoriteGames.find(g => g.id === id)
                if (!game) return null
                return (
                  <button
                    key={id}
                    onClick={() => handleToggleGame(id)}
                    className="flex items-center gap-2 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm"
                  >
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="truncate max-w-32">{game.name}</span>
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                )
              })}
            </div>
          )}

          {/* Available games */}
          <div className="max-h-48 overflow-y-auto space-y-1">
            {availableGames.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Follow or add games to your backlog to pick favorites
              </p>
            ) : (
              availableGames.map(game => (
                <button
                  key={game.id}
                  onClick={() => handleToggleGame(game.id)}
                  disabled={selectedIds.length >= maxFavorites}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="relative h-10 w-8 rounded overflow-hidden flex-shrink-0">
                    {game.cover_url ? (
                      <Image src={game.cover_url} alt={game.name} fill className="object-cover" sizes="32px" />
                    ) : (
                      <div className="absolute inset-0 bg-muted flex items-center justify-center">
                        <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <span className="flex-1 text-sm text-left truncate">{game.name}</span>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </button>
              ))
            )}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Save Favorites
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
