'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bell, FileText, Newspaper, Sparkles, CheckCheck, ChevronRight, Calendar, Gamepad2, Tag, SlidersHorizontal, X, Check, Rocket, Bookmark } from 'lucide-react'
import { type Notification, type NotificationStats, type TodaysNewsItem } from '@/lib/notifications'

type FilterType = 'all' | 'unread' | 'patches' | 'news' | 'deals'
type TimeGroup = 'today' | 'yesterday' | 'this_week' | 'earlier'

function getTimeGroup(date: string): TimeGroup {
  const now = new Date()
  const then = new Date(date)

  // Reset to start of day for comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  if (then >= today) return 'today'
  if (then >= yesterday) return 'yesterday'
  if (then >= weekAgo) return 'this_week'
  return 'earlier'
}

function getTimeGroupLabel(group: TimeGroup): string {
  switch (group) {
    case 'today': return 'Today'
    case 'yesterday': return 'Yesterday'
    case 'this_week': return 'This Week'
    case 'earlier': return 'Earlier'
  }
}

function getRelativeTime(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays === 1) return '1d'
  if (diffDays < 7) return `${diffDays}d`
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'new_patch':
      return <FileText className="w-4 h-4 text-cyan-400" />
    case 'new_news':
      return <Newspaper className="w-4 h-4 text-blue-400" />
    case 'ai_digest':
      return <Sparkles className="w-4 h-4 text-violet-400" />
    case 'price_drop':
      return <Tag className="w-4 h-4 text-green-400" />
    case 'game_release':
      return <Rocket className="w-4 h-4 text-orange-400" />
    case 'saved_reminder':
      return <Bookmark className="w-4 h-4 text-amber-400" />
    default:
      return <Bell className="w-4 h-4 text-zinc-400" />
  }
}

function getNotificationLink(notification: Notification): string {
  if (notification.type === 'price_drop' && notification.metadata?.deal_url) {
    return notification.metadata.deal_url as string
  }
  if (notification.type === 'saved_reminder') {
    return '/saved'
  }
  if (notification.type === 'game_release' && notification.metadata?.game_slug) {
    return `/games/${notification.metadata.game_slug}`
  }
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
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read
    if (filter === 'patches') return n.type === 'new_patch'
    if (filter === 'news') return n.type === 'new_news'
    if (filter === 'deals') return n.type === 'price_drop'
    return true
  })

  // Group notifications by time
  const groupedNotifications = filteredNotifications.reduce((acc, notification) => {
    const group = getTimeGroup(notification.created_at)
    if (!acc[group]) acc[group] = []
    acc[group].push(notification)
    return acc
  }, {} as Record<TimeGroup, Notification[]>)

  const timeGroups: TimeGroup[] = ['today', 'yesterday', 'this_week', 'earlier']

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

  const filters: { id: FilterType; label: string; icon: typeof Bell; count?: number }[] = [
    { id: 'all', label: 'All Notifications', icon: Bell, count: notifications.length },
    { id: 'unread', label: 'Unread', icon: Bell, count: stats.unread_count },
    { id: 'patches', label: 'Patches', icon: FileText },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'deals', label: 'Deals', icon: Tag },
  ]

  const currentFilter = filters.find(f => f.id === filter)

  return (
    <div className="space-y-4">
      {/* Filter Button & Mark All Read */}
      <div className="flex items-center justify-between gap-2">
        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter !== 'all'
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-white/5 text-muted-foreground hover:text-foreground border border-white/10'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {currentFilter?.label || 'Filter'}
            {filter !== 'all' && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                1
              </span>
            )}
          </button>

          {/* Filter Dropdown Panel */}
          {isFilterOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsFilterOpen(false)}
              />

              {/* Dropdown Panel */}
              <div className="absolute top-full left-0 mt-2 w-64 rounded-xl border border-white/10 bg-[#0b1220] shadow-xl z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-white/10">
                  <span className="font-semibold text-sm">Filter by Type</span>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Filter Options */}
                <div className="p-2">
                  {filters.map((f) => {
                    const Icon = f.icon
                    return (
                      <button
                        key={f.id}
                        onClick={() => {
                          setFilter(f.id)
                          setIsFilterOpen(false)
                        }}
                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          filter === f.id
                            ? 'bg-primary/20 text-primary'
                            : 'hover:bg-white/5 text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{f.label}</span>
                          {f.count !== undefined && f.count > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-xs text-muted-foreground">
                              {f.count}
                            </span>
                          )}
                        </div>
                        {filter === f.id && <Check className="w-4 h-4" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Mark all read button */}
        {stats.unread_count > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <CheckCheck className="w-4 h-4" />
            {isMarkingAll ? 'Marking...' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* Today's News Section */}
      {todaysNews.length > 0 && (
        <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/5 overflow-hidden">
          <button
            onClick={() => setShowTodaysNews(!showTodaysNews)}
            className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Today&apos;s News</h3>
                <p className="text-xs text-muted-foreground">
                  {todaysNews.length} article{todaysNews.length !== 1 ? 's' : ''} fetched today
                </p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${showTodaysNews ? 'rotate-90' : ''}`} />
          </button>

          {showTodaysNews && (
            <div className="px-2 pb-2">
              {todaysNews.map(news => (
                <Link
                  key={news.id}
                  href={`/news/${news.id}`}
                  className="flex gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {/* Square Thumbnail */}
                  <div className="flex-shrink-0">
                    {news.game?.cover_url ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-800">
                        <Image
                          src={news.game.cover_url}
                          alt={news.game.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    ) : news.image_url ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-800">
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
                      <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <Newspaper className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 py-0.5">
                    <p className="text-sm font-medium line-clamp-2 leading-snug">{news.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {news.game?.name || 'Gaming News'}
                      {news.source_name && ` • ${news.source_name}`}
                      {news.is_rumor && ' • Rumor'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notifications - YouTube style grouped list */}
      {filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Bell className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-medium">No notifications</p>
          <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
            {filter === 'unread'
              ? "You're all caught up!"
              : 'Follow games to get notified about patches and news'}
          </p>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="mt-4 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg"
            >
              View all notifications
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {timeGroups.map(group => {
            const groupNotifications = groupedNotifications[group]
            if (!groupNotifications?.length) return null

            return (
              <div key={group}>
                {/* Time Group Header */}
                <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">
                  {getTimeGroupLabel(group)}
                </h3>

                {/* Notifications in this group */}
                <div className="space-y-1">
                  {groupNotifications.map(notification => {
                    const notificationLink = getNotificationLink(notification)
                    const isExternal = notificationLink.startsWith('http')
                    const LinkComponent = isExternal ? 'a' : Link
                    const linkProps = isExternal
                      ? { href: notificationLink, target: '_blank', rel: 'noopener noreferrer' }
                      : { href: notificationLink }

                    return (
                    <LinkComponent
                      key={notification.id}
                      {...linkProps}
                      onClick={() => !notification.is_read && handleMarkRead(notification.id)}
                      className={`flex gap-3 p-3 rounded-xl transition-colors ${
                        !notification.is_read
                          ? 'bg-primary/5 hover:bg-primary/10'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      {/* Square Thumbnail */}
                      <div className="flex-shrink-0 relative">
                        {notification.game?.cover_url ? (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-800">
                            <Image
                              src={notification.game.cover_url}
                              alt={notification.game.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                            <Gamepad2 className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        {/* Type indicator badge */}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border-2 border-background flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 py-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-snug line-clamp-2 ${
                            !notification.is_read ? 'font-medium' : 'text-muted-foreground'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {notification.game?.name || 'PatchPulse'} • {getRelativeTime(notification.created_at)}
                          {notification.priority >= 4 && ' • Important'}
                        </p>
                      </div>
                    </LinkComponent>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
