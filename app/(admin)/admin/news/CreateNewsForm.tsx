'use client'

import { useState, useTransition } from 'react'
import { createNewsItem } from './actions'

type Game = { id: string; name: string }

type Props = {
  games: Game[]
}

const TOPICS = ['Patch', 'DLC', 'Delay', 'Season', 'Studio', 'Beta', 'Launch', 'Sale', 'Esports', 'Community']

function formatDateTimeLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function CreateNewsForm({ games }: Props) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [customTopics, setCustomTopics] = useState('')
  const [isRumor, setIsRumor] = useState(false)
  const [publishedAt, setPublishedAt] = useState(formatDateTimeLocal(new Date()))

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)
    const formData = new FormData(e.currentTarget)

    // Combine selected topics with custom topics
    const customTopicsList = customTopics
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
    const allTopics = [...selectedTopics, ...customTopicsList]

    startTransition(async () => {
      const result = await createNewsItem({
        gameId: (formData.get('gameId') as string) || undefined,
        title: formData.get('title') as string,
        publishedAt: publishedAt,
        summary: formData.get('summary') as string,
        whyItMatters: (formData.get('whyItMatters') as string) || undefined,
        topics: allTopics,
        isRumor,
        sourceName: (formData.get('sourceName') as string) || undefined,
        sourceUrl: (formData.get('sourceUrl') as string) || undefined,
      })

      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'News item created!' })
        ;(e.target as HTMLFormElement).reset()
        setSelectedTopics([])
        setCustomTopics('')
        setIsRumor(false)
        setPublishedAt(formatDateTimeLocal(new Date()))
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          maxLength={200}
          placeholder="e.g., New expansion announced"
          className="input"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-300">Published At</label>
        <input
          type="datetime-local"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
          className="input"
        />
        <p className="text-xs text-zinc-500">Defaults to now. Set a past date for older news.</p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-300">
          Summary <span className="text-red-400">*</span>
        </label>
        <textarea
          name="summary"
          required
          rows={3}
          maxLength={2000}
          placeholder="What happened?"
          className="input resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-300">Why It Matters</label>
        <textarea
          name="whyItMatters"
          rows={2}
          maxLength={1000}
          placeholder="Why should players care?"
          className="input resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-300">Topics</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => toggleTopic(topic)}
              className={`tag ${selectedTopics.includes(topic) ? 'tag-active' : ''}`}
            >
              {topic}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={customTopics}
          onChange={(e) => setCustomTopics(e.target.value)}
          placeholder="Additional topics (comma-separated)"
          className="input"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsRumor(!isRumor)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            isRumor ? 'bg-orange-500' : 'bg-zinc-700'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              isRumor ? 'translate-x-5' : ''
            }`}
          />
        </button>
        <span className="text-sm text-zinc-300">This is a rumor / unconfirmed</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-300">Source Name</label>
          <input
            type="text"
            name="sourceName"
            maxLength={100}
            placeholder="e.g., Official Blog"
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
        {isPending ? 'Creating...' : 'Create News Item'}
      </button>
    </form>
  )
}
