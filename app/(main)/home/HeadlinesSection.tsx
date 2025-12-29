'use client'

import { useState, useEffect, useCallback } from 'react'
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
  games: {
    name: string
    slug: string
    cover_url: string | null
    logo_url?: string | null
    brand_color?: string | null
  } | null
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

// Rotating spotlight headline component
function RotatingHeadline({
  news,
  seasonalImages,
}: {
  news: NewsItem[]
  seasonalImages: Map<string, SeasonalImage>
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)

  const rotate = useCallback(() => {
    setIsAnimating(false)
    // Small delay to reset animation
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length)
      setIsAnimating(true)
    }, 50)
  }, [news.length])

  useEffect(() => {
    if (news.length <= 1) return
    const interval = setInterval(rotate, 10000)
    return () => clearInterval(interval)
  }, [news.length, rotate])

  if (news.length === 0) return null

  const item = news[currentIndex]
  const coverUrl = item.game_id
    ? getSeasonalCoverUrl(item.game_id, item.games?.cover_url, seasonalImages)
    : item.games?.cover_url
  const brandColor = item.games?.brand_color || '#3b82f6'

  return (
    <Link
      href={`/news/${item.id}`}
      className={`group relative block overflow-hidden rounded-xl border border-white/10 bg-black/40 mb-4 ${
        isAnimating ? 'animate-soft-entry' : 'opacity-0'
      }`}
    >
      <div className="relative aspect-[21/9] sm:aspect-[3/1]">
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center p-4 sm:p-6">
          <div className="max-w-xl">
            {/* Game badge */}
            <div className="flex items-center gap-2 mb-2">
              {item.games?.logo_url && (
                <div className="relative w-5 h-5 rounded overflow-hidden bg-white/10">
                  <SafeImage
                    src={item.games.logo_url}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="20px"
                  />
                </div>
              )}
              <span className="text-xs font-medium text-white/80">
                {item.games?.name || 'Gaming'}
              </span>
              <span className="text-white/40">·</span>
              <span className="text-xs text-white/60">{relativeDaysText(item.published_at)}</span>
              {item.is_rumor && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  RUMOR
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-base sm:text-lg font-bold text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {item.title}
            </h3>

            {/* Summary */}
            {item.summary && (
              <p className="text-sm text-white/60 mt-2 line-clamp-1 hidden sm:block">
                {item.summary}
              </p>
            )}
          </div>
        </div>

        {/* Progress dots */}
        {news.length > 1 && (
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {news.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault()
                  setIsAnimating(false)
                  setTimeout(() => {
                    setCurrentIndex(idx)
                    setIsAnimating(true)
                  }, 50)
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

export function HeadlinesSection({ news, seasonalImages, gamePlatforms }: HeadlinesSectionProps) {
  if (news.length === 0) return null

  return (
    <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-b from-zinc-900/50 to-transparent border-t border-b border-white/5">
      <div className="space-y-4">
        <SectionHeader title="Latest Headlines" href="/news" glowLine />

        {/* Rotating spotlight - cycles through top headlines every 10s */}
        <RotatingHeadline news={news.slice(0, 5)} seasonalImages={seasonalImages} />

        {/* Additional headlines list */}
        <div className="space-y-3">
          {news.slice(5, 8).map((newsItem, index) => (
            <div
              key={newsItem.id}
              className="animate-soft-entry"
              style={{ animationDelay: `${index * 50}ms` }}
            >
            <MediaCard
              href={`/news/${newsItem.id}`}
              title={newsItem.title}
              summary={newsItem.summary}
              whyItMatters={newsItem.why_it_matters}
              imageUrl={
                newsItem.game_id
                  ? getSeasonalCoverUrl(newsItem.game_id, newsItem.games?.cover_url, seasonalImages)
                  : newsItem.games?.cover_url
              }
              variant="horizontal"
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
                    newsItem.source_name,
                    formatDate(newsItem.published_at),
                  ]}
                  size="xs"
                />
              }
            />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
