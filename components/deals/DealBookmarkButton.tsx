'use client'

import { useState, useTransition } from 'react'
import { Bookmark, Crown, AlertCircle } from 'lucide-react'
import { toggleDealBookmark, type DealMetadata } from '@/app/(main)/actions/bookmarks'
import Link from 'next/link'

type DealBookmarkButtonProps = {
  dealId: string
  metadata: DealMetadata
  initialBookmarked: boolean
  isPro?: boolean
}

export function DealBookmarkButton({
  dealId,
  metadata,
  initialBookmarked,
  isPro = false,
}: DealBookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isPro) {
    return (
      <Link
        href="/pricing"
        className="flex items-center justify-center w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-amber-400 hover:bg-black/70 transition-colors"
        onClick={(e) => e.stopPropagation()}
        title="Pro feature - Save deals"
      >
        <Crown className="w-4 h-4" />
      </Link>
    )
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setErrorMsg(null)

    startTransition(async () => {
      try {
        const result = await toggleDealBookmark(dealId, metadata)
        if (result.success) {
          setIsBookmarked(result.bookmarked ?? false)
        } else if (result.error) {
          console.error('Bookmark error:', result.error)
          setErrorMsg(result.error)
          setTimeout(() => setErrorMsg(null), 3000)
        }
      } catch (err) {
        console.error('Bookmark failed:', err)
        setErrorMsg('Failed to save')
        setTimeout(() => setErrorMsg(null), 3000)
      }
    })
  }

  if (errorMsg) {
    return (
      <div
        className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/80 text-white"
        title={errorMsg}
      >
        <AlertCircle className="w-4 h-4" />
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center justify-center w-8 h-8 rounded-full backdrop-blur-sm transition-all ${
        isBookmarked
          ? 'bg-amber-500/80 text-white'
          : 'bg-black/50 text-white/70 hover:bg-black/70 hover:text-white'
      } ${isPending ? 'opacity-50' : ''}`}
    >
      <Bookmark
        className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`}
      />
    </button>
  )
}
