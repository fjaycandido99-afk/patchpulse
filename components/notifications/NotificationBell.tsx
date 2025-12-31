'use client'

import { Bell } from 'lucide-react'
import Link from 'next/link'

type NotificationStats = {
  unread_count: number
  high_priority_count: number
}

type Props = {
  initialStats?: NotificationStats
  size?: 'sm' | 'md'
}

export function NotificationBell({ initialStats, size = 'md' }: Props) {
  const stats = initialStats || { unread_count: 0, high_priority_count: 0 }
  const hasUnread = stats.unread_count > 0
  const hasHighPriority = stats.high_priority_count > 0

  return (
    <Link
      href="/notifications"
      className="relative p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-white/10 active:bg-white/20 active:scale-95 transition-all touch-manipulation group"
      title="View Notifications"
      aria-label={`View notifications${hasUnread ? ` (${stats.unread_count} unread)` : ''}`}
    >
      {/* Pulsing halo effect when there are notifications */}
      {hasUnread && (
        <span className="absolute inset-0 rounded-xl bg-primary/20 animate-ping-slow opacity-75" />
      )}

      {/* Subtle glow ring on hover */}
      <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 to-violet-500/0 group-hover:from-primary/10 group-hover:to-violet-500/10 transition-all duration-300" />

      <Bell className={`relative h-5 w-5 transition-colors duration-200 ${
        hasUnread ? 'text-primary' : 'text-muted-foreground'
      } ${hasHighPriority ? 'animate-wiggle' : ''}`} />

      {/* Notification badge */}
      {hasUnread && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
          <span className={`absolute w-4 h-4 rounded-full ${hasHighPriority ? 'bg-red-500 animate-ping' : 'bg-primary'} opacity-75`} />
          <span className={`relative w-4 h-4 rounded-full ${hasHighPriority ? 'bg-red-500' : 'bg-primary'} flex items-center justify-center text-[9px] font-bold text-white`}>
            {stats.unread_count > 9 ? '9+' : stats.unread_count}
          </span>
        </span>
      )}
    </Link>
  )
}
