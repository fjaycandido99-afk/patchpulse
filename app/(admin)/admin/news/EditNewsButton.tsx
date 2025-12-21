'use client'

import { useState, useTransition } from 'react'
import { updateNewsItem, NewsItemWithGame } from './actions'

type Game = { id: string; name: string }

type Props = {
  news: NewsItemWithGame
  games: Game[]
}

const TOPICS = ['Patch', 'DLC', 'Delay', 'Season', 'Studio', 'Beta', 'Launch', 'Sale', 'Esports', 'Community']

function formatDateTimeLocal(dateString: string): string {
  const date = new Date(dateString)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function EditNewsButton({ news, games }: Props) {
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [gameId, setGameId] = useState(news.game_id || '')
  const [title, setTitle] = useState(news.title)
  const [publishedAt, setPublishedAt] = useState(formatDateTimeLocal(news.published_at))
  const [summary, setSummary] = useState(news.summary || '')
  const [whyItMatters, setWhyItMatters] = useState(news.why_it_matters || '')
  const [selectedTopics, setSelectedTopics] = useState<string[]>(news.topics || [])
  const [isRumor, setIsRumor] = useState(news.is_rumor)
  const [sourceName, setSourceName] = useState(news.source_name || '')
  const [sourceUrl, setSourceUrl] = useState(news.source_url || '')

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const result = await updateNewsItem({
        id: news.id,
        gameId: gameId || undefined,
        title,
        publishedAt,
        summary,
        whyItMatters: whyItMatters || undefined,
        topics: selectedTopics,
        isRumor,
        sourceName: sourceName || undefined,
        sourceUrl: sourceUrl || undefined,
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
    setGameId(news.game_id || '')
    setTitle(news.title)
    setPublishedAt(formatDateTimeLocal(news.published_at))
    setSummary(news.summary || '')
    setWhyItMatters(news.why_it_matters || '')
    setSelectedTopics(news.topics || [])
    setIsRumor(news.is_rumor)
    setSourceName(news.source_name || '')
    setSourceUrl(news.source_url || '')
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-lg border border-white/10 bg-zinc-900 p-6 shadow-xl my-8">
        <h3 className="text-lg font-semibold text-white mb-4">Edit News Item</h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">Game</label>
            <select
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="input"
            >
              <option value="">General news</option>
              {games.map((g) => (
                <option key={g.id} value={g.id} className="bg-zinc-900">
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="input resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">Why It Matters</label>
            <textarea
              value={whyItMatters}
              onChange={(e) => setWhyItMatters(e.target.value)}
              rows={2}
              className="input resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">Topics</label>
            <div className="flex flex-wrap gap-2">
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
            <span className="text-sm text-zinc-300">This is a rumor</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300">Source Name</label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300">Source URL</label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
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
