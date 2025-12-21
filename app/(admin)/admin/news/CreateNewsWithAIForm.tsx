'use client'

import { useState, useTransition } from 'react'
import { createNewsItemWithAI } from './actions'

type Game = { id: string; name: string }

type Props = {
  games: Game[]
}

export function CreateNewsWithAIForm({ games }: Props) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createNewsItemWithAI({
        gameId: (formData.get('gameId') as string) || undefined,
        title: formData.get('title') as string,
        rawText: formData.get('rawText') as string,
        sourceName: (formData.get('sourceName') as string) || undefined,
        sourceUrl: (formData.get('sourceUrl') as string) || undefined,
      })

      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        const aiStatus = result.aiJobQueued
          ? 'AI processing queued.'
          : 'Created (AI processing failed to queue).'
        setMessage({ type: 'success', text: `News created! ${aiStatus}` })
        ;(e.target as HTMLFormElement).reset()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
        <p className="text-sm text-blue-400">
          <strong>AI Mode:</strong> Paste raw news content and AI will automatically generate the summary, why it matters, topics, and detect if it&apos;s a rumor.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-300">Game (optional)</label>
        <select name="gameId" className="input">
          <option value="">General news</option>
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
          placeholder="e.g., New expansion announced for 2025"
          className="input"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-300">
          Raw News Content <span className="text-red-400">*</span>
        </label>
        <textarea
          name="rawText"
          required
          rows={8}
          placeholder="Paste the news article, announcement, or any raw text here. AI will summarize and extract key information..."
          className="input resize-none font-mono text-sm"
        />
        <p className="text-xs text-zinc-500">
          Paste the full article or announcement. AI will create a summary, explain why it matters, and assign topics.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-300">Source Name</label>
          <input
            type="text"
            name="sourceName"
            placeholder="e.g., Official Blog, IGN"
            className="input"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-300">Source URL</label>
          <input type="url" name="sourceUrl" placeholder="https://..." className="input" />
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

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? 'Creating & Queuing AI...' : 'Create with AI Processing'}
      </button>
    </form>
  )
}
