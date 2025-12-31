'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, FileText, Newspaper, X, Sparkles, ChevronRight, Zap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type Notification = {
  id: string
  type: 'new_patch' | 'new_news' | 'game_release' | 'ai_digest' | 'system'
  title: string
  body: string | null
  priority: number
  game_id: string | null
  patch_id: string | null
  news_id: string | null
  is_read: boolean
  created_at: string
  game?: {
    id: string
    name: string
    slug: string
    cover_url: string | null
  } | null
}

type NotificationStats = {
  unread_count: number
  high_priority_count: number
}

function getRelativeTime(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return then.toLocaleDateString()
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'new_patch':
      return <FileText className="w-5 h-5 text-cyan-400" />
    case 'new_news':
      return <Newspaper className="w-5 h-5 text-blue-400" />
    case 'ai_digest':
      return <Sparkles className="w-5 h-5 text-violet-400" />
    default:
      return <Bell className="w-5 h-5 text-zinc-400" />
  }
}

function getNotificationLink(notification: Notification): string {
  if (notification.patch_id) {
    return `/patches/${notification.patch_id}`
  }
  if (notification.news_id) {
    return `/news/${notification.news_id}`
  }
  if (notification.game?.slug) {
    return `/games/${notification.game.slug}`
  }
  return '#'
}

function getPriorityStyles(priority: number) {
  if (priority >= 5) {
    return {
      border: 'border-l-red-500',
      glow: 'shadow-[inset_0_0_20px_rgba(239,68,68,0.15)]',
      badge: { label: 'Urgent', className: 'bg-red-500/20 text-red-400 animate-pulse' },
    }
  }
  if (priority >= 4) {
    return {
      border: 'border-l-amber-500',
      glow: 'shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]',
      badge: { label: 'Important', className: 'bg-amber-500/20 text-amber-400' },
    }
  }
  if (priority >= 3) {
    return {
      border: 'border-l-primary',
      glow: '',
      badge: null,
    }
  }
  return {
    border: 'border-l-zinc-600',
    glow: '',
    badge: null,
  }
}

type Props = {
  initialStats?: NotificationStats
  size?: 'sm' | 'md'
}

export function NotificationBell({ initialStats, size = 'md' }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats>(
    initialStats || { unread_count: 0, high_priority_count: 0 }
  )
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when modal is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchNotifications()
    }
  }, [isOpen])

  // Poll for updates every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  async function fetchNotifications() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/notifications?limit=10')
      const data = await res.json()
      setNotifications(data.notifications || [])
      setStats(data.stats || { unread_count: 0, high_priority_count: 0 })
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/notifications?stats=true')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch notification stats:', error)
    }
  }

  async function handleMarkAllRead() {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setStats({ unread_count: 0, high_priority_count: 0 })
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  async function handleMarkRead(id: string) {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', notificationIds: [id] }),
      })
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      )
      setStats(prev => ({
        ...prev,
        unread_count: Math.max(0, prev.unread_count - 1),
      }))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const hasUnread = stats.unread_count > 0
  const hasHighPriority = stats.high_priority_count > 0

  return (
    <>
      {/* Bell Button with Pulsing Halo */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="relative p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-white/10 active:scale-95 transition-all touch-manipulation group"
        title="Notifications"
        aria-label={`Notifications${hasUnread ? ` (${stats.unread_count} unread)` : ''}`}
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
      </button>

      {/* Modal/Sheet */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:bg-black/40 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Mobile: Bottom Sheet | Desktop: Dropdown */}
          <div
            ref={dropdownRef}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-3xl bg-card/95 backdrop-blur-xl border-t border-white/10 shadow-2xl shadow-black/50 animate-in slide-in-from-bottom duration-300
                       md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:w-[420px] md:rounded-2xl md:border md:border-white/10 md:max-h-[70vh] md:slide-in-from-top-2"
          >
            {/* Animated gradient border (top) */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 animate-gradient-x" />

            {/* Drag Handle (mobile only) */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            {/* Header with gradient background */}
            <div className="relative px-5 py-4 border-b border-white/10 overflow-hidden">
              {/* Subtle animated gradient sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-violet-500/5 to-primary/5 animate-gradient-x opacity-50" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold tracking-tight">Notifications</h3>
                  {hasUnread && (
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-primary/20 text-primary border border-primary/30 animate-in zoom-in duration-200">
                      {stats.unread_count} new
                    </span>
                  )}
                  {hasHighPriority && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                      <Zap className="w-3 h-3 fill-red-400" />
                      {stats.high_priority_count} urgent
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasUnread && (
                    <button
                      onClick={handleMarkAllRead}
                      className="px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 active:scale-95 transition-all touch-manipulation"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl hover:bg-white/10 active:scale-90 transition-all touch-manipulation"
                    aria-label="Close notifications"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto overscroll-contain max-h-[60vh] md:max-h-[50vh]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    <Bell className="absolute inset-0 m-auto w-5 h-5 text-primary/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="relative flex flex-col items-center justify-center py-20 px-6 overflow-hidden">
                  {/* Ghost notification cards in background */}
                  <div className="absolute inset-0 flex flex-col gap-3 p-4 opacity-[0.03] pointer-events-none">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-20 rounded-xl bg-white" />
                    ))}
                  </div>

                  {/* Pulsing bell icon */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-50" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center border border-white/10">
                      <Bell className="w-10 h-10 text-primary/60" />
                    </div>
                  </div>

                  <p className="text-lg font-semibold text-foreground">All caught up!</p>
                  <p className="text-sm text-muted-foreground mt-2 text-center max-w-[250px]">
                    Follow games to get notified about patches, news, and updates
                  </p>

                  <Link
                    href="/search"
                    onClick={() => setIsOpen(false)}
                    className="mt-6 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
                  >
                    Discover games
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((notification, index) => {
                    const priority = getPriorityStyles(notification.priority)
                    return (
                      <Link
                        key={notification.id}
                        href={getNotificationLink(notification)}
                        onClick={() => {
                          if (!notification.is_read) handleMarkRead(notification.id)
                          setIsOpen(false)
                        }}
                        className={`group flex gap-4 p-4 hover:bg-white/5 active:bg-white/10 transition-all duration-200 border-l-[3px] touch-manipulation ${priority.border} ${priority.glow} ${
                          !notification.is_read ? 'bg-primary/[0.03]' : ''
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Game Cover or Icon with glow for high priority */}
                        <div className="flex-shrink-0 relative">
                          {notification.priority >= 4 && (
                            <div className={`absolute -inset-1 rounded-xl ${notification.priority >= 5 ? 'bg-red-500/20' : 'bg-amber-500/20'} blur-md opacity-0 group-hover:opacity-100 transition-opacity`} />
                          )}
                          {notification.game?.cover_url ? (
                            <div className="relative w-14 h-[72px] rounded-xl overflow-hidden bg-zinc-800 shadow-lg ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
                              <Image
                                src={notification.game.cover_url}
                                alt={notification.game.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="56px"
                              />
                            </div>
                          ) : (
                            <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center ring-1 ring-white/10">
                              {getNotificationIcon(notification.type)}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 py-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className={`text-[15px] font-semibold leading-tight line-clamp-1 ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {notification.title}
                                </p>
                                {priority.badge && (
                                  <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded ${priority.badge.className}`}>
                                    {priority.badge.label}
                                  </span>
                                )}
                              </div>
                              {notification.game && (
                                <p className="text-xs text-muted-foreground/80 mt-0.5 font-medium">
                                  {notification.game.name}
                                </p>
                              )}
                            </div>
                            {!notification.is_read && (
                              <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-lg shadow-primary/50 flex-shrink-0 mt-1 animate-pulse" />
                            )}
                          </div>
                          {notification.body && (
                            <p className="text-sm text-muted-foreground/70 line-clamp-2 mt-1.5 leading-relaxed">
                              {notification.body}
                            </p>
                          )}
                          <p className="text-[11px] text-muted-foreground/50 mt-2 font-medium tracking-wide uppercase">
                            {getRelativeTime(notification.created_at)}
                          </p>
                        </div>

                        {/* Chevron with hover animation */}
                        <ChevronRight className="w-5 h-5 text-muted-foreground/30 flex-shrink-0 self-center group-hover:text-muted-foreground/60 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-white/10 safe-area-pb bg-gradient-to-t from-background/50 to-transparent">
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-primary/20 to-violet-500/20 text-primary font-semibold hover:from-primary/30 hover:to-violet-500/30 active:scale-[0.98] transition-all touch-manipulation border border-primary/20"
                >
                  View all notifications
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
