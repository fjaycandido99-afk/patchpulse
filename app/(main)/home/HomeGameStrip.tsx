'use client'

import Image from 'next/image'
import { Gamepad2 } from 'lucide-react'
import { useSpotlight } from '@/components/games'
import type { UpcomingGame, NewReleaseGame } from './queries'

type HomeGameStripProps = {
  games: (UpcomingGame | NewReleaseGame)[]
  type: 'upcoming' | 'new'
}

export function HomeGameStrip({ games, type }: HomeGameStripProps) {
  const { openSpotlight } = useSpotlight()

  if (games.length === 0) return null

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

  const renderGameCard = (game: UpcomingGame | NewReleaseGame, isMobile: boolean) => {
    const daysLabel = isUpcoming
      ? (game as UpcomingGame).days_until !== null
        ? `${(game as UpcomingGame).days_until}d`
        : 'TBA'
      : `${(game as NewReleaseGame).days_since}d`

    const badgeColor = isUpcoming
      ? 'bg-indigo-500/80 text-white'
      : 'bg-emerald-500/80 text-white'

    return (
      <button
        key={game.id}
        onClick={() => handleClick(game)}
        className={isMobile
          ? "active:scale-[0.97] transition-transform text-left"
          : "snap-start shrink-0 w-[140px] active:scale-[0.97] transition-transform text-left"
        }
      >
        <div className={`relative ${isMobile ? 'aspect-[2/3]' : 'aspect-[2/3]'} rounded-lg sm:rounded-xl overflow-hidden bg-zinc-900`}>
          {game.cover_url ? (
            <Image
              src={game.cover_url}
              alt={game.name}
              fill
              className="object-cover"
              sizes={isMobile ? "25vw" : "140px"}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
              <Gamepad2 className={isMobile ? "w-4 h-4 text-zinc-700" : "w-8 h-8 text-zinc-700"} />
            </div>
          )}

          {/* Countdown badge */}
          <span className={`absolute top-0.5 left-0.5 sm:top-2 sm:left-2 text-[7px] sm:text-[11px] px-1 sm:px-2 py-0.5 rounded-full backdrop-blur-sm font-medium ${badgeColor}`}>
            {daysLabel}
          </span>
        </div>

        {/* Title */}
        <h3 className={`font-medium leading-tight line-clamp-1 text-zinc-200 ${isMobile ? 'text-[9px] mt-0.5' : 'text-sm mt-2 line-clamp-2'}`}>
          {game.name}
        </h3>
      </button>
    )
  }

  return (
    <>
      {/* Mobile: 4-column grid - no horizontal scroll, smaller cards */}
      <div className="sm:hidden grid grid-cols-4 gap-1.5">
        {games.slice(0, 8).map((game) => renderGameCard(game, true))}
      </div>

      {/* Desktop: Horizontal scroll */}
      <div className="hidden sm:block">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
          {games.map((game) => renderGameCard(game, false))}
        </div>
      </div>
    </>
  )
}
