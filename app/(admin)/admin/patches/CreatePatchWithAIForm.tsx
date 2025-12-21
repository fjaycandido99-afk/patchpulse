'use client'

import { useState, useTransition } from 'react'
import { createPatchNoteWithAI } from './actions'

type Game = { id: string; name: string }

type Props = {
  games: Game[]
}

export function CreatePatchWithAIForm({ games }: Props) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createPatchNoteWithAI({
        gameId: formData.get('gameId') as string,
        title: formData.get('title') as string,
        rawText: formData.get('rawText') as string,
        sourceUrl: (formData.get('sourceUrl') as string) || undefined,
      })

      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        const aiStatus = result.aiJobQueued
          ? 'AI processing queued.'
          : 'Created (AI processing failed to queue).'
        setMessage({ type: 'success', text: `Patch created! ${aiStatus}` })
        ;(e.target as HTMLFormElement).reset()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
        <p className="text-sm text-blue-400">
          <strong>AI Mode:</strong> Paste raw patch notes and AI will automatically generate the summary, key changes, tags, and impact score.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-300">
          Game <span className="text-red-400">*</span>
        </label>
        <select name="gameId" required className="input">
          <option value="">Select a game</option>
          {games.map((g) => (
            <option key={g.id} value={g.id} className="bg-zinc-900">
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-300">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="title"
          required
          placeholder="e.g., Patch 14.2 Notes"
          className="input"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-300">
          Raw Patch Notes <span className="text-red-400">*</span>
        </label>
        <textarea
          name="rawText"
          required
          rows={12}
          placeholder="Paste the full patch notes here. AI will summarize them..."
          className="input resize-none font-mono text-sm"
        />
        <p className="text-xs text-zinc-500">
          Paste the complete patch notes. AI will extract key changes, generate a summary, and assign tags.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-300">Source URL</label>
        <input type="url" name="sourceUrl" placeholder="https://..." className="input" />
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

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? 'Creating & Queuing AI...' : 'Create with AI Processing'}
      </button>
    </form>
  )
}
