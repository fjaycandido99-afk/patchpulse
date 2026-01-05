'use client'

import { useState, useEffect } from 'react'
import { X, Play, ExternalLink } from 'lucide-react'

type VideoPlayerProps = {
  youtubeId: string
  title: string
  isOpen: boolean
  onClose: () => void
}

export function VideoPlayer({ youtubeId, title, isOpen, onClose }: VideoPlayerProps) {
  const [isBrowser, setIsBrowser] = useState(false)

  // Check if we're in a browser (not Capacitor native app)
  useEffect(() => {
    const isNative = typeof window !== 'undefined' &&
      (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    setIsBrowser(!isNative)
  }, [])

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isBrowser || !isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-5xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white line-clamp-1 pr-4">
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <a
              href={`https://www.youtube.com/watch?v=${youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open on YouTube
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player - 16:9 aspect ratio */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-900 shadow-2xl">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>
    </div>
  )
}

// Video card for grid/list display
type VideoCardProps = {
  youtubeId: string
  title: string
  thumbnailUrl: string | null
  channelName: string | null
  viewCount: number
  durationSeconds: number
  videoType: string
  publishedAt: string | null
  onPlay: () => void
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`
  }
  return `${count} views`
}

function getRelativeTime(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  trailer: { label: 'Trailer', color: 'bg-red-500/20 text-red-400' },
  clips: { label: 'Clips', color: 'bg-purple-500/20 text-purple-400' },
  gameplay: { label: 'Gameplay', color: 'bg-blue-500/20 text-blue-400' },
  esports: { label: 'Esports', color: 'bg-amber-500/20 text-amber-400' },
  review: { label: 'Review', color: 'bg-green-500/20 text-green-400' },
  other: { label: 'Video', color: 'bg-zinc-500/20 text-zinc-400' },
}

export function VideoCard({
  youtubeId,
  title,
  thumbnailUrl,
  channelName,
  viewCount,
  durationSeconds,
  videoType,
  publishedAt,
  onPlay,
}: VideoCardProps) {
  const [isBrowser, setIsBrowser] = useState(false)

  useEffect(() => {
    const isNative = typeof window !== 'undefined' &&
      (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    setIsBrowser(!isNative)
  }, [])

  // Don't render on native apps
  if (!isBrowser) {
    return null
  }

  const typeInfo = TYPE_LABELS[videoType] || TYPE_LABELS.other
  const thumbnail = thumbnailUrl || `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`

  return (
    <button
      onClick={onPlay}
      className="group relative flex flex-col text-left rounded-xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </div>
        </div>

        {/* Duration badge */}
        {durationSeconds > 0 && (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-xs font-medium rounded bg-black/80 text-white">
            {formatDuration(durationSeconds)}
          </span>
        )}

        {/* Type badge */}
        <span className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-medium rounded ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex-1">
        <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h4>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          {channelName && (
            <>
              <span className="truncate max-w-[120px]">{channelName}</span>
              <span>·</span>
            </>
          )}
          {viewCount > 0 && (
            <>
              <span>{formatViewCount(viewCount)}</span>
              <span>·</span>
            </>
          )}
          {publishedAt && (
            <span>{getRelativeTime(publishedAt)}</span>
          )}
        </div>
      </div>
    </button>
  )
}
