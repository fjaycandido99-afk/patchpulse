'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bell, FileText, Newspaper, Sparkles, Check, CheckCheck, Zap, ChevronRight, Filter, Calendar } from 'lucide-react'
import { type Notification, type NotificationStats, type TodaysNewsItem } from '@/lib/notifications'

type FilterType = 'all' | 'unread' | 'patches' | 'news'

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
      badge: { label: 'Urgent', className: 'bg-red-500/20 text-red-400' },
    }
  }
  if (priority >= 4) {
    return {
      border: 'border-l-amber-500',
      badge: { label: 'Important', className: 'bg-amber-500/20 text-amber-400' },
    }
  }
  if (priority >= 3) {
    return {
      border: 'border-l-primary',
      badge: null,
    }
  }
  return {
    border: 'border-l-zinc-600',
    badge: null,
  }
}

type Props = {
  initialNotifications: Notification[]
  initialStats: NotificationStats
  todaysNews?: TodaysNewsItem[]
}

export function NotificationsList({ initialNotifications, initialStats, todaysNews = [] }: Props) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [stats, setStats] = useState(initialStats)
  const [filter, setFilter] = useState<FilterType>('all')
  const [isMarkingAll, setIsMarkingAll] = useState(false)
  const [showTodaysNews, setShowTodaysNews] = useState(true)

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read
    if (filter === 'patches') return n.type === 'new_patch'
    if (filter === 'news') return n.type === 'new_news'
    return true
  })

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

  async function handleMarkAllRead() {
    setIsMarkingAll(true)
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
    } finally {
      setIsMarkingAll(false)
    }
  }

  const filters: { id: FilterType; label: string; count?: number }[] = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: stats.unread_count },
    { id: 'patches', label: 'Patches', count: notifications.filter(n => n.type === 'new_patch').length },
    { id: 'news', label: 'News', count: notifications.filter(n => n.type === 'new_news').length },
  ]

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                filter === f.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10'
              }`}
            >
              {f.label}
              {f.count !== undefined && f.count > 0 && (
                <span className="ml-1.5 text-xs opacity-70">({f.count})</span>
              )}
            </button>
          ))}
        </div>

        {stats.unread_count > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            {isMarkingAll ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      {/* Stats Banner */}
      {stats.high_priority_count > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <Zap className="w-5 h-5 text-red-400 fill-red-400" />
          <p className="text-sm text-red-400">
            You have <strong>{stats.high_priority_count}</strong> urgent notification{stats.high_priority_count !== 1 ? 's' : ''} that may require attention
          </p>
        </div>
      )}

      {/* Today's News Section */}
      {todaysNews.length > 0 && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 overflow-hidden">
          <button
            onClick={() => setShowTodaysNews(!showTodaysNews)}
            className="flex items-center justify-between w-full p-4 hover:bg-blue-500/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-blue-400">Today&apos;s News</h3>
                <p className="text-xs text-muted-foreground">
                  {todaysNews.length} article{todaysNews.length !== 1 ? 's' : ''} fetched today
                </p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-blue-400 transition-transform ${showTodaysNews ? 'rotate-90' : ''}`} />
          </button>

          {showTodaysNews && (
            <div className="border-t border-blue-500/20 divide-y divide-blue-500/10">
              {todaysNews.map(news => (
                <Link
                  key={news.id}
                  href={`/news/${news.id}`}
                  className="flex gap-3 p-3 hover:bg-blue-500/10 transition-colors"
                >
                  {/* Game Cover */}
                  <div className="flex-shrink-0">
                    {news.game?.cover_url ? (
                      <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-zinc-800 ring-1 ring-white/10">
                        <Image
                          src={news.game.cover_url}
                          alt={news.game.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    ) : news.image_url ? (
                      <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-zinc-800 ring-1 ring-white/10">
                        <Image
                          src={news.image_url}
                          alt={news.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-16 rounded-lg bg-zinc-800 flex items-center justify-center ring-1 ring-white/10">
                        <Newspaper className="w-5 h-5 text-blue-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <p className="text-sm font-medium line-clamp-2 flex-1">{news.title}</p>
                      {news.is_rumor && (
                        <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-500/20 text-amber-400">
                          Rumor
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {news.game && <span>{news.game.name}</span>}
                      {news.game && news.source_name && <span>•</span>}
                      {news.source_name && <span>{news.source_name}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notifications List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-primary/50" />
            </div>
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === 'unread'
                ? "You're all caught up!"
                : 'Follow games to get notified about updates'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="mt-4 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20"
              >
                View all notifications
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredNotifications.map(notification => {
              const priority = getPriorityStyles(notification.priority)
              return (
                <div
                  key={notification.id}
                  className={`group flex gap-4 p-4 border-l-[3px] transition-colors ${priority.border} ${
                    !notification.is_read ? 'bg-primary/[0.03]' : ''
                  }`}
                >
                  {/* Game Cover or Icon */}
                  <div className="flex-shrink-0">
                    {notification.game?.cover_url ? (
                      <Link href={`/games/${notification.game.slug}`}>
                        <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-zinc-800 ring-1 ring-white/10 hover:ring-white/20 transition-all">
                          <Image
                            src={notification.game.cover_url}
                            alt={notification.game.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      </Link>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center ring-1 ring-white/10">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={getNotificationLink(notification)}
                            onClick={() => !notification.is_read && handleMarkRead(notification.id)}
                            className={`text-base font-semibold hover:underline ${
                              !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {notification.title}
                          </Link>
                          {priority.badge && (
                            <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${priority.badge.className}`}>
                              {priority.badge.label}
                            </span>
                          )}
                          {!notification.is_read && (
                            <span className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        {notification.game && (
                          <Link
                            href={`/games/${notification.game.slug}`}
                            className="text-sm text-muted-foreground hover:text-foreground mt-0.5 inline-block"
                          >
                            {notification.game.name}
                          </Link>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {getRelativeTime(notification.created_at)}
                      </span>
                    </div>

                    {notification.body && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {notification.body}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-3">
                      <Link
                        href={getNotificationLink(notification)}
                        onClick={() => !notification.is_read && handleMarkRead(notification.id)}
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        View details
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkRead(notification.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Check className="w-3 h-3" />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
