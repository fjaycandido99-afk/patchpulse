'use client'

import { useCallback, useState, useEffect } from 'react'
import Image from 'next/image'
import { Gamepad2 } from 'lucide-react'
import { useSpotlight } from '@/components/games'
import type { UpcomingGame, NewReleaseGame } from '@/app/(main)/home/queries'

type GameCarouselProps = {
  games: (UpcomingGame | NewReleaseGame)[]
  type: 'upcoming' | 'new'
  autoPlay?: boolean
  autoPlayInterval?: number
}

export function GameCarousel({
  games,
  type,
  autoPlayInterval = 2500,
}: GameCarouselProps) {
  const { openSpotlight } = useSpotlight()
  const isUpcoming = type === 'upcoming'
  const [startIndex, setStartIndex] = useState(0)
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null)

  const visibleCount = 4

  // Auto-rotate one game at a time
  useEffect(() => {
    if (games.length <= visibleCount) return

    const interval = setInterval(() => {
      // Animate the first position, then shift
      setAnimatingIndex(0)

      setTimeout(() => {
        setStartIndex((prev) => (prev + 1) % games.length)
        setAnimatingIndex(null)
      }, 300)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [games.length, autoPlayInterval])

  const handleClick = useCallback((game: UpcomingGame | NewReleaseGame) => {
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
  }, [openSpotlight, isUpcoming, type])

  if (games.length === 0) return null

  const getDaysLabel = (game: UpcomingGame | NewReleaseGame) => {
    if (isUpcoming) {
      const upcoming = game as UpcomingGame
      return upcoming.days_until !== null ? `${upcoming.days_until}d` : 'TBA'
    }
    return `${(game as NewReleaseGame).days_since}d`
  }

  const badgeColor = isUpcoming
    ? 'bg-indigo-500/80 text-white'
    : 'bg-emerald-500/80 text-white'

  // Get visible games
  const visibleGames = []
  for (let i = 0; i < Math.min(visibleCount, games.length); i++) {
    visibleGames.push({
      game: games[(startIndex + i) % games.length],
      isAnimating: animatingIndex === i
    })
  }

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {visibleGames.map(({ game, isAnimating }, idx) => (
        <button
          key={`${game.id}-${idx}`}
          onClick={() => handleClick(game)}
          className={`active:scale-[0.97] transition-all duration-300 text-left ${
            isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <div className="relative aspect-[2/3] rounded-lg sm:rounded-xl overflow-hidden bg-zinc-900">
            {game.cover_url ? (
              <>
                <Image
                  src={game.cover_url}
                  alt={game.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 25vw, 140px"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                <Gamepad2 className="w-5 h-5 sm:w-8 sm:h-8 text-zinc-700" />
              </div>
            )}

            {/* Days badge */}
            <span className={`absolute top-1 left-1 sm:top-2 sm:left-2 text-[8px] sm:text-[11px] px-1 sm:px-2 py-0.5 rounded-full backdrop-blur-sm font-medium ${badgeColor}`}>
              {getDaysLabel(game)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-medium leading-tight line-clamp-1 text-zinc-200 text-[9px] sm:text-sm mt-1 sm:mt-2">
            {game.name}
          </h3>
        </button>
      ))}
    </div>
  )
}
