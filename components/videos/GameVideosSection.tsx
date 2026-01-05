'use client'

import { useState, useEffect } from 'react'
import { Video, ChevronLeft, ChevronRight, Film, Gamepad2, Trophy, Clapperboard } from 'lucide-react'
import { VideoPlayer, VideoCard } from './VideoPlayer'

type VideoType = 'trailer' | 'clips' | 'gameplay' | 'esports' | 'review' | 'other'

type GameVideo = {
  id: string
  youtube_id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  channel_name: string | null
  video_type: VideoType
  published_at: string | null
  view_count: number
  duration_seconds: number
}

type GameVideosSectionProps = {
  gameId: string
  gameName: string
  videos: GameVideo[]
  className?: string
}

const TYPE_FILTERS: { type: VideoType | 'all'; label: string; icon: React.ReactNode }[] = [
  { type: 'all', label: 'All', icon: <Video className="w-4 h-4" /> },
  { type: 'trailer', label: 'Trailers', icon: <Film className="w-4 h-4" /> },
  { type: 'clips', label: 'Clips', icon: <Clapperboard className="w-4 h-4" /> },
  { type: 'gameplay', label: 'Gameplay', icon: <Gamepad2 className="w-4 h-4" /> },
  { type: 'esports', label: 'Esports', icon: <Trophy className="w-4 h-4" /> },
]

export function GameVideosSection({ gameId, gameName, videos, className = '' }: GameVideosSectionProps) {
  const [isBrowser, setIsBrowser] = useState(false)
  const [activeFilter, setActiveFilter] = useState<VideoType | 'all'>('all')
  const [selectedVideo, setSelectedVideo] = useState<GameVideo | null>(null)
  const [scrollPosition, setScrollPosition] = useState(0)

  // Check if we're in a browser (not Capacitor native app)
  useEffect(() => {
    const isNative = typeof window !== 'undefined' &&
      (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    setIsBrowser(!isNative)
  }, [])

  // Don't render on native apps or if no videos
  if (!isBrowser || videos.length === 0) {
    return null
  }

  const filteredVideos = activeFilter === 'all'
    ? videos
    : videos.filter(v => v.video_type === activeFilter)

  // Get available types from the videos we have
  const availableTypes = new Set(videos.map(v => v.video_type))

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById(`videos-scroll-${gameId}`)
    if (!container) return

    const scrollAmount = 320 // Card width + gap
    const newPosition = direction === 'left'
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount

    container.scrollTo({ left: newPosition, behavior: 'smooth' })
    setScrollPosition(newPosition)
  }

  return (
    <section className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Video className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Videos</h2>
          <span className="text-sm text-muted-foreground">({filteredVideos.length})</span>
        </div>

        {/* Scroll controls for larger screens */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg bg-card border border-border hover:bg-accent transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg bg-card border border-border hover:bg-accent transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Type filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {TYPE_FILTERS.map(({ type, label, icon }) => {
          // Only show filter if we have videos of that type (or it's "all")
          if (type !== 'all' && !availableTypes.has(type)) return null

          return (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeFilter === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {icon}
              {label}
            </button>
          )
        })}
      </div>

      {/* Video grid/carousel */}
      {filteredVideos.length > 0 ? (
        <div
          id={`videos-scroll-${gameId}`}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          onScroll={(e) => setScrollPosition((e.target as HTMLElement).scrollLeft)}
        >
          {filteredVideos.map((video) => (
            <div key={video.id} className="min-w-[280px] md:min-w-0 snap-start">
              <VideoCard
                youtubeId={video.youtube_id}
                title={video.title}
                thumbnailUrl={video.thumbnail_url}
                channelName={video.channel_name}
                viewCount={video.view_count}
                durationSeconds={video.duration_seconds}
                videoType={video.video_type}
                publishedAt={video.published_at}
                onPlay={() => setSelectedVideo(video)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No {activeFilter !== 'all' ? activeFilter : ''} videos found</p>
        </div>
      )}

      {/* Video player modal */}
      {selectedVideo && (
        <VideoPlayer
          youtubeId={selectedVideo.youtube_id}
          title={selectedVideo.title}
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </section>
  )
}

// Compact version for smaller spaces
export function GameVideosCompact({
  videos,
  onViewAll,
  className = ''
}: {
  videos: GameVideo[]
  onViewAll?: () => void
  className?: string
}) {
  const [isBrowser, setIsBrowser] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<GameVideo | null>(null)

  useEffect(() => {
    const isNative = typeof window !== 'undefined' &&
      (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    setIsBrowser(!isNative)
  }, [])

  if (!isBrowser || videos.length === 0) {
    return null
  }

  // Show first 3 videos
  const displayVideos = videos.slice(0, 3)

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-primary" />
          <h3 className="font-medium">Videos</h3>
        </div>
        {videos.length > 3 && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-primary hover:underline"
          >
            View all ({videos.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {displayVideos.map((video) => (
          <button
            key={video.id}
            onClick={() => setSelectedVideo(video)}
            className="group relative aspect-video rounded-lg overflow-hidden bg-zinc-800"
          >
            <img
              src={video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                <Video className="w-4 h-4 text-white" />
              </div>
            </div>
          </button>
        ))}
      </div>

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
