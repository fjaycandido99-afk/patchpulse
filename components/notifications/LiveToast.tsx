'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, FileText, Newspaper, Sparkles, Bell, Zap } from 'lucide-react'

type Notification = {
  id: string
  type: 'new_patch' | 'new_news' | 'game_release' | 'ai_digest' | 'system'
  title: string
  body: string | null
  priority: number
  patch_id: string | null
  news_id: string | null
  game?: {
    id: string
    name: string
    slug: string
    cover_url: string | null
  } | null
}

type Props = {
  notification: Notification
  onDismiss: () => void
  style?: React.CSSProperties
}

function getNotificationIcon(type: string, priority: number) {
  const iconClass = priority >= 4 ? 'w-5 h-5 text-amber-400' : 'w-5 h-5'

  switch (type) {
    case 'new_patch':
      return <FileText className={`${iconClass} ${priority < 4 ? 'text-cyan-400' : ''}`} />
    case 'new_news':
      return <Newspaper className={`${iconClass} ${priority < 4 ? 'text-blue-400' : ''}`} />
    case 'ai_digest':
      return <Sparkles className={`${iconClass} ${priority < 4 ? 'text-violet-400' : ''}`} />
    default:
      return <Bell className={`${iconClass} ${priority < 4 ? 'text-zinc-400' : ''}`} />
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

function getTypeLabel(type: string): string {
  switch (type) {
    case 'new_patch':
      return 'New Patch'
    case 'new_news':
      return 'Breaking News'
    case 'ai_digest':
      return 'AI Digest'
    case 'game_release':
      return 'Game Release'
    default:
      return 'Update'
  }
}

function getPriorityStyles(priority: number): { border: string; glow: string; badge: string } {
  if (priority >= 5) {
    return {
      border: 'border-red-500/50',
      glow: 'shadow-red-500/20',
      badge: 'bg-red-500/20 text-red-400',
    }
  }
  if (priority >= 4) {
    return {
      border: 'border-amber-500/50',
      glow: 'shadow-amber-500/20',
      badge: 'bg-amber-500/20 text-amber-400',
    }
  }
  return {
    border: 'border-primary/30',
    glow: 'shadow-primary/10',
    badge: 'bg-primary/20 text-primary',
  }
}

export function LiveToast({ notification, onDismiss, style }: Props) {
  const [isExiting, setIsExiting] = useState(false)
  const priorityStyles = getPriorityStyles(notification.priority)
  const link = getNotificationLink(notification)

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(onDismiss, 200)
  }

  const handleClick = () => {
    handleDismiss()
  }

  return (
    <div
      className={`pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300 ${
        isExiting ? 'animate-out slide-out-to-right fade-out duration-200' : ''
      }`}
      style={style}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border ${priorityStyles.border} bg-card/95 backdrop-blur-xl shadow-2xl ${priorityStyles.glow}`}
      >
        {/* Priority indicator line */}
        {notification.priority >= 4 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 animate-pulse" />
        )}

        <Link
          href={link}
          onClick={handleClick}
          className="flex gap-3 p-4 hover:bg-white/5 active:bg-white/10 transition-colors touch-manipulation"
        >
          {/* Game Cover or Icon */}
          <div className="flex-shrink-0">
            {notification.game?.cover_url ? (
              <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-zinc-800 shadow-md ring-2 ring-white/10">
                <Image
                  src={notification.game.cover_url}
                  alt={notification.game.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                {getNotificationIcon(notification.type, notification.priority)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Type Badge + Live indicator */}
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full ${priorityStyles.badge}`}>
                {getTypeLabel(notification.type)}
              </span>
              {notification.priority >= 4 && (
                <span className="flex items-center gap-1 text-[10px] font-medium text-amber-400">
                  <Zap className="w-3 h-3 fill-amber-400" />
                  Live
                </span>
              )}
            </div>

            {/* Title */}
            <p className="text-sm font-semibold text-foreground line-clamp-1">
              {notification.title}
            </p>

            {/* Game name */}
            {notification.game && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {notification.game.name}
              </p>
            )}

            {/* Body preview */}
            {notification.body && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                {notification.body}
              </p>
            )}
          </div>
        </Link>

        {/* Dismiss button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDismiss()
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/20 hover:bg-black/40 active:scale-95 transition-all touch-manipulation"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4 text-white/70" />
        </button>

        {/* Progress bar for auto-dismiss */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <div
            className="h-full bg-primary/50 animate-shrink-width"
            style={{
              animationDuration: notification.priority >= 4 ? '10s' : '6s',
            }}
          />
        </div>
      </div>
    </div>
  )
}
