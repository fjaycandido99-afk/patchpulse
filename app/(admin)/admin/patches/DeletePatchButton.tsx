'use client'

import { useState, useTransition } from 'react'
import { deletePatchNote } from './actions'

type Props = {
  patchId: string
  patchTitle: string
}

export function DeletePatchButton({ patchId, patchTitle }: Props) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = () => {
    setError(null)
    startTransition(async () => {
      const result = await deletePatchNote(patchId)
      if (result.error) {
        setError(result.error)
        setShowConfirm(false)
      }
    })
  }

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-400">{error}</span>
        <button
          onClick={() => setError(null)}
          className="px-2 py-1 text-xs font-medium text-zinc-400 hover:text-white"
        >
          Dismiss
        </button>
      </div>
    )
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-400">Delete?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-2 py-1 text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
        >
          {isPending ? '...' : 'Yes'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
          className="px-2 py-1 text-xs font-medium text-zinc-400 hover:text-white disabled:opacity-50"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-2 py-1 text-xs font-medium text-zinc-500 hover:text-red-400 transition-colors"
      title={`Delete "${patchTitle}"`}
    >
      Delete
    </button>
  )
}
