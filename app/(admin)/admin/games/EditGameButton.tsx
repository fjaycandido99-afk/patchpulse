'use client'

import { useState, useTransition } from 'react'
import { updateGame } from './actions'

type Game = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  platforms: string[] | null
  release_date: string | null
}

type Props = {
  game: Game
}

export function EditGameButton({ game }: Props) {
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(game.name)
  const [slug, setSlug] = useState(game.slug)
  const [coverUrl, setCoverUrl] = useState(game.cover_url || '')
  const [platforms, setPlatforms] = useState(game.platforms?.join(', ') || '')
  const [releaseDate, setReleaseDate] = useState(
    game.release_date ? game.release_date.split('T')[0] : ''
  )

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const result = await updateGame({
        id: game.id,
        name,
        slug,
        coverUrl: coverUrl || undefined,
        platforms: platforms || undefined,
        releaseDate: releaseDate || undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setIsEditing(false)
      }
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError(null)
    setName(game.name)
    setSlug(game.slug)
    setCoverUrl(game.cover_url || '')
    setPlatforms(game.platforms?.join(', ') || '')
    setReleaseDate(game.release_date ? game.release_date.split('T')[0] : '')
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="px-2 py-1 text-xs font-medium text-zinc-500 hover:text-white transition-colors"
      >
        Edit
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg border border-white/10 bg-zinc-900 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Edit Game</h3>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                className="input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">Cover URL</label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://..."
              className="input"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300">Platforms</label>
              <input
                type="text"
                value={platforms}
                onChange={(e) => setPlatforms(e.target.value)}
                placeholder="PC, PlayStation, Xbox"
                className="input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300">Release Date</label>
              <input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg px-4 py-3 text-sm bg-red-500/10 text-red-400 border border-red-500/20">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="btn-primary flex-1 px-4"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
