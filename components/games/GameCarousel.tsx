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
  autoPlayInterval = 3000,
}: GameCarouselProps) {
  const { openSpotlight } = useSpotlight()
  const isUpcoming = type === 'upcoming'

  // Track which games are shown in each position (4 mobile, 6 desktop)
  const [slots, setSlots] = useState([0, 1, 2, 3, 4, 5])
  // Track which slot is currently transitioning
  const [fadingSlot, setFadingSlot] = useState<number | null>(null)

  const visibleCount = 6

  // Auto-rotate one random slot at a time
  useEffect(() => {
    if (games.length <= visibleCount) return

    const interval = setInterval(() => {
      // Pick a random slot to change
      const slotToChange = Math.floor(Math.random() * visibleCount)

      // Start fade out
      setFadingSlot(slotToChange)

      // After fade out, update the game and fade in
      setTimeout(() => {
        setSlots(prev => {
          const newSlots = [...prev]
          // Pick a random game that's not currently showing
          const currentGames = new Set(newSlots)
          let newGameIndex = Math.floor(Math.random() * games.length)
          // Try to find a game not currently visible
          let attempts = 0
          while (currentGames.has(newGameIndex) && attempts < 10) {
            newGameIndex = Math.floor(Math.random() * games.length)
            attempts++
          }
          newSlots[slotToChange] = newGameIndex
          return newSlots
        })

        // Keep fading state for fade-in animation
        setTimeout(() => {
          setFadingSlot(null)
        }, 400)
      }, 400)
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

  return (
    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-5 gap-2 md:gap-4 lg:gap-6">
      {slots.map((gameIndex, slotIndex) => {
        const game = games[gameIndex % games.length]
        const isFading = fadingSlot === slotIndex

        // Hide slots 4 and 5 on mobile (only show on md+), hide slot 5 on lg (5 columns)
        const isDesktopOnly = slotIndex >= 4
        const isExtraSlot = slotIndex >= 5

        return (
          <button
            key={`slot-${slotIndex}`}
            onClick={() => handleClick(game)}
            className={`active:scale-[0.97] text-left ${isDesktopOnly ? 'hidden md:block' : ''} ${isExtraSlot ? 'lg:hidden' : ''}`}
            style={{
              opacity: isFading ? 0 : 1,
              transform: isFading ? 'scale(0.95)' : 'scale(1)',
              transition: 'opacity 400ms ease-in-out, transform 400ms ease-in-out',
            }}
          >
            <div className="relative aspect-[2/3] rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden bg-zinc-900">
              {game.cover_url ? (
                <>
                  <Image
                    src={game.cover_url}
                    alt={game.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 25vw, (max-width: 1024px) 140px, 200px"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                  <Gamepad2 className="w-5 h-5 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-zinc-700" />
                </div>
              )}

              {/* Days badge */}
              <span className={`absolute top-1 left-1 sm:top-2 sm:left-2 lg:top-3 lg:left-3 text-[8px] sm:text-[11px] lg:text-xs px-1 sm:px-2 lg:px-2.5 py-0.5 lg:py-1 rounded-full backdrop-blur-sm font-medium ${badgeColor}`}>
                {getDaysLabel(game)}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-medium leading-tight line-clamp-1 text-zinc-200 text-[9px] sm:text-sm lg:text-base mt-1 sm:mt-2 lg:mt-3">
              {game.name}
            </h3>
          </button>
        )
      })}
    </div>
  )
}
