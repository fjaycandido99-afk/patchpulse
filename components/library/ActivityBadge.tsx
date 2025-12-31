'use client'

import { FileText, Newspaper } from 'lucide-react'

type ActivityBadgeProps = {
  patchCount?: number
  newsCount?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function ActivityBadge({
  patchCount = 0,
  newsCount = 0,
  size = 'md',
  showLabel = false,
}: ActivityBadgeProps) {
  const total = patchCount + newsCount

  if (total === 0) return null

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-0.5',
    md: 'text-xs px-2 py-0.5 gap-1',
    lg: 'text-sm px-2.5 py-1 gap-1.5',
  }

  const iconSizes = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5',
  }

  // Color based on urgency
  const bgColor = patchCount > 0
    ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
    : 'bg-purple-500/20 border-purple-500/30 text-purple-400'

  return (
    <span
      className={`inline-flex items-center font-semibold border rounded-full ${sizeClasses[size]} ${bgColor}`}
    >
      {patchCount > 0 && (
        <>
          <FileText className={iconSizes[size]} />
          <span>{patchCount}</span>
        </>
      )}
      {patchCount > 0 && newsCount > 0 && (
        <span className="text-white/30 mx-0.5">·</span>
      )}
      {newsCount > 0 && (
        <>
          <Newspaper className={iconSizes[size]} />
          <span>{newsCount}</span>
        </>
      )}
      {showLabel && (
        <span className="ml-0.5 opacity-80">
          {total === 1 ? 'update' : 'updates'}
        </span>
      )}
    </span>
  )
}

export function UnreadDot({ show = true }: { show?: boolean }) {
  if (!show) return null

  return (
    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
    </span>
  )
}

export function TotalUnreadBadge({ count }: { count: number }) {
  if (count === 0) return null

  return (
    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full bg-blue-500 text-white">
      {count > 99 ? '99+' : count}
    </span>
  )
}
