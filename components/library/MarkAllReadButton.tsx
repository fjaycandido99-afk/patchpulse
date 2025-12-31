'use client'

import { useState, useTransition } from 'react'
import { CheckCheck, Loader2 } from 'lucide-react'
import { markAllGamesSeen } from '@/app/(main)/backlog/activity-actions'

type MarkAllReadButtonProps = {
  totalUnread: number
}

export function MarkAllReadButton({ totalUnread }: MarkAllReadButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isMarked, setIsMarked] = useState(false)

  if (totalUnread === 0 || isMarked) {
    return null
  }

  const handleClick = () => {
    startTransition(async () => {
      const result = await markAllGamesSeen()
      if (result.success) {
        setIsMarked(true)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <CheckCheck className="h-3.5 w-3.5" />
      )}
      Mark all read
    </button>
  )
}
