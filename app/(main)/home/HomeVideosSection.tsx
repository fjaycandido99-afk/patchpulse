'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Play, Film, Clapperboard, Gamepad2, Trophy, X, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'

// Video type icons and colors
const VIDEO_TYPE_CONFIG = {
  trailer: { icon: Film, color: 'bg-red-500/80', label: 'Trailer' },
  clips: { icon: Clapperboard, color: 'bg-purple-500/80', label: 'Clips' },
  gameplay: { icon: Gamepad2, color: 'bg-blue-500/80', label: 'Gameplay' },
  esports: { icon: Trophy, color: 'bg-amber-500/80', label: 'Esports' },
  review: { icon: Play, color: 'bg-green-500/80', label: 'Review' },
  other: { icon: Play, color: 'bg-zinc-500/80', label: 'Video' },
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

type Video = {
  id: string
  youtube_id: string
  title: string
  thumbnail_url: string | null
  video_type: string
  duration_seconds: number
  channel_name: string | null
  game?: {
    name: string
  } | null
}

type HomeVideosSectionProps = {
  videos: Video[]
}

// Fullscreen vertical scroll video player
function VerticalVideoPlayer({
  videos,
  initialIndex,
  onClose,
}: {
  videos: Video[]
  initialIndex: number
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [embedFailed, setEmbedFailed] = useState<Set<number>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number | null>(null)

  const currentVideo = videos[currentIndex]
  const config = VIDEO_TYPE_CONFIG[currentVideo.video_type as keyof typeof VIDEO_TYPE_CONFIG] || VIDEO_TYPE_CONFIG.other

  const goToNext = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex, videos.length])

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }, [currentIndex])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown' || e.key === 'j') goToNext()
      if (e.key === 'ArrowUp' || e.key === 'k') goToPrev()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose, goToNext, goToPrev])

  // Handle touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return

    const touchEndY = e.changedTouches[0].clientY
    const diff = touchStartY.current - touchEndY
    const minSwipeDistance = 50

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        goToNext() // Swiped up -> next video
      } else {
        goToPrev() // Swiped down -> previous video
      }
    }

    touchStartY.current = null
  }

  // Handle wheel scroll
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    if (e.deltaY > 50) {
      goToNext()
    } else if (e.deltaY < -50) {
      goToPrev()
    }
  }, [goToNext, goToPrev])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => container.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  const youtubeUrl = `https://www.youtube.com/watch?v=${currentVideo.youtube_id}`
  const hasEmbedFailed = embedFailed.has(currentIndex)

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header - with safe area for iOS status bar */}
      <div
        className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
            <span className="text-xs text-white/60">
              {currentIndex + 1} / {videos.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-white" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-3xl aspect-video mx-4">
          {hasEmbedFailed ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 rounded-xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-600 flex items-center justify-center">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
              <p className="text-white/60 mb-4 text-center px-4">This video can't be embedded</p>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-full transition-colors"
              >
                Watch on YouTube
              </a>
            </div>
          ) : (
            <iframe
              key={currentVideo.youtube_id}
              src={`https://www.youtube.com/embed/${currentVideo.youtube_id}?autoplay=1&rel=0&modestbranding=1`}
              title={currentVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full rounded-xl"
              onError={() => setEmbedFailed(prev => new Set(prev).add(currentIndex))}
            />
          )}

          {/* Fallback button */}
          {!hasEmbedFailed && (
            <button
              onClick={() => setEmbedFailed(prev => new Set(prev).add(currentIndex))}
              className="absolute bottom-4 right-4 px-3 py-1.5 text-xs bg-black/60 hover:bg-black/80 text-white/70 rounded-lg transition-colors"
            >
              Video not loading?
            </button>
          )}
        </div>
      </div>

      {/* Footer with title and navigation hints */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-white font-medium text-lg line-clamp-2 mb-1">
            {currentVideo.title}
          </h3>
          <p className="text-white/60 text-sm">
            {currentVideo.channel_name || currentVideo.game?.name || 'Gaming'}
          </p>
        </div>
      </div>

      {/* Navigation arrows - desktop */}
      <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 flex-col gap-2 z-20">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className={`p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors ${
            currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''
          }`}
        >
          <ChevronUp className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={goToNext}
          disabled={currentIndex === videos.length - 1}
          className={`p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors ${
            currentIndex === videos.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
          }`}
        >
          <ChevronDown className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Swipe hint - mobile */}
      <div className="md:hidden absolute left-1/2 -translate-x-1/2 bottom-24 text-white/40 text-xs flex items-center gap-1">
        <ChevronUp className="w-4 h-4" />
        <span>Swipe for more</span>
        <ChevronDown className="w-4 h-4" />
      </div>

      {/* Video dots indicator */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-20">
        {videos.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              idx === currentIndex
                ? 'bg-white h-4'
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export function HomeVideosSection({ videos }: HomeVideosSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (videos.length === 0) return null

  // Show only 3 cards on home page, but all videos in player
  const displayVideos = videos.slice(0, 3)

  return (
    <section className="space-y-4">
      <div className="px-4 md:px-0">
        <SectionHeader title="Videos" href="/videos" />
      </div>
      <div className="grid grid-cols-1 gap-3 -mx-4 md:mx-0">
        {displayVideos.map((video, index) => (
          <HomeVideoCard
            key={video.id}
            video={video}
            index={index}
            onPlay={() => setSelectedIndex(index)}
          />
        ))}
      </div>

      {/* Fullscreen vertical video player - rendered via portal to escape transform context */}
      {selectedIndex !== null && typeof document !== 'undefined' && createPortal(
        <VerticalVideoPlayer
          videos={videos}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />,
        document.body
      )}
    </section>
  )
}

// Video card for home page
function HomeVideoCard({
  video,
  index,
  onPlay,
}: {
  video: Video
  index: number
  onPlay: () => void
}) {
  const config = VIDEO_TYPE_CONFIG[video.video_type as keyof typeof VIDEO_TYPE_CONFIG] || VIDEO_TYPE_CONFIG.other
  const Icon = config.icon
  const thumbnail = video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`

  return (
    <button
      onClick={onPlay}
      className="group block text-left w-full"
    >
      {/* Thumbnail - 16:9, edge-to-edge on mobile */}
      <div
        className="relative aspect-video overflow-hidden bg-zinc-900 md:rounded-xl"
      >
        <Image
          src={thumbnail}
          alt={video.title}
          fill
          className="object-cover"
          sizes="100vw"
          unoptimized
        />

        {/* Play button - centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center group-hover:bg-red-600 transition-colors">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Type badge */}
        <span className={`absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded ${config.color}`}>
          <Icon className="w-3 h-3 text-white" />
          <span className="text-[10px] font-medium text-white capitalize">{video.video_type}</span>
        </span>

        {/* Duration */}
        {video.duration_seconds > 0 && (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[10px] font-medium rounded bg-black/80 text-white">
            {formatDuration(video.duration_seconds)}
          </span>
        )}
      </div>

      {/* Info below with padding */}
      <div className="mt-2 px-4 md:px-0">
        <h3 className="text-sm font-medium line-clamp-2 leading-snug text-white group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {video.channel_name || video.game?.name || 'Gaming'}
        </p>
      </div>
    </button>
  )
}
