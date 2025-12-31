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
  news: NewsItem[]
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
    const interval = setInterval(goToNext, 10000)
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

// Rotating news grid with random fade animation
function RotatingNewsGrid({
  news,
  seasonalImages,
  gamePlatforms,
}: {
  news: NewsItem[]
  seasonalImages: Map<string, SeasonalImage>
  gamePlatforms: Map<string, Platform[]>
}) {
  const visibleCount = 6
  // Track which news items are shown in each of the 6 positions
  const [slots, setSlots] = useState(() =>
    news.slice(0, visibleCount).map((_, i) => i)
  )
  // Track which slot is currently transitioning
  const [fadingSlot, setFadingSlot] = useState<number | null>(null)

  // Auto-rotate one random slot at a time
  useEffect(() => {
    if (news.length <= visibleCount) return

    const interval = setInterval(() => {
      // Pick a random slot to change
      const slotToChange = Math.floor(Math.random() * visibleCount)

      // Start fade out
      setFadingSlot(slotToChange)

      // After fade out, update the news and fade in
      setTimeout(() => {
        setSlots(prev => {
          const newSlots = [...prev]
          // Pick a random news item that's not currently showing
          const currentNews = new Set(newSlots)
          let newNewsIndex = Math.floor(Math.random() * news.length)
          // Try to find a news item not currently visible
          let attempts = 0
          while (currentNews.has(newNewsIndex) && attempts < 10) {
            newNewsIndex = Math.floor(Math.random() * news.length)
            attempts++
          }
          newSlots[slotToChange] = newNewsIndex
          return newSlots
        })

        // Keep fading state for fade-in animation
        setTimeout(() => {
          setFadingSlot(null)
        }, 400)
      }, 400)
    }, 7000)

    return () => clearInterval(interval)
  }, [news.length])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {slots.map((newsIndex, slotIndex) => {
        const newsItem = news[newsIndex]
        if (!newsItem) return null
        const isFading = fadingSlot === slotIndex

        return (
          <div
            key={`slot-${slotIndex}`}
            style={{
              opacity: isFading ? 0 : 1,
              transform: isFading ? 'scale(0.95)' : 'scale(1)',
              transition: 'opacity 400ms ease-in-out, transform 400ms ease-in-out',
            }}
          >
            <MediaCard
              href={`/news/${newsItem.id}`}
              title={newsItem.title}
              summary={newsItem.summary}
              whyItMatters={newsItem.why_it_matters}
              imageUrl={getNewsImage(newsItem, seasonalImages)}
              variant="vertical"
              game={
                newsItem.game_id
                  ? {
                      name: newsItem.games?.name || 'General',
                      logoUrl: getSeasonalLogoUrl(newsItem.game_id, newsItem.games?.logo_url, seasonalImages),
                      platforms: getPlatformsForGame(newsItem.game_id, gamePlatforms),
                    }
                  : undefined
              }
              badges={
                <>
                  <Badge variant="news">News</Badge>
                  {newsItem.is_rumor && <Badge variant="rumor">Rumor</Badge>}
                </>
              }
              metaText={
                <MetaRow
                  items={[
                    newsItem.games?.name || 'General',
                    formatDate(newsItem.published_at),
                  ]}
                  size="xs"
                />
              }
            />
          </div>
        )
      })}
    </div>
  )
}

export function HeadlinesSection({ news, seasonalImages, gamePlatforms }: HeadlinesSectionProps) {
  if (news.length === 0) return null

  return (
    <section className="relative py-8 bg-gradient-to-b from-zinc-900/50 to-transparent border-t border-b border-white/5 w-full max-w-full overflow-hidden">
      <div className="space-y-4">
        <SectionHeader title="Latest Headlines" href="/news" glowLine />

        {/* Rotating spotlight - cycles through all headlines every 10s */}
        <RotatingHeadline news={news} seasonalImages={seasonalImages} />

        {/* Additional headlines - rotating grid with random fade animation */}
        {news.length > 3 && (
          <RotatingNewsGrid
            news={news.slice(3)}
            seasonalImages={seasonalImages}
            gamePlatforms={gamePlatforms}
          />
        )}
      </div>
    </section>
  )
}
