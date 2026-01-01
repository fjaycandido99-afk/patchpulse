'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

type Props = {
  defaultHref: string
  defaultLabel: string
  fromHomeLabel?: string
}

export function BackButton({ defaultHref, defaultLabel, fromHomeLabel = 'Back to Home' }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')

  const isFromHome = from === 'home'
  const label = isFromHome ? fromHomeLabel : defaultLabel

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()

    // Use browser back to preserve scroll position
    if (window.history.length > 1) {
      router.back()
    } else {
      // Fallback if no history
      router.push(isFromHome ? '/home' : defaultHref)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  )
}
