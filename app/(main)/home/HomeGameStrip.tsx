'use client'

import { GameCarousel, GameCarouselMobile } from '@/components/games'
import type { UpcomingGame, NewReleaseGame } from './queries'

type HomeGameStripProps = {
  games: (UpcomingGame | NewReleaseGame)[]
  type: 'upcoming' | 'new'
}

export function HomeGameStrip({ games, type }: HomeGameStripProps) {
  if (games.length === 0) return null

  return (
    <>
      {/* Mobile: 4-column grid (no horizontal scroll) */}
      <div className="sm:hidden">
        <GameCarouselMobile games={games} type={type} />
      </div>

      {/* Desktop: Horizontal scroll carousel with auto-slide */}
      <div className="hidden sm:block">
        <GameCarousel
          games={games}
          type={type}
          autoSlide={true}
          autoSlideInterval={7000}
        />
      </div>
    </>
  )
}
