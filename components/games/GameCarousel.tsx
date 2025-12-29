'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Gamepad2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSpotlight } from '@/components/games'
import { countdownBadge, releasedAgoText } from '@/lib/dates'
import type { UpcomingGame, NewReleaseGame } from '@/app/(main)/home/queries'

type GameCarouselProps = {
  games: (UpcomingGame | NewReleaseGame)[]
  type: 'upcoming' | 'new'
  autoSlide?: boolean
  autoSlideInterval?: number
}

export function GameCarousel({
  games,
  type,
  autoSlide = true,
  autoSlideInterval = 7000,
}: GameCarouselProps) {
  const { openSpotlight } = useSpotlight()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const isUpcoming = type === 'upcoming'

  // Check scroll position
  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)

    // Calculate active index based on scroll position
    // 140px card + 12px gap = 152px per card
    const cardWidth = 152
    const newIndex = Math.round(el.scrollLeft / cardWidth)
    setActiveIndex(Math.min(newIndex, games.length - 1))
  }, [games.length])

  // Auto-slide functionality (desktop only)
  useEffect(() => {
    if (!autoSlide || isPaused || games.length <= 3) return

    const interval = setInterval(() => {
      const el = scrollRef.current
      if (!el) return

      const cardWidth = 152 // 140px + 12px gap
      const maxScroll = el.scrollWidth - el.clientWidth

      if (el.scrollLeft >= maxScroll - 10) {
        // Reset to start
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        // Slide by one card
        el.scrollTo({ left: el.scrollLeft + cardWidth, behavior: 'smooth' })
      }
    }, autoSlideInterval)

    return () => clearInterval(interval)
  }, [autoSlide, autoSlideInterval, isPaused, games.length])

  // Update scroll state on mount and resize
  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = 152 // 140px + 12px gap
    const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  const handleClick = (game: UpcomingGame | NewReleaseGame) => {
    openSpotlight(
      {
        id: game.id,
        name: game.name,
        slug: game.slug,
        cover_url: game.cover_url,
        hero_url: game.hero_url,
        release_date: game.release_date,
        days_until: isUpcoming ? (game as UpcomingGame).days_until ?? undefined : undefined,
        days_since: !isUpcoming ? (game as NewReleaseGame).days_since : undefined,
        platforms: game.platforms,
        genre: game.genre,
        is_live_service: game.is_live_service,
      },
      type
    )
  }

  if (games.length === 0) return null

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
    >
      {/* Desktop navigation arrows */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/80 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 hover:bg-black hover:border-white/20"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/80 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2 hover:bg-black hover:border-white/20"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Scroll container - 12px gap, clean horizontal scroll */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide"
      >
        {games.map((game, index) => (
          <GameCard
            key={game.id}
            game={game}
            type={type}
            onClick={() => handleClick(game)}
            isActive={index === activeIndex}
          />
        ))}
        {/* Partial next card indicator */}
        <div className="snap-start shrink-0 w-4" aria-hidden />
      </div>

      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  )
}

type GameCardProps = {
  game: UpcomingGame | NewReleaseGame
  type: 'upcoming' | 'new'
  onClick: () => void
  isActive?: boolean
}

function GameCard({ game, type, onClick, isActive }: GameCardProps) {
  const isUpcoming = type === 'upcoming'

  // Time-based badge
  const timeBadge = isUpcoming
    ? countdownBadge(game.release_date)
    : `${(game as NewReleaseGame).days_since}d`

  const badgeColor = isUpcoming
    ? 'bg-indigo-500/90 text-white'
    : 'bg-emerald-500/90 text-white'

  // Live badge styling
  const isLive = game.is_live_service
  const isToday = timeBadge === 'TODAY' || timeBadge === 'OUT'

  return (
    <button
      onClick={onClick}
      className={`snap-start shrink-0 w-[140px] text-left transition-all duration-300 active:scale-[0.98] ${
        isActive ? 'scale-[1.02]' : ''
      }`}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 group/card">
        {/* Cover image */}
        {game.cover_url ? (
          <Image
            src={game.cover_url}
            alt={game.name}
            fill
            className="object-cover transition-transform duration-500 group-hover/card:scale-105"
            sizes="140px"
            loading="lazy"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <Gamepad2 className="w-8 h-8 text-zinc-700" />
          </div>
        )}

        {/* Gradient overlay - bottom 30% */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Brand color glow on active */}
        {isActive && (
          <div
            className="absolute inset-0 opacity-[0.08] transition-opacity"
            style={{
              background: `radial-gradient(ellipse at center, ${isUpcoming ? '#6366f1' : '#10b981'} 0%, transparent 70%)`,
            }}
          />
        )}

        {/* Time badge with glow effect */}
        <span
          className={`absolute top-2 left-2 text-[11px] px-2 py-0.5 rounded-full backdrop-blur-sm font-semibold ${badgeColor} ${
            isToday ? 'animate-pulse-soft glow-sm' : ''
          }`}
        >
          {timeBadge}
        </span>

        {/* Live service indicator */}
        {isLive && (
          <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded bg-red-500/90 text-white font-medium">
            LIVE
          </span>
        )}

        {/* Genre tag at bottom */}
        {game.genre && (
          <span className="absolute bottom-2 left-2 right-2 text-[10px] text-white/80 truncate">
            {game.genre}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-medium text-sm mt-2 leading-tight line-clamp-2 text-zinc-200">
        {game.name}
      </h3>

      {/* Release info text */}
      <p className="text-[11px] text-zinc-500 mt-0.5">
        {isUpcoming
          ? game.release_date
            ? new Date(game.release_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'TBA'
          : game.release_date
            ? releasedAgoText(game.release_date).replace('Released ', '')
            : 'Released'}
      </p>
    </button>
  )
}

// Mobile-optimized grid (keeps original 4-col layout for mobile)
export function GameCarouselMobile({
  games,
  type,
}: {
  games: (UpcomingGame | NewReleaseGame)[]
  type: 'upcoming' | 'new'
}) {
  const { openSpotlight } = useSpotlight()
  const isUpcoming = type === 'upcoming'

  const handleClick = (game: UpcomingGame | NewReleaseGame) => {
    openSpotlight(
      {
        id: game.id,
        name: game.name,
        slug: game.slug,
        cover_url: game.cover_url,
        hero_url: game.hero_url,
        release_date: game.release_date,
        days_until: isUpcoming ? (game as UpcomingGame).days_until ?? undefined : undefined,
        days_since: !isUpcoming ? (game as NewReleaseGame).days_since : undefined,
        platforms: game.platforms,
        genre: game.genre,
        is_live_service: game.is_live_service,
      },
      type
    )
  }

  if (games.length === 0) return null

  return (
    <div className="grid grid-cols-4 gap-2">
      {games.slice(0, 8).map((game) => {
        const timeBadge = isUpcoming
          ? countdownBadge(game.release_date)
          : `${(game as NewReleaseGame).days_since}d`

        const badgeColor = isUpcoming
          ? 'bg-indigo-500/90'
          : 'bg-emerald-500/90'

        return (
          <button
            key={game.id}
            onClick={() => handleClick(game)}
            className="active:scale-[0.97] transition-transform text-left"
          >
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900">
              {game.cover_url ? (
                <Image
                  src={game.cover_url}
                  alt={game.name}
                  fill
                  className="object-cover"
                  sizes="25vw"
                  loading="lazy"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                  <Gamepad2 className="w-4 h-4 text-zinc-700" />
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Time badge */}
              <span className={`absolute top-1 left-1 text-[8px] px-1.5 py-0.5 rounded-full backdrop-blur-sm font-semibold text-white ${badgeColor}`}>
                {timeBadge}
              </span>
            </div>

            <h3 className="font-medium text-[10px] mt-1 leading-tight line-clamp-1 text-zinc-300">
              {game.name}
            </h3>
          </button>
        )
      })}
    </div>
  )
}
