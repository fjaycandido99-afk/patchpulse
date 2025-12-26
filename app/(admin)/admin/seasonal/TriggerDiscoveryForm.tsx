'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { triggerDiscovery } from './actions'

export function TriggerDiscoveryForm({
  games,
}: {
  games: Array<{ id: string; name: string }>
}) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedGame, setSelectedGame] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedGame) return

    setLoading(true)
    setMessage(null)

    const result = await triggerDiscovery(selectedGame)

    if (result.success) {
      setMessage({
        type: 'success',
        text: `Discovery job queued (ID: ${result.jobId}). It will be processed shortly.`,
      })
      setSelectedGame('')
    } else {
      setMessage({
        type: 'error',
        text: result.error || 'Failed to trigger discovery',
      })
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <p className="text-sm text-zinc-400">
        Trigger an AI-powered scan to discover seasonal artwork for a specific game.
        The scan will search for active events, promotions, and seasonal content.
      </p>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex gap-3">
        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
        >
          <option value="">Select a game...</option>
          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading || !selectedGame}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-400 font-medium hover:bg-violet-500/30 disabled:opacity-50 transition-colors"
        >
          <Search className="w-4 h-4" />
          {loading ? 'Scanning...' : 'Scan'}
        </button>
      </div>
    </form>
  )
}
