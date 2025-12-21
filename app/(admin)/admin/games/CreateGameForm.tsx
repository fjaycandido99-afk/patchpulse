'use client'

import { useState, useTransition } from 'react'
import { createGame } from './actions'

export function CreateGameForm() {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [slug, setSlug] = useState('')

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    if (!slug || slug === generateSlug(name.slice(0, -1))) {
      setSlug(generateSlug(name))
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createGame({
        name: formData.get('name') as string,
        slug: formData.get('slug') as string,
        coverUrl: (formData.get('coverUrl') as string) || undefined,
        releaseDate: (formData.get('releaseDate') as string) || undefined,
        platforms: (formData.get('platforms') as string) || undefined,
      })

      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Game created!' })
        ;(e.target as HTMLFormElement).reset()
        setSlug('')
        setTimeout(() => setMessage(null), 3000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-300">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            onChange={handleNameChange}
            placeholder="e.g., Elden Ring"
            className="input"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-300">
            Slug <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="e.g., elden-ring"
            className="input"
          />
          <p className="text-xs text-zinc-500">Lowercase, hyphens only. Must be unique.</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-300">Cover URL</label>
        <input
          type="url"
          name="coverUrl"
          placeholder="https://images.igdb.com/igdb/image/upload/t_cover_big/..."
          className="input"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-300">Platforms</label>
          <input
            type="text"
            name="platforms"
            placeholder="PC, PlayStation, Xbox"
            className="input"
          />
          <p className="text-xs text-zinc-500">Comma-separated</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-300">Release Date</label>
          <input type="date" name="releaseDate" className="input" />
        </div>
      </div>

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {message.text}
        </div>
      )}

      <button type="submit" disabled={isPending} className="btn-primary w-full sm:w-auto px-8">
        {isPending ? 'Creating...' : 'Create Game'}
      </button>
    </form>
  )
}
