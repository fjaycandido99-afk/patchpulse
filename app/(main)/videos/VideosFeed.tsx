'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Video,
  Play,
  Film,
  Gamepad2,
  Trophy,
  Clapperboard,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Bookmark,
  Crown,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { toggleVideoBookmark, type VideoMetadata } from '../actions/bookmarks'
import { useToastUI } from '@/components/ui/toast'
import type { VideoWithGame } from './queries'

type VideoType = 'trailer' | 'clips' | 'gameplay' | 'esports' | 'review' | 'other'

const TYPE_CONFIG: Record<VideoType | 'all', { label: string; icon: React.ReactNode; color: string }> = {
  all: { label: 'For You', icon: <Video className="w-4 h-4 md:w-3 md:h-3" />, color: 'bg-primary/20 text-primary' },
  trailer: { label: 'Trailers', icon: <Film className="w-4 h-4 md:w-3 md:h-3" />, color: 'bg-red-500/20 text-red-400' },
  clips: { label: 'Clips', icon: <Clapperboard className="w-4 h-4 md:w-3 md:h-3" />, color: 'bg-purple-500/20 text-purple-400' },
  gameplay: { label: 'Gameplay', icon: <Gamepad2 className="w-4 h-4 md:w-3 md:h-3" />, color: 'bg-blue-500/20 text-blue-400' },
  esports: { label: 'Esports', icon: <Trophy className="w-4 h-4 md:w-3 md:h-3" />, color: 'bg-amber-500/20 text-amber-400' },
  review: { label: 'Reviews', icon: <Video className="w-4 h-4 md:w-3 md:h-3" />, color: 'bg-green-500/20 text-green-400' },
  other: { label: 'Other', icon: <Video className="w-4 h-4 md:w-3 md:h-3" />, color: 'bg-zinc-500/20 text-zinc-400' },
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
    return `${(count / 1000).toFixed(0)}K views`
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

// Get best quality YouTube thumbnail with fallback
function getYouTubeThumbnail(youtubeId: string, quality: 'max' | 'sd' | 'hq' = 'max') {
  const qualityMap = {
    max: 'maxresdefault',  // 1280x720
    sd: 'sddefault',       // 640x480
    hq: 'hqdefault',       // 480x360
  }
  return `https://img.youtube.com/vi/${youtubeId}/${qualityMap[quality]}.jpg`
}

// Fullscreen vertical scroll video player - simplified version matching HomeVideosSection
function VerticalVideoPlayer({
  videos,
  initialIndex,
  onClose,
}: {
  videos: VideoWithGame[]
  initialIndex: number
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [embedFailed, setEmbedFailed] = useState<Set<number>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number | null>(null)

  const currentVideo = videos[currentIndex]
  const typeConfig = TYPE_CONFIG[currentVideo.video_type as VideoType] || TYPE_CONFIG.other

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
        goToNext()
      } else {
        goToPrev()
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
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${typeConfig.color}`}>
              {typeConfig.label}
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
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Player - use fixed dimensions for iOS compatibility */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ top: '60px', bottom: '100px' }}>
        <div className="relative w-full h-full max-w-3xl mx-4" style={{ maxHeight: 'calc(100vw * 9 / 16)' }}>
          {hasEmbedFailed ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 rounded-xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-600 flex items-center justify-center">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
              <p className="text-white/60 mb-4 text-center px-4">This video can&apos;t be embedded</p>
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
              type="button"
              onClick={() => setEmbedFailed(prev => new Set(prev).add(currentIndex))}
              className="absolute bottom-4 right-4 px-3 py-1.5 text-xs bg-black/60 hover:bg-black/80 text-white/70 rounded-lg transition-colors z-20"
            >
              Video not loading?
            </button>
          )}
        </div>
      </div>

      {/* Footer with title */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="max-w-3xl mx-auto">
          {currentVideo.game && (
            <span className="inline-block px-2 py-1 mb-2 text-xs font-medium bg-white/15 text-white rounded-full">
              {currentVideo.game.name}
            </span>
          )}
          <h3 className="text-white font-medium text-lg line-clamp-2 mb-1">
            {currentVideo.title}
          </h3>
          <p className="text-white/60 text-sm">
            {currentVideo.channel_name || 'Gaming'}
          </p>
        </div>
      </div>

      {/* Navigation arrows - desktop */}
      <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 flex-col gap-2 z-20">
        <button
          type="button"
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className={`p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors ${
            currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''
          }`}
        >
          <ChevronUp className="w-6 h-6 text-white" />
        </button>
        <button
          type="button"
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
      {videos.length <= 15 && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-20">
          {videos.map((_, idx) => (
            <button
              type="button"
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
      )}
    </div>
  )
}

// Hero Carousel for Desktop (currently disabled for For You page)
function HeroCarousel({
  videos,
  onPlay,
}: {
  videos: VideoWithGame[]
  onPlay: (video: VideoWithGame) => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollTo = (index: number) => {
    if (carouselRef.current) {
      const width = carouselRef.current.offsetWidth
      carouselRef.current.scrollTo({ left: width * index, behavior: 'smooth' })
      setCurrentIndex(index)
    }
  }

  const next = () => scrollTo((currentIndex + 1) % videos.length)
  const prev = () => scrollTo((currentIndex - 1 + videos.length) % videos.length)

  // Auto-scroll every 5 seconds
  useEffect(() => {
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [currentIndex, videos.length])

  if (videos.length === 0) return null

  return (
    <div className="relative group">
      {/* Carousel container */}
      <div
        ref={carouselRef}
        className="flex overflow-x-hidden snap-x snap-mandatory rounded-2xl"
        onScroll={(e) => {
          const target = e.target as HTMLElement
          const index = Math.round(target.scrollLeft / target.offsetWidth)
          setCurrentIndex(index)
        }}
      >
        {videos.map((video) => {
          const hasFailed = failedImages.has(video.youtube_id)
          const thumbnail = hasFailed
            ? getYouTubeThumbnail(video.youtube_id, 'sd')
            : getYouTubeThumbnail(video.youtube_id, 'max')
          const typeConfig = TYPE_CONFIG[video.video_type] || TYPE_CONFIG.other

          return (
            <button
              key={video.id}
              onClick={() => onPlay(video)}
              className="relative flex-shrink-0 w-full snap-center aspect-[21/9] overflow-hidden"
            >
              <Image
                src={thumbnail}
                alt={video.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority
                unoptimized
                onError={() => {
                  if (!hasFailed) {
                    setFailedImages(prev => new Set([...prev, video.youtube_id]))
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-red-600/90 flex items-center justify-center shadow-2xl backdrop-blur-sm border-2 border-white/20 group-hover:scale-110 transition-transform">
                  <Play className="w-9 h-9 text-white fill-white ml-1" />
                </div>
              </div>
              <span className={`absolute top-4 left-4 px-3 py-1 text-sm font-medium rounded-full ${typeConfig.color} backdrop-blur-sm`}>
                {typeConfig.label}
              </span>
              {video.duration_seconds > 0 && (
                <span className="absolute top-4 right-4 px-2 py-1 text-sm font-medium rounded bg-black/70 text-white backdrop-blur-sm">
                  {formatDuration(video.duration_seconds)}
                </span>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="font-bold text-white text-2xl leading-tight line-clamp-2 max-w-3xl">
                  {video.title}
                </h2>
                <div className="flex items-center gap-3 mt-3 text-sm text-white/60">
                  {video.channel_name && <span>{video.channel_name}</span>}
                  {video.view_count > 0 && (
                    <>
                      <span>•</span>
                      <span>{formatViewCount(video.view_count)}</span>
                    </>
                  )}
                  {video.published_at && (
                    <>
                      <span>•</span>
                      <span>{getRelativeTime(video.published_at)}</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
      {videos.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
      {videos.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// YouTube-style Mobile Card with press-and-hold preview
function MobileVideoCard({
  video,
  onPlay,
  isSaved,
  onSave,
  bleed = false,
}: {
  video: VideoWithGame
  onPlay: () => void
  isSaved: boolean
  onSave: (e: React.MouseEvent) => void
  bleed?: boolean
}) {
  const [showPreview, setShowPreview] = useState(false)
  const [imgError, setImgError] = useState(false)
  const pressTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const didPreviewRef = useRef(false)

  const typeConfig = TYPE_CONFIG[video.video_type] || TYPE_CONFIG.other
  // Fallback chain: stored thumbnail -> YouTube maxres -> YouTube hq
  const thumbnail = imgError
    ? `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`
    : (video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`)

  const handleTouchStart = () => {
    didPreviewRef.current = false
    // Start preview after 600ms press
    pressTimeoutRef.current = setTimeout(() => {
      setShowPreview(true)
      didPreviewRef.current = true
    }, 600)
  }

  const handleTouchEnd = () => {
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current)
      pressTimeoutRef.current = null
    }
    setShowPreview(false)
  }

  const handleClick = () => {
    // Only trigger play if we didn't just show a preview
    if (!didPreviewRef.current) {
      onPlay()
    }
    didPreviewRef.current = false
  }

  return (
    <div>
      {/* Thumbnail container - edge-to-edge when bleed, rounded otherwise */}
      <div className={`relative overflow-hidden bg-zinc-900 ${bleed ? '-mx-4 w-[calc(100%+2rem)]' : 'rounded-xl'}`}>
        <button
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="relative aspect-video w-full"
        >
        {/* YouTube Preview - shows on press and hold */}
        {showPreview && (
          <iframe
            src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&start=5`}
            className="absolute inset-0 w-full h-full z-10"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        )}

        <Image
          src={thumbnail}
          alt={video.title}
          fill
          className="object-cover"
          sizes="100vw"
          unoptimized
          onError={() => setImgError(true)}
        />

        {/* Subtle play button - hide when preview showing */}
        {!showPreview && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
            {video.duration_seconds > 0 && (
              <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-black/80 text-white">
                {formatDuration(video.duration_seconds)}
              </span>
            )}
            <div className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Type badge */}
        <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold rounded ${typeConfig.color} z-20`}>
          {typeConfig.label}
        </span>

        {/* Preview hint - shows briefly */}
        {showPreview && (
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/80 text-white text-xs z-20 animate-pulse">
            Previewing...
          </div>
        )}
        </button>
      </div>

      {/* Info - add horizontal padding when bleed */}
      <div className={`flex gap-3 mt-3 ${bleed ? 'px-4' : ''}`}>
        {/* Title and meta */}
        <button onClick={onPlay} className="flex-1 min-w-0 text-left">
          <h3 className="font-medium text-sm line-clamp-2 leading-snug">
            {video.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-1 mt-1 text-xs text-muted-foreground">
            <span className="truncate max-w-[160px]">{video.channel_name || 'Unknown Channel'}</span>
            {video.view_count > 0 && (
              <>
                <span>•</span>
                <span>{formatViewCount(video.view_count)}</span>
              </>
            )}
            {video.published_at && (
              <>
                <span>•</span>
                <span>{getRelativeTime(video.published_at)}</span>
              </>
            )}
          </div>
        </button>

        {/* Save button */}
        <button
          onClick={onSave}
          className={`flex-shrink-0 p-2 rounded-full transition-colors ${
            isSaved
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  )
}

// Desktop Grid Card (2-column) with hover preview
function DesktopVideoCard({
  video,
  onPlay,
  isSaved,
  onSave,
}: {
  video: VideoWithGame
  onPlay: () => void
  isSaved: boolean
  onSave: (e: React.MouseEvent) => void
}) {
  const [isHovering, setIsHovering] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [imgError, setImgError] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const typeConfig = TYPE_CONFIG[video.video_type] || TYPE_CONFIG.other
  // Fallback chain: stored thumbnail -> YouTube maxres -> YouTube hq
  const thumbnail = imgError
    ? `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`
    : (video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`)

  const handleMouseEnter = () => {
    setIsHovering(true)
    // Start preview after 800ms hover
    hoverTimeoutRef.current = setTimeout(() => {
      setShowPreview(true)
    }, 800)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    setShowPreview(false)
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }

  return (
    <div
      className={`group w-full rounded-xl overflow-hidden bg-card border transition-all duration-300 ${
        isHovering
          ? 'border-primary/60 shadow-xl shadow-primary/10 scale-[1.02] -translate-y-1'
          : 'border-border hover:border-white/20'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail / Preview */}
      <div
        role="button"
        tabIndex={0}
        onClick={onPlay}
        onKeyDown={(e) => e.key === 'Enter' && onPlay()}
        className="relative w-full aspect-video overflow-hidden bg-zinc-800 cursor-pointer"
      >
        {/* YouTube Preview - shows after hover delay */}
        {showPreview && (
          <iframe
            src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&start=5`}
            className="absolute inset-0 w-full h-full z-10"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        )}

        {/* Thumbnail */}
        <Image
          src={thumbnail}
          alt={video.title}
          fill
          className={`object-cover transition-transform duration-300 ${isHovering ? 'scale-110' : ''}`}
          sizes="50vw"
          onError={() => setImgError(true)}
          unoptimized
        />

        {/* Gradient overlay for better text contrast */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

        {/* Play button - hide when preview is showing */}
        {!showPreview && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`rounded-full flex items-center justify-center backdrop-blur-sm border transition-all duration-300 ${
              isHovering
                ? 'w-16 h-16 bg-red-600 border-red-500/50 shadow-lg shadow-red-600/30'
                : 'w-12 h-12 bg-black/60 border-white/10'
            }`}>
              <Play className={`text-white fill-white ml-0.5 transition-all duration-300 ${isHovering ? 'w-7 h-7' : 'w-5 h-5'}`} />
            </div>
          </div>
        )}

        {/* Duration badge - bottom right with pill style */}
        {video.duration_seconds > 0 && !showPreview && (
          <span className="absolute bottom-2 right-2 px-2 py-1 text-xs font-semibold rounded-md bg-black/90 text-white shadow-lg">
            {formatDuration(video.duration_seconds)}
          </span>
        )}

        {/* Type badge */}
        <span className={`absolute top-2 left-2 px-2.5 py-1 text-xs font-semibold rounded-md ${typeConfig.color} backdrop-blur-sm shadow-lg z-20`}>
          {typeConfig.label}
        </span>

        {/* Save button - top right */}
        <button
          onClick={onSave}
          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-all z-20 shadow-lg ${
            isSaved
              ? 'bg-primary text-white'
              : 'bg-black/60 text-white/90 hover:bg-black/80 hover:text-white hover:scale-110'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Info section with better styling */}
      <button onClick={onPlay} className="w-full p-4 text-left bg-gradient-to-b from-card to-card/80">
        <h3 className={`font-semibold text-base line-clamp-2 transition-colors duration-200 ${
          isHovering ? 'text-primary' : 'text-foreground'
        }`} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
          {video.title}
        </h3>

        <div className="flex items-center gap-2 mt-2.5 text-sm text-muted-foreground">
          <span className="truncate max-w-[180px]">{video.channel_name || 'Unknown Channel'}</span>
          {video.view_count > 0 && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span className="font-medium">{formatViewCount(video.view_count)}</span>
            </>
          )}
          {video.published_at && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span>{getRelativeTime(video.published_at)}</span>
            </>
          )}
        </div>
      </button>
    </div>
  )
}

type VideosFeedProps = {
  videos: VideoWithGame[]
  trendingVideos: VideoWithGame[]
  videoTypes: { type: VideoType; count: number }[]
  selectedType: VideoType | null
  savedVideoIds: string[]
  isPro?: boolean
}

const FREE_VIDEO_LIMIT = 10

export function VideosFeed({
  videos,
  trendingVideos,
  videoTypes,
  selectedType,
  savedVideoIds,
  isPro = false,
}: VideosFeedProps) {
    const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null)
  const [localSavedIds, setLocalSavedIds] = useState<Set<string>>(new Set(savedVideoIds))
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())
  const router = useRouter()
  const { toast } = useToastUI()

  // Limit videos for non-Pro users
  const displayVideos = isPro ? videos : videos.slice(0, FREE_VIDEO_LIMIT)
  const hasMoreVideos = !isPro && videos.length > FREE_VIDEO_LIMIT

  // Sync with server state
  useEffect(() => {
    setLocalSavedIds(new Set(savedVideoIds))
  }, [savedVideoIds])

  const handleSave = async (video: VideoWithGame, e: React.MouseEvent) => {
    e.stopPropagation()

    if (savingIds.has(video.id)) return

    setSavingIds(prev => new Set(prev).add(video.id))

    // Optimistic update
    setLocalSavedIds(prev => {
      const next = new Set(prev)
      if (next.has(video.id)) {
        next.delete(video.id)
      } else {
        next.add(video.id)
      }
      return next
    })

    const metadata: VideoMetadata = {
      youtube_id: video.youtube_id,
      title: video.title,
      thumbnail_url: video.thumbnail_url,
      channel_name: video.channel_name,
      video_type: video.video_type,
      game_name: video.game?.name || null,
      savedAt: new Date().toISOString(),
    }

    const result = await toggleVideoBookmark(video.id, metadata)

    if (result.error) {
      // Revert on error
      setLocalSavedIds(prev => {
        const next = new Set(prev)
        if (next.has(video.id)) {
          next.delete(video.id)
        } else {
          next.add(video.id)
        }
        return next
      })
      toast.error(result.error)
    }

    setSavingIds(prev => {
      const next = new Set(prev)
      next.delete(video.id)
      return next
    })

    router.refresh()
  }

    const updateFilters = (type: VideoType | null) => {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    router.push(`/videos${params.toString() ? `?${params.toString()}` : ''}`)
  }

  if (videos.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Video className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No videos found</p>
        <p className="mt-1 text-sm text-muted-foreground">Videos will appear here as they are fetched</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Chips - Icon only on mobile, show label when active */}
      <div className="sticky top-0 z-30 -mx-4 px-2 py-2 bg-background/95 backdrop-blur-md border-b border-white/5 md:relative md:mx-0 md:px-0 md:py-0 md:bg-transparent md:backdrop-blur-none md:border-0">
        <div className="flex justify-center gap-1.5 md:justify-start md:gap-2">
          <button
            onClick={() => updateFilters(null)}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 md:py-1.5 md:px-3 text-[11px] md:text-xs font-medium rounded-full transition-all ${
              !selectedType
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-zinc-800 text-zinc-400 active:bg-zinc-700'
            }`}
          >
            <Video className="w-4 h-4 md:w-3 md:h-3" />
            {/* Show label on mobile only when active, always on desktop */}
            <span className={!selectedType ? 'inline' : 'hidden md:inline'}>For You</span>
          </button>

          {videoTypes
            .filter(({ type }) => ['trailer', 'clips', 'gameplay', 'esports'].includes(type))
            .map(({ type }) => {
              const config = TYPE_CONFIG[type]
              const isActive = selectedType === type
              return (
                <button
                  key={type}
                  onClick={() => updateFilters(type)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 md:py-1.5 md:px-3 text-[11px] md:text-xs font-medium rounded-full transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-zinc-800 text-zinc-400 active:bg-zinc-700'
                  }`}
                >
                  {config.icon}
                  {/* Show label on mobile only when active, always on desktop */}
                  <span className={isActive ? 'inline' : 'hidden md:inline'}>{config.label}</span>
                </button>
              )
            })}
        </div>
      </div>

      {/* Mobile: YouTube-style vertical list */}
      {/* Bleed edge-to-edge for trailer/gameplay/esports sections */}
      {(() => {
        const shouldBleed = !selectedType || ['trailer', 'gameplay', 'esports'].includes(selectedType)
        return (
          <div className="md:hidden">
            <div className="space-y-5">
              {displayVideos.map((video, index) => (
                <div
                  key={video.id}
                  className="animate-soft-entry"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <MobileVideoCard
                    video={video}
                    onPlay={() => setSelectedVideoIndex(index)}
                    isSaved={localSavedIds.has(video.id)}
                    onSave={(e) => handleSave(video, e)}
                    bleed={shouldBleed}
                  />
                </div>
              ))}
            </div>

            {/* Upgrade CTA for mobile */}
            {hasMoreVideos && (
              <div className="relative mt-6">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent -top-20 pointer-events-none" />
                <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-violet-500/10 p-6 text-center">
                  <Crown className="w-10 h-10 mx-auto text-primary mb-3" />
                  <h3 className="text-lg font-bold mb-2">Unlock All Videos</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upgrade to Pro for unlimited access to trailers, gameplay, and esports highlights
                  </p>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade to Pro
                  </Link>
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* Desktop: 2-column grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayVideos.map((video, index) => (
          <div
            key={video.id}
            className="animate-soft-entry"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <DesktopVideoCard
              video={video}
              onPlay={() => setSelectedVideoIndex(index)}
              isSaved={localSavedIds.has(video.id)}
              onSave={(e) => handleSave(video, e)}
            />
          </div>
        ))}
      </div>

      {/* Desktop Upgrade CTA */}
      {hasMoreVideos && (
        <div className="hidden md:block relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent -top-24 pointer-events-none" />
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-violet-500/10 p-8 text-center">
            <Crown className="w-12 h-12 mx-auto text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Unlock All {videos.length} Videos</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Upgrade to Pro for unlimited access to trailers, gameplay clips, and esports highlights
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Pro
            </Link>
          </div>
        </div>
      )}

      {/* Vertical Video Player (TikTok/Shorts style) */}
      {selectedVideoIndex !== null && (
        <VerticalVideoPlayer
          videos={displayVideos}
          initialIndex={selectedVideoIndex}
          onClose={() => setSelectedVideoIndex(null)}
        />
      )}
    </div>
  )
}
