'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Eye, Library, Play, Pause, Check, X, MoreVertical, Bell } from 'lucide-react'

type BacklogStatus = 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped'

type MobileGameCardProps = {
  id: string
  href: string
  title: string
  imageUrl: string | null
  progress?: number
  status?: BacklogStatus
  hasNewPatch?: boolean
  patchCount?: number
  lastPlayedText?: string | null
  isFavorite?: boolean
  onFavorite?: () => void
  onFollow?: () => void
  onStatusChange?: (status: BacklogStatus) => void
}

const STATUS_CONFIG: Record<BacklogStatus, { label: string; icon: typeof Play; color: string }> = {
  playing: { label: 'Playing', icon: Play, color: 'text-green-400' },
  paused: { label: 'Paused', icon: Pause, color: 'text-amber-400' },
  backlog: { label: 'Backlog', icon: Library, color: 'text-blue-400' },
  finished: { label: 'Done', icon: Check, color: 'text-purple-400' },
  dropped: { label: 'Dropped', icon: X, color: 'text-zinc-400' },
}

export function MobileGameCard({
  id,
  href,
  title,
  imageUrl,
  progress = 0,
  status,
  hasNewPatch,
  patchCount = 0,
  lastPlayedText,
  isFavorite,
  onFavorite,
  onFollow,
  onStatusChange,
}: MobileGameCardProps) {
  const [showQuickActions, setShowQuickActions] = useState(false)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const isLongPress = useRef(false)

  const handleTouchStart = useCallback(() => {
    isLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true
      setShowQuickActions(true)
      // Haptic feedback on supported devices
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }, 500)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }, [])

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isLongPress.current) {
      e.preventDefault()
    }
  }, [])

  const statusConfig = status ? STATUS_CONFIG[status] : null
  const StatusIcon = statusConfig?.icon

  return (
    <>
      {/* Quick Actions Modal */}
      {showQuickActions && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 animate-in fade-in duration-150">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowQuickActions(false)}
          />

          {/* Actions panel */}
          <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
            {/* Game header */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <div className="relative h-14 w-14 rounded-lg overflow-hidden flex-shrink-0">
                {imageUrl ? (
                  <Image src={imageUrl} alt={title} fill className="object-cover" sizes="56px" />
                ) : (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <Library className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{title}</h3>
                {statusConfig && (
                  <p className={`text-sm ${statusConfig.color}`}>{statusConfig.label}</p>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-4 gap-1 p-3">
              <QuickAction
                icon={Star}
                label="Favorite"
                isActive={isFavorite}
                activeColor="text-amber-400"
                onClick={() => {
                  onFavorite?.()
                  setShowQuickActions(false)
                }}
              />
              <QuickAction
                icon={Eye}
                label="Follow"
                onClick={() => {
                  onFollow?.()
                  setShowQuickActions(false)
                }}
              />
              <QuickAction
                icon={Play}
                label="Playing"
                isActive={status === 'playing'}
                activeColor="text-green-400"
                onClick={() => {
                  onStatusChange?.('playing')
                  setShowQuickActions(false)
                }}
              />
              <QuickAction
                icon={Library}
                label="Backlog"
                isActive={status === 'backlog'}
                activeColor="text-blue-400"
                onClick={() => {
                  onStatusChange?.('backlog')
                  setShowQuickActions(false)
                }}
              />
            </div>

            {/* Cancel */}
            <button
              onClick={() => setShowQuickActions(false)}
              className="w-full py-4 text-sm font-medium text-muted-foreground border-t border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Card */}
      <Link
        href={href}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="group relative flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 active:scale-[0.98] transition-all"
      >
        {/* Cover image with progress ring */}
        <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
          {imageUrl ? (
            <Image src={imageUrl} alt={title} fill className="object-cover" sizes="64px" />
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <Library className="h-6 w-6 text-muted-foreground" />
            </div>
          )}

          {/* Progress ring overlay */}
          {progress > 0 && progress < 100 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-white/20"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${progress * 0.88} 88`}
                  strokeLinecap="round"
                  className="text-primary"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-white">{progress}%</span>
            </div>
          )}

          {/* Completed badge */}
          {progress === 100 && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500/80">
              <Check className="h-6 w-6 text-white" />
            </div>
          )}

          {/* New patch indicator */}
          {hasNewPatch && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center ring-2 ring-card">
              <Bell className="h-2.5 w-2.5 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm leading-tight line-clamp-2">{title}</h3>
            {isFavorite && (
              <Star className="h-4 w-4 text-amber-400 fill-amber-400 flex-shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            {statusConfig && StatusIcon && (
              <span className={`flex items-center gap-1 text-xs ${statusConfig.color}`}>
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </span>
            )}
            {patchCount > 0 && (
              <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                {patchCount} update{patchCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {lastPlayedText && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{lastPlayedText}</p>
          )}
        </div>

        {/* More button (desktop only) */}
        <button
          onClick={(e) => {
            e.preventDefault()
            setShowQuickActions(true)
          }}
          className="hidden md:flex p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </Link>
    </>
  )
}

function QuickAction({
  icon: Icon,
  label,
  isActive,
  activeColor = 'text-primary',
  onClick,
}: {
  icon: typeof Star
  label: string
  isActive?: boolean
  activeColor?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors ${
        isActive
          ? `bg-primary/10 ${activeColor}`
          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className={`h-6 w-6 ${isActive ? 'fill-current' : ''}`} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}
