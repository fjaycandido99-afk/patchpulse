'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Newspaper } from 'lucide-react'
import { MediaCard } from '@/components/media/MediaCard'
import { Badge } from '@/components/ui/badge'
import { MetaRow } from '@/components/ui/MetaRow'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { formatDate, relativeDaysText } from '@/lib/dates'
import type { SeasonalImage } from '@/lib/images/seasonal'
import type { Platform } from './queries'

// Safe image component with error handling
function SafeImage({
  src,
  alt,
  fill,
  className,
  sizes,
  priority,
}: {
  src: string
  alt: string
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
}) {
  const [error, setError] = useState(false)
  const handleError = useCallback(() => setError(true), [])

  if (error || !src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
        <Newspaper className="w-12 h-12 text-zinc-600" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={handleError}
      unoptimized
    />
  )
}

type NewsItem = {
  id: string
  game_id: string | null
  title: string
  published_at: string
  source_name: string | null
  source_url: string | null
  summary: string | null
  why_it_matters: string | null
  topics: string[]
  is_rumor: boolean
  image_url: string | null
  games: {
    name: string
    slug: string
    cover_url: string | null
    hero_url?: string | null
    logo_url?: string | null
    brand_color?: string | null
  } | null
}

// Get the best available image for a news item
function getNewsImage(item: NewsItem, seasonalImages: Map<string, SeasonalImage>): string | null {
  // 1. News article's own image (highest priority)
  if (item.image_url) return item.image_url

  // 2. Game's hero image
  if (item.games?.hero_url) return item.games.hero_url

  // 3. Seasonal cover (if applicable)
  if (item.game_id) {
    const seasonal = seasonalImages.get(item.game_id)
    if (seasonal?.isSeasonal && seasonal.coverUrl) {
      return seasonal.coverUrl
    }
  }

  // 4. Game's cover image
  if (item.games?.cover_url) return item.games.cover_url

  // 5. No image available
  return null
}

type HeadlinesSectionProps = {
  userNews: NewsItem[]  // News from user's followed/backlog games (for hero carousel)
  latestNews: NewsItem[]  // All news (for Latest Headlines grid)
  seasonalImages: Map<string, SeasonalImage>
  gamePlatforms: Map<string, Platform[]>
}

function getSeasonalCoverUrl(
  gameId: string,
  defaultCoverUrl: string | null | undefined,
  seasonalImages: Map<string, SeasonalImage>
): string | null {
  const seasonal = seasonalImages.get(gameId)
  if (seasonal?.isSeasonal && seasonal.coverUrl) {
    return seasonal.coverUrl
  }
  return defaultCoverUrl ?? null
}

function getSeasonalLogoUrl(
  gameId: string,
  defaultLogoUrl: string | null | undefined,
  seasonalImages: Map<string, SeasonalImage>
): string | null {
  const seasonal = seasonalImages.get(gameId)
  if (seasonal?.isSeasonal && seasonal.logoUrl) {
    return seasonal.logoUrl
  }
  return defaultLogoUrl ?? null
}

function getPlatformsForGame(gameId: string, platformMap: Map<string, Platform[]>): Platform[] {
  return platformMap.get(gameId) || []
}

// Rotating spotlight headline component with swipe support
function RotatingHeadline({
  news,
  seasonalImages,
}: {
  news: NewsItem[]
  seasonalImages: Map<string, SeasonalImage>
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animationKey, setAnimationKey] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % news.length)
    setAnimationKey((prev) => prev + 1)
  }, [news.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length)
    setAnimationKey((prev) => prev + 1)
  }, [news.length])

  // Handle swipe gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStartX.current || !touchEndX.current) return

    const diff = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swiped left → next
        goToNext()
      } else {
        // Swiped right → prev
        goToPrev()
      }
    }

    touchStartX.current = null
    touchEndX.current = null
  }, [goToNext, goToPrev])

  useEffect(() => {
    if (news.length <= 1) return
    const interval = setInterval(goToNext, 4000)
    return () => clearInterval(interval)
  }, [news.length, goToNext])

  if (news.length === 0) return null

  const item = news[currentIndex]
  // Use smart image fallback: image_url → hero → seasonal → cover
  const coverUrl = getNewsImage(item, seasonalImages)
  const brandColor = item.games?.brand_color || '#3b82f6'

  return (
    <div
      className="relative mb-4"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Link
        key={animationKey}
        href={`/news/${item.id}`}
        className="group relative block overflow-hidden rounded-xl border border-white/10 bg-black/40 animate-soft-entry"
        style={{ opacity: 1 }}
      >
      <div className="relative aspect-[16/10] sm:aspect-[21/9]">
        {/* Background image */}
        {coverUrl ? (
          <SafeImage
            src={coverUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="100vw"
            priority
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${brandColor}40 0%, ${brandColor}10 50%, #09090b 100%)`,
            }}
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex items-end p-3 sm:p-6">
          <div className="max-w-xl">
            {/* Game badge */}
            <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
              {item.games?.logo_url && (
                <div className="relative w-4 h-4 sm:w-5 sm:h-5 rounded overflow-hidden bg-white/10">
                  <SafeImage
                    src={item.games.logo_url}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="20px"
                  />
                </div>
              )}
              <span className="text-[11px] sm:text-xs font-medium text-white/80">
                {item.games?.name || 'Gaming'}
              </span>
              <span className="text-white/40">·</span>
              <span className="text-[11px] sm:text-xs text-white/60">{relativeDaysText(item.published_at)}</span>
              {item.is_rumor && (
                <span className="px-1 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  RUMOR
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-base sm:text-xl font-bold text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {item.title}
            </h3>

            {/* Summary - show on mobile too */}
            {item.summary && (
              <p className="text-xs sm:text-sm text-white/60 mt-1.5 sm:mt-2 line-clamp-2">
                {item.summary}
              </p>
            )}
          </div>
        </div>

        {/* Swipe hint - top right */}
        {news.length > 1 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] text-white/50 sm:hidden">
            <span>← swipe →</span>
          </div>
        )}
      </div>
      </Link>
    </div>
  )
}

// Rotating 3-card news grid with random swap animation
function NewsCardsGrid({
  news,
  seasonalImages,
}: {
  news: NewsItem[]
  seasonalImages: Map<string, SeasonalImage>
  gamePlatforms: Map<string, Platform[]>
}) {
  // Track which 3 news items are currently visible
  const [visibleIndices, setVisibleIndices] = useState<number[]>([0, 1, 2])
  // Track which slot is currently fading (for animation)
  const [fadingSlot, setFadingSlot] = useState<number | null>(null)

  // Auto-rotate: swap one random card every 5 seconds
  useEffect(() => {
    if (news.length <= 3) return // No rotation needed if we have 3 or fewer items

    const interval = setInterval(() => {
      // Pick a random slot to swap (0, 1, or 2)
      const slotToSwap = Math.floor(Math.random() * 3)

      // Start fade out
      setFadingSlot(slotToSwap)

      // After fade out, swap the item and fade in
      setTimeout(() => {
        setVisibleIndices(prev => {
          const usedIndices = new Set(prev)
          // Find unused indices
          const availableIndices = news
            .map((_, i) => i)
            .filter(i => !usedIndices.has(i))

          if (availableIndices.length === 0) {
            // All items shown, reset to beginning but with different order
            return [0, 1, 2].map(i => (prev[i] + 3) % news.length)
          }

          // Pick random available index
          const newIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
          const newIndices = [...prev]
          newIndices[slotToSwap] = newIndex
          return newIndices
        })
        setFadingSlot(null)
      }, 300) // Match the fade-out duration
    }, 5000)

    return () => clearInterval(interval)
  }, [news.length])

  // Get the actual news items to display
  const displayNews = visibleIndices.map(i => news[i]).filter(Boolean)

  return (
    <div className="grid grid-cols-1 gap-3">
      {displayNews.map((newsItem, slotIndex) => (
        <Link
          key={`${newsItem.id}-${slotIndex}`}
          href={`/news/${newsItem.id}`}
          className={`group block transition-opacity duration-300 ${
            fadingSlot === slotIndex ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ animationDelay: `${slotIndex * 80}ms` }}
        >
          {/* Thumbnail - 16:9, bleed on mobile only */}
          <div
            className="relative aspect-video overflow-hidden bg-zinc-900 -mx-4 md:mx-0 md:rounded-xl"
          >
            {getNewsImage(newsItem, seasonalImages) ? (
              <SafeImage
                src={getNewsImage(newsItem, seasonalImages)!}
                alt={newsItem.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 flex items-center justify-center">
                <Newspaper className="w-10 h-10 text-zinc-600" />
              </div>
            )}

            {/* News badge - top left */}
            <span className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/80">
              <Newspaper className="w-3 h-3 text-white" />
              <span className="text-[10px] font-medium text-white">News</span>
            </span>

          </div>

          {/* Info below with padding */}
          <div className="mt-2 px-1">
            <h3 className="text-sm font-medium line-clamp-2 leading-snug text-white">
              {newsItem.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {newsItem.games?.name || 'Gaming'} · {relativeDaysText(newsItem.published_at)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}

export function HeadlinesSection({ userNews, latestNews, seasonalImages, gamePlatforms }: HeadlinesSectionProps) {
  // Combine user news and latest news, prioritizing user news
  const allNews = [...userNews, ...latestNews.filter(n => !userNews.find(u => u.id === n.id))]

  if (allNews.length === 0) return null

  return (
    <section className="relative">
      <div className="space-y-3">
        <SectionHeader title="Latest News" href="/news" />

        {/* 3-card grid - same size as video cards */}
        <NewsCardsGrid
          news={allNews}
          seasonalImages={seasonalImages}
          gamePlatforms={gamePlatforms}
        />
      </div>
    </section>
  )
}
