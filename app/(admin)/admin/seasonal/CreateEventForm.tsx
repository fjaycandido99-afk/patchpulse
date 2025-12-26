'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createManualEvent } from './actions'

const EVENT_TYPES = [
  'winter',
  'halloween',
  'summer',
  'spring',
  'anniversary',
  'sale',
  'collaboration',
  'update',
  'launch',
  'esports',
  'custom',
]

export function CreateEventForm({
  games,
}: {
  games: Array<{ id: string; name: string }>
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const result = await createManualEvent({
      gameId: formData.get('gameId') as string,
      eventName: formData.get('eventName') as string,
      eventType: formData.get('eventType') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      coverUrl: (formData.get('coverUrl') as string) || undefined,
      logoUrl: (formData.get('logoUrl') as string) || undefined,
      heroUrl: (formData.get('heroUrl') as string) || undefined,
      brandColor: (formData.get('brandColor') as string) || undefined,
      sourceUrl: (formData.get('sourceUrl') as string) || undefined,
    })

    if (result.success) {
      e.currentTarget.reset()
      router.refresh()
    } else {
      setError(result.error || 'Failed to create event')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Game
          </label>
          <select
            name="gameId"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
          >
            <option value="">Select a game...</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Event Type
          </label>
          <select
            name="eventType"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
          >
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Event Name
        </label>
        <input
          type="text"
          name="eventName"
          required
          placeholder="e.g., Winterfest 2024"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/20 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Cover Image URL (optional)
        </label>
        <input
          type="url"
          name="coverUrl"
          placeholder="https://..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/20 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Logo URL (optional)
        </label>
        <input
          type="url"
          name="logoUrl"
          placeholder="https://..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/20 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Source URL (optional)
        </label>
        <input
          type="url"
          name="sourceUrl"
          placeholder="https://..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/20 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Brand Color (optional)
        </label>
        <input
          type="text"
          name="brandColor"
          placeholder="#ff0000"
          pattern="^#[0-9A-Fa-f]{6}$"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/20 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-medium hover:bg-white/15 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  )
}
