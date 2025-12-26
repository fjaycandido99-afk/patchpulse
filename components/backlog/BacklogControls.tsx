'use client'

import { useState, useTransition } from 'react'
import { updateBacklogItem, markPlayedToday } from '@/app/(main)/backlog/actions'
import { Play, Pause, CheckCircle, XCircle, Clock } from 'lucide-react'

type BacklogStatus = 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped'

type BacklogControlsProps = {
  gameId: string
  initialStatus: string
  initialProgress: number
  initialNextNote?: string | null
  initialPauseReason?: string | null
}

const STATUS_OPTIONS: { value: BacklogStatus; label: string; icon: typeof Play; color: string }[] = [
  { value: 'playing', label: 'Playing', icon: Play, color: 'text-green-400' },
  { value: 'paused', label: 'Paused', icon: Pause, color: 'text-amber-400' },
  { value: 'backlog', label: 'Backlog', icon: Clock, color: 'text-blue-400' },
  { value: 'finished', label: 'Finished', icon: CheckCircle, color: 'text-violet-400' },
  { value: 'dropped', label: 'Dropped', icon: XCircle, color: 'text-red-400' },
]

const PAUSE_REASON_SUGGESTIONS = [
  'Stuck on a difficult part',
  'Too many bugs/crashes',
  'Waiting for DLC/update',
  'Not enough time right now',
  'Lost interest',
]

export function BacklogControls({
  gameId,
  initialStatus,
  initialProgress,
  initialNextNote,
  initialPauseReason,
}: BacklogControlsProps) {
  const [status, setStatus] = useState<BacklogStatus>(initialStatus as BacklogStatus)
  const [pendingStatus, setPendingStatus] = useState<BacklogStatus | null>(null)
  const [progress, setProgress] = useState(initialProgress)
  const [nextNote, setNextNote] = useState(initialNextNote ?? '')
  const [pauseReason, setPauseReason] = useState(initialPauseReason ?? '')
  const [showPausePrompt, setShowPausePrompt] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSaving, startSaveTransition] = useTransition()
  const [isMarking, startMarkTransition] = useTransition()

  function handleStatusChange(newStatus: BacklogStatus) {
    if ((newStatus === 'paused' || newStatus === 'dropped') && status === 'playing') {
      setPendingStatus(newStatus)
      setShowPausePrompt(true)
    } else {
      setStatus(newStatus)
      if (newStatus === 'playing' || newStatus === 'finished') {
        setPauseReason('')
      }
    }
  }

  function handlePauseReasonSubmit() {
    if (pendingStatus) {
      setStatus(pendingStatus)
      setPendingStatus(null)
      setShowPausePrompt(false)
    }
  }

  function handlePauseReasonCancel() {
    setPendingStatus(null)
    setShowPausePrompt(false)
    setPauseReason('')
  }

  function handleSave() {
    setMessage(null)
    startSaveTransition(async () => {
      try {
        await updateBacklogItem({
          gameId,
          status,
          progress,
          nextNote: nextNote.trim() || null,
          pauseReason: (status === 'paused' || status === 'dropped') ? pauseReason.trim() || null : null,
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
  const currentStatusOption = STATUS_OPTIONS.find(s => s.value === status)

  return (
    <div className="space-y-5">
      {/* Bottom Sheet Modal (mobile-friendly) */}
      {showPausePrompt && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={handlePauseReasonCancel}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl p-5 pb-8 space-y-4 animate-in slide-in-from-bottom duration-300 sm:relative sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md sm:rounded-xl sm:border sm:pb-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle (mobile) */}
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto sm:hidden" />

            <h3 className="text-lg font-semibold">
              Why are you {pendingStatus === 'dropped' ? 'dropping' : 'pausing'} this game?
            </h3>
            <p className="text-sm text-muted-foreground">
              This helps us notify you when a relevant update arrives.
            </p>

            {/* Larger touch targets for chips */}
            <div className="flex flex-wrap gap-2">
              {PAUSE_REASON_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setPauseReason(suggestion)}
                  className={`px-4 py-2.5 text-sm rounded-full border transition-colors active:scale-95 ${
                    pauseReason === suggestion
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-card border-border hover:border-amber-500/30 active:bg-muted'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <textarea
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              rows={2}
              placeholder="Or type your own reason..."
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />

            {/* Full-width buttons on mobile */}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handlePauseReasonCancel}
                className="w-full sm:w-auto px-5 py-3 text-sm font-medium rounded-lg border border-border hover:bg-muted active:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePauseReasonSubmit}
                className="w-full sm:w-auto px-5 py-3 text-sm font-medium rounded-lg bg-amber-500 text-black hover:bg-amber-400 active:bg-amber-600 transition-colors"
              >
                {pendingStatus === 'dropped' ? 'Drop Game' : 'Pause Game'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Selection - Mobile-friendly chips */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => {
            const Icon = opt.icon
            const isSelected = status === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                disabled={isPending}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors active:scale-95 disabled:opacity-50 ${
                  isSelected
                    ? `${opt.color} bg-current/10 border-current/30`
                    : 'text-muted-foreground border-border hover:border-muted-foreground/50 active:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className={isSelected ? '' : 'text-foreground'}>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Progress - Thicker slider for mobile */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Progress
        </label>
        <div className="space-y-2">
          <div className="relative">
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              disabled={isPending || status === 'finished'}
              className="w-full h-3 bg-muted rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
            />
          </div>
          {/* Quick progress buttons */}
          <div className="flex gap-2">
            {[0, 25, 50, 75, 100].map((val) => (
              <button
                key={val}
                onClick={() => setProgress(val)}
                disabled={isPending || status === 'finished'}
                className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors active:scale-95 disabled:opacity-50 ${
                  progress === val
                    ? 'bg-primary/20 text-primary border-primary/30'
                    : 'border-border hover:border-primary/30 active:bg-muted'
                }`}
              >
                {val}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pause reason - shown when paused/dropped */}
      {(status === 'paused' || status === 'dropped') && (
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Reason for {status === 'dropped' ? 'dropping' : 'pausing'}
          </label>
          <textarea
            value={pauseReason}
            onChange={(e) => setPauseReason(e.target.value)}
            disabled={isPending}
            rows={2}
            placeholder="Why did you stop playing?"
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
        </div>
      )}

      {/* Next step */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Next step
        </label>
        <textarea
          value={nextNote}
          onChange={(e) => setNextNote(e.target.value)}
          disabled={isPending}
          rows={2}
          placeholder="What to do next..."
          className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
      </div>

      {/* Actions - Full width on mobile */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full sm:w-auto rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/80 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>

        <button
          onClick={handleMarkPlayed}
          disabled={isPending}
          className="w-full sm:w-auto rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium transition-colors hover:bg-muted active:bg-muted/80 disabled:opacity-50"
        >
          {isMarking ? 'Marking...' : 'Mark Played Today'}
        </button>

        {message && (
          <span
            className={`text-sm text-center sm:text-left ${
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
