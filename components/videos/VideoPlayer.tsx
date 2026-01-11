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
  const [embedFailed, setEmbedFailed] = useState(false)

  // Reset embed failed state when video changes
  useEffect(() => {
    setEmbedFailed(false)
  }, [youtubeId])

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

  if (!isOpen) {
    return null
  }

  const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeId}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/95"
        onClick={onClose}
      />

      {/* Modal - fills most of the screen on desktop */}
      <div className="relative z-10 w-full max-w-[1600px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white line-clamp-1 pr-4">
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <a
              href={youtubeUrl}
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

        {/* Video Player - 16:9 aspect ratio, fills available space */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl flex-1 min-h-0">
          {embedFailed ? (
            /* Fallback UI for age-restricted or unembeddable videos */
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
              <div className="text-center p-6">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30">
                  <Play className="w-10 h-10 text-white fill-white ml-1" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-3">Video unavailable here</h4>
                <p className="text-zinc-400 mb-8 max-w-md">
                  This video may be age-restricted or unavailable for embedding.<br />Watch it directly on YouTube.
                </p>
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-full transition-colors shadow-lg"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  Watch on YouTube
                </a>
              </div>
            </div>
          ) : (
            /* YouTube embed iframe */
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full rounded-xl"
              onError={() => setEmbedFailed(true)}
            />
          )}

          {/* Manual fallback button - shown when embed is loading/failed */}
          {!embedFailed && (
            <div className="absolute bottom-4 right-4 z-10">
              <button
                onClick={() => setEmbedFailed(true)}
                className="px-3 py-1.5 text-xs bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white rounded-lg backdrop-blur-sm transition-colors"
              >
                Video not loading?
              </button>
            </div>
          )}
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
