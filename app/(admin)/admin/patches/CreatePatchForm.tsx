'use client'

import { useState, useTransition } from 'react'
import { createPatchNote } from './actions'

type Game = { id: string; name: string }
type KeyChange = { category: string; change: string }

type Props = {
  games: Game[]
}

const TAGS = ['Balance', 'Bug Fix', 'New Content', 'Map Update', 'Weapons', 'Champions', 'Items', 'Performance']
const CATEGORIES = ['General', 'Weapons', 'Characters', 'Map', 'Balance', 'Bug Fixes', 'Performance', 'UI']

export function CreatePatchForm({ games }: Props) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [keyChanges, setKeyChanges] = useState<KeyChange[]>([{ category: '', change: '' }])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const updateKeyChange = (i: number, field: 'category' | 'change', value: string) => {
    const updated = [...keyChanges]
    updated[i][field] = value
    setKeyChanges(updated)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const validChanges = keyChanges.filter((kc) => kc.category && kc.change)

    startTransition(async () => {
      const result = await createPatchNote({
        gameId: formData.get('gameId') as string,
        title: formData.get('title') as string,
        summaryTldr: formData.get('summaryTldr') as string,
        impactScore: parseInt(formData.get('impactScore') as string, 10),
        tags: selectedTags,
        keyChanges: validChanges,
        sourceUrl: (formData.get('sourceUrl') as string) || undefined,
      })

      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Patch note created!' })
        ;(e.target as HTMLFormElement).reset()
        setKeyChanges([{ category: '', change: '' }])
        setSelectedTags([])
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          TL;DR Summary <span className="text-red-400">*</span>
        </label>
        <textarea
          name="summaryTldr"
          required
          rows={3}
          placeholder="Brief summary of the most important changes..."
          className="input resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-300">
          Impact Score (1-10) <span className="text-red-400">*</span>
        </label>
        <input
          type="number"
          name="impactScore"
          required
          min={1}
          max={10}
          defaultValue={5}
          className="input w-24"
        />
        <p className="text-xs text-zinc-500">1-4: Minor, 5-7: Medium, 8-10: Major</p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-zinc-300">Tags</label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`tag ${selectedTags.includes(tag) ? 'tag-active' : ''}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-300">Key Changes</label>
        {keyChanges.map((kc, i) => (
          <div key={i} className="flex gap-2">
            <select
              value={kc.category}
              onChange={(e) => updateKeyChange(i, 'category', e.target.value)}
              className="input w-28 text-sm"
            >
              <option value="">Category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-zinc-900">{c}</option>
              ))}
            </select>
            <input
              type="text"
              value={kc.change}
              onChange={(e) => updateKeyChange(i, 'change', e.target.value)}
              placeholder="What changed?"
              className="input flex-1 text-sm"
            />
            {keyChanges.length > 1 && (
              <button
                type="button"
                onClick={() => setKeyChanges(keyChanges.filter((_, j) => j !== i))}
                className="px-2 text-zinc-500 hover:text-red-400"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setKeyChanges([...keyChanges, { category: '', change: '' }])}
          className="text-sm text-zinc-400 hover:text-white"
        >
          + Add change
        </button>
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
        {isPending ? 'Creating...' : 'Create Patch Note'}
      </button>
    </form>
  )
}
