'use client'

import { useState, useTransition } from 'react'
import { updatePatchNote, PatchWithGame } from './actions'

type Game = { id: string; name: string }
type KeyChange = { category: string; change: string }

type Props = {
  patch: PatchWithGame
  games: Game[]
}

const TAGS = ['Balance', 'Bug Fix', 'New Content', 'Map Update', 'Weapons', 'Champions', 'Items', 'Performance']
const CATEGORIES = ['General', 'Weapons', 'Characters', 'Map', 'Balance', 'Bug Fixes', 'Performance', 'UI']

export function EditPatchButton({ patch, games }: Props) {
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [gameId, setGameId] = useState(patch.game_id)
  const [title, setTitle] = useState(patch.title)
  const [summaryTldr, setSummaryTldr] = useState(patch.summary_tldr || '')
  const [impactScore, setImpactScore] = useState(patch.impact_score)
  const [selectedTags, setSelectedTags] = useState<string[]>(patch.tags || [])
  const [keyChanges, setKeyChanges] = useState<KeyChange[]>(
    patch.key_changes?.length ? patch.key_changes : [{ category: '', change: '' }]
  )
  const [sourceUrl, setSourceUrl] = useState(patch.source_url || '')

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

  const handleSave = () => {
    setError(null)
    const validChanges = keyChanges.filter((kc) => kc.category && kc.change)

    startTransition(async () => {
      const result = await updatePatchNote({
        id: patch.id,
        gameId,
        title,
        summaryTldr,
        impactScore,
        tags: selectedTags,
        keyChanges: validChanges,
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
    setGameId(patch.game_id)
    setTitle(patch.title)
    setSummaryTldr(patch.summary_tldr || '')
    setImpactScore(patch.impact_score)
    setSelectedTags(patch.tags || [])
    setKeyChanges(patch.key_changes?.length ? patch.key_changes : [{ category: '', change: '' }])
    setSourceUrl(patch.source_url || '')
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
        <h3 className="text-lg font-semibold text-white mb-4">Edit Patch Note</h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">Game</label>
            <select
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="input"
            >
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
            <label className="block text-sm font-medium text-zinc-300">TL;DR Summary</label>
            <textarea
              value={summaryTldr}
              onChange={(e) => setSummaryTldr(e.target.value)}
              rows={3}
              className="input resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">Impact Score (1-10)</label>
            <input
              type="number"
              value={impactScore}
              onChange={(e) => setImpactScore(parseInt(e.target.value, 10) || 5)}
              min={1}
              max={10}
              className="input w-24"
            />
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
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="input"
            />
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
