'use client'

import { useState, useTransition } from 'react'
import { toggleBookmark } from '@/app/(main)/actions/bookmarks'

type BookmarkButtonProps = {
  entityType: 'patch' | 'news'
  entityId: string
  initialBookmarked: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
}

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export function BookmarkButton({
  entityType,
  entityId,
  initialBookmarked,
  size = 'md',
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    const previousState = isBookmarked
    setIsBookmarked(!isBookmarked)

    startTransition(async () => {
      const result = await toggleBookmark(entityType, entityId)

      if (result.error) {
        setIsBookmarked(previousState)
      } else if (result.bookmarked !== undefined) {
        setIsBookmarked(result.bookmarked)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      title={isBookmarked ? 'Remove from saved' : 'Save for later'}
      className={`rounded-lg border transition-colors disabled:opacity-50 ${sizeClasses[size]} ${
        isBookmarked
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
      }`}
    >
      <svg
        className={iconSizes[size]}
        fill={isBookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  )
}
