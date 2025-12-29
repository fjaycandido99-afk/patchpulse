'use client'

import { useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
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
  autoPlay = true,
  autoPlayInterval = 7000
}: GameCarouselProps) {
  const { openSpotlight } = useSpotlight()
  const isUpcoming = type === 'upcoming'

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: games.length > 4,
      align: 'start',
      skipSnaps: false,
      dragFree: false,
      containScroll: 'trimSnaps',
    },
    autoPlay ? [
      Autoplay({
        delay: autoPlayInterval,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      })
    ] : []
  )

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

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex gap-3">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => handleClick(game)}
            className="flex-shrink-0 w-[calc(25%-9px)] sm:w-[140px] active:scale-[0.97] transition-transform text-left"
          >
            <div className="relative aspect-[2/3] rounded-lg sm:rounded-xl overflow-hidden bg-zinc-900">
              {game.cover_url ? (
                <Image
                  src={game.cover_url}
                  alt={game.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 25vw, 140px"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                  <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-700" />
                </div>
              )}

              {/* Days badge */}
              <span className={`absolute top-1 left-1 sm:top-2 sm:left-2 text-[9px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-full backdrop-blur-sm font-medium ${badgeColor}`}>
                {getDaysLabel(game)}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-medium leading-tight line-clamp-1 sm:line-clamp-2 text-zinc-200 text-[10px] sm:text-sm mt-1 sm:mt-2">
              {game.name}
            </h3>
          </button>
        ))}
      </div>
    </div>
  )
}
