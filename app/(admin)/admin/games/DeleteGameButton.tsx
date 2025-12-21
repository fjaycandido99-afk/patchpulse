'use client'

import { useState, useTransition } from 'react'
import { deleteGame } from './actions'

type DeleteGameButtonProps = {
  gameId: string
  gameName: string
}

export function DeleteGameButton({ gameId, gameName }: DeleteGameButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      await deleteGame(gameId)
      setShowConfirm(false)
    })
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
      title={`Delete ${gameName}`}
    >
      Delete
    </button>
  )
}
