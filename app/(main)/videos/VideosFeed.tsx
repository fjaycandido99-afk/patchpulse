'use client'

import { useState, useEffect, useRef } from 'react'
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
  ExternalLink,
  Bookmark,
} from 'lucide-react'
import { VideoPlayer } from '@/components/videos'
import { toggleVideoBookmark, type VideoMetadata } from '../actions/bookmarks'
import type { VideoWithGame } from './queries'

type VideoType = 'trailer' | 'clips' | 'gameplay' | 'esports' | 'review' | 'other'

const TYPE_CONFIG: Record<VideoType | 'all', { label: string; icon: React.ReactNode; color: string }> = {
  all: { label: 'All', icon: <Video className="w-4 h-4" />, color: 'bg-zinc-500/20 text-zinc-400' },
  trailer: { label: 'Trailers', icon: <Film className="w-4 h-4" />, color: 'bg-red-500/20 text-red-400' },
  clips: { label: 'Clips', icon: <Clapperboard className="w-4 h-4" />, color: 'bg-purple-500/20 text-purple-400' },
  gameplay: { label: 'Gameplay', icon: <Gamepad2 className="w-4 h-4" />, color: 'bg-blue-500/20 text-blue-400' },
  esports: { label: 'Esports', icon: <Trophy className="w-4 h-4" />, color: 'bg-amber-500/20 text-amber-400' },
  review: { label: 'Reviews', icon: <Video className="w-4 h-4" />, color: 'bg-green-500/20 text-green-400' },
  other: { label: 'Other', icon: <Video className="w-4 h-4" />, color: 'bg-zinc-500/20 text-zinc-400' },
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

// Hero Carousel for Desktop
function HeroCarousel({
  videos,
  onPlay,
}: {
  videos: VideoWithGame[]
  onPlay: (video: VideoWithGame) => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
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
          const thumbnail = video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`
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
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

              {/* Play button - always visible */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-red-600/90 flex items-center justify-center shadow-2xl backdrop-blur-sm border-2 border-white/20 group-hover:scale-110 transition-transform">
                  <Play className="w-9 h-9 text-white fill-white ml-1" />
                </div>
              </div>

              {/* Type badge */}
              <span className={`absolute top-4 left-4 px-3 py-1 text-sm font-medium rounded-full ${typeConfig.color} backdrop-blur-sm`}>
                {typeConfig.label}
              </span>

              {/* Duration */}
              {video.duration_seconds > 0 && (
                <span className="absolute top-4 right-4 px-2 py-1 text-sm font-medium rounded bg-black/70 text-white backdrop-blur-sm">
                  {formatDuration(video.duration_seconds)}
                </span>
              )}

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                {video.game && (
                  <div className="flex items-center gap-2 mb-2">
                    {video.game.logo_url && (
                      <div className="relative w-6 h-6 rounded overflow-hidden bg-white/10">
                        <Image src={video.game.logo_url} alt="" fill className="object-contain" sizes="24px" unoptimized />
                      </div>
                    )}
                    <span className="text-sm text-white/80 font-medium">{video.game.name}</span>
                  </div>
                )}

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

      {/* Navigation arrows */}
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

      {/* Dots indicator */}
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

// YouTube-style Mobile Card
function MobileVideoCard({
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
  const typeConfig = TYPE_CONFIG[video.video_type] || TYPE_CONFIG.other
  const thumbnail = video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`

  return (
    <div className="w-full">
      {/* Thumbnail - full width */}
      <button onClick={onPlay} className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-800">
        <Image
          src={thumbnail}
          alt={video.title}
          fill
          className="object-cover"
          sizes="100vw"
          unoptimized
        />

        {/* Subtle play button - always visible */}
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

        {/* Type badge */}
        <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold rounded ${typeConfig.color}`}>
          {typeConfig.label}
        </span>
      </button>

      {/* Info - YouTube style */}
      <div className="flex gap-3 mt-3">
        {/* Channel avatar / Game logo */}
        <button onClick={onPlay} className="flex-shrink-0">
          {video.game?.logo_url ? (
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-zinc-700">
              <Image src={video.game.logo_url} alt="" fill className="object-cover" sizes="36px" unoptimized />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center">
              <Video className="w-4 h-4 text-zinc-500" />
            </div>
          )}
        </button>

        {/* Title and meta */}
        <button onClick={onPlay} className="flex-1 min-w-0 text-left">
          <h3 className="font-medium text-sm line-clamp-2 leading-snug">
            {video.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-1 mt-1 text-xs text-muted-foreground">
            <span>{video.game?.name || video.channel_name || 'Gaming'}</span>
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

// Desktop Grid Card (2-column)
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
  const typeConfig = TYPE_CONFIG[video.video_type] || TYPE_CONFIG.other
  const thumbnail = video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`

  return (
    <div className="group w-full rounded-xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
      {/* Thumbnail */}
      <button onClick={onPlay} className="relative w-full aspect-video overflow-hidden bg-zinc-800">
        <Image
          src={thumbnail}
          alt={video.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="50vw"
          unoptimized
        />

        {/* Subtle play button - always visible, grows on hover */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm border border-white/10 group-hover:w-14 group-hover:h-14 group-hover:bg-red-600/90 transition-all">
            <Play className="w-5 h-5 text-white fill-white ml-0.5 group-hover:w-6 group-hover:h-6 transition-all" />
          </div>
        </div>

        {/* Duration */}
        {video.duration_seconds > 0 && (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-xs font-medium rounded bg-black/80 text-white">
            {formatDuration(video.duration_seconds)}
          </span>
        )}

        {/* Type badge */}
        <span className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-medium rounded ${typeConfig.color}`}>
          {typeConfig.label}
        </span>

        {/* Save button - top right */}
        <button
          onClick={onSave}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-all ${
            isSaved
              ? 'bg-primary/90 text-white'
              : 'bg-black/50 text-white/80 hover:bg-black/70 hover:text-white'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </button>

      {/* Info */}
      <button onClick={onPlay} className="w-full p-4 text-left">
        {video.game && (
          <div className="flex items-center gap-2 mb-2">
            {video.game.logo_url && (
              <div className="relative w-5 h-5 rounded overflow-hidden bg-white/10">
                <Image src={video.game.logo_url} alt="" fill className="object-contain" sizes="20px" unoptimized />
              </div>
            )}
            <span className="text-xs text-muted-foreground">{video.game.name}</span>
          </div>
        )}

        <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>

        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          {video.channel_name && (
            <>
              <span className="truncate max-w-[150px]">{video.channel_name}</span>
              <span>•</span>
            </>
          )}
          {video.view_count > 0 && <span>{formatViewCount(video.view_count)}</span>}
          {video.published_at && (
            <>
              <span>•</span>
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
}

export function VideosFeed({
  videos,
  trendingVideos,
  videoTypes,
  selectedType,
  savedVideoIds,
}: VideosFeedProps) {
  const [isBrowser, setIsBrowser] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<VideoWithGame | null>(null)
  const [localSavedIds, setLocalSavedIds] = useState<Set<string>>(new Set(savedVideoIds))
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())
  const router = useRouter()

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
    }

    setSavingIds(prev => {
      const next = new Set(prev)
      next.delete(video.id)
      return next
    })

    router.refresh()
  }

  useEffect(() => {
    const isNative =
      typeof window !== 'undefined' &&
      (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    setIsBrowser(!isNative)
  }, [])

  // Don't render on native apps
  if (!isBrowser) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Video className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Videos are available on the web version</p>
        <a
          href="https://patchpulse.app/videos"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary hover:underline"
        >
          Open in browser
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    )
  }

  const updateFilters = (type: VideoType | null) => {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    router.push(`/videos${params.toString() ? `?${params.toString()}` : ''}`)
  }

  // Get top videos by view count for hero carousel
  const heroVideos = [...trendingVideos]
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 6)

  const showHero = !selectedType && heroVideos.length > 0

  if (videos.length === 0 && trendingVideos.length === 0) {
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
      {/* Hero Carousel - Desktop only */}
      {showHero && (
        <div className="hidden md:block">
          <HeroCarousel videos={heroVideos} onPlay={setSelectedVideo} />
        </div>
      )}

      {/* Filter Chips - Sticky on mobile */}
      <div className="sticky top-0 z-30 -mx-4 px-4 py-3 bg-background/95 backdrop-blur-sm md:relative md:mx-0 md:px-0 md:py-0 md:bg-transparent md:backdrop-blur-none">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => updateFilters(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
              !selectedType
                ? 'bg-white text-black'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            All
          </button>

          {videoTypes
            .filter(({ type }) => ['trailer', 'clips', 'gameplay', 'esports'].includes(type))
            .map(({ type }) => {
              const config = TYPE_CONFIG[type]
              return (
                <button
                  key={type}
                  onClick={() => updateFilters(type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                    selectedType === type
                      ? 'bg-white text-black'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {config.label}
                </button>
              )
            })}
        </div>
      </div>

      {/* Mobile: YouTube-style vertical list */}
      <div className="md:hidden space-y-6">
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="animate-soft-entry"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <MobileVideoCard
              video={video}
              onPlay={() => setSelectedVideo(video)}
              isSaved={localSavedIds.has(video.id)}
              onSave={(e) => handleSave(video, e)}
            />
          </div>
        ))}
      </div>

      {/* Desktop: 2-column grid */}
      <div className="hidden md:grid md:grid-cols-2 gap-6">
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="animate-soft-entry"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <DesktopVideoCard
              video={video}
              onPlay={() => setSelectedVideo(video)}
              isSaved={localSavedIds.has(video.id)}
              onSave={(e) => handleSave(video, e)}
            />
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          youtubeId={selectedVideo.youtube_id}
          title={selectedVideo.title}
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  )
}
