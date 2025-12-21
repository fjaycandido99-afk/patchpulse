'use client'

import { useState, useTransition } from 'react'
import { updateBacklogItem, markPlayedToday } from '@/app/(main)/backlog/actions'

type BacklogStatus = 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped'

type BacklogControlsProps = {
  gameId: string
  initialStatus: string
  initialProgress: number
  initialNextNote?: string | null
}

const STATUS_OPTIONS: { value: BacklogStatus; label: string }[] = [
  { value: 'playing', label: 'Playing' },
  { value: 'paused', label: 'Paused' },
  { value: 'backlog', label: 'Backlog' },
  { value: 'finished', label: 'Finished' },
  { value: 'dropped', label: 'Dropped' },
]

export function BacklogControls({
  gameId,
  initialStatus,
  initialProgress,
  initialNextNote,
}: BacklogControlsProps) {
  const [status, setStatus] = useState<BacklogStatus>(initialStatus as BacklogStatus)
  const [progress, setProgress] = useState(initialProgress)
  const [nextNote, setNextNote] = useState(initialNextNote ?? '')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSaving, startSaveTransition] = useTransition()
  const [isMarking, startMarkTransition] = useTransition()

  function handleSave() {
    setMessage(null)
    startSaveTransition(async () => {
      try {
        await updateBacklogItem({
          gameId,
          status,
          progress,
          nextNote: nextNote.trim() || null,
        })
        setMessage({ type: 'success', text: 'Saved' })
        setTimeout(() => setMessage(null), 2000)
      } catch {
        setMessage({ type: 'error', text: 'Failed to save' })
      }
    })
  }

  function handleMarkPlayed() {
    setMessage(null)
    startMarkTransition(async () => {
      try {
        await markPlayedToday(gameId)
        setMessage({ type: 'success', text: 'Marked as played today' })
        setTimeout(() => setMessage(null), 2000)
      } catch {
        setMessage({ type: 'error', text: 'Failed to mark as played' })
      }
    })
  }

  const isPending = isSaving || isMarking

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as BacklogStatus)}
            disabled={isPending}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[160px]">
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Progress: {progress}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            disabled={isPending || status === 'finished'}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">
          Next step
        </label>
        <textarea
          value={nextNote}
          onChange={(e) => setNextNote(e.target.value)}
          disabled={isPending}
          rows={2}
          placeholder="What to do next..."
          className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>

        <button
          onClick={handleMarkPlayed}
          disabled={isPending}
          className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
        >
          {isMarking ? 'Marking...' : 'Mark played today'}
        </button>

        {message && (
          <span
            className={`text-sm ${
              message.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {message.text}
          </span>
        )}
      </div>
    </div>
  )
}
