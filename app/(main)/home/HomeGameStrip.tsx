'use client'

import { GameCarousel } from '@/components/games'
import type { UpcomingGame, NewReleaseGame } from './queries'

type HomeGameStripProps = {
  games: (UpcomingGame | NewReleaseGame)[]
  type: 'upcoming' | 'new'
}

export function HomeGameStrip({ games, type }: HomeGameStripProps) {
  if (games.length === 0) return null

  return (
    <div className="overflow-hidden">
      {/* Mobile: Horizontal scroll (no auto-slide) */}
      <div className="sm:hidden">
        <GameCarousel
          games={games}
          type={type}
          autoSlide={false}
        />
      </div>

      {/* Desktop: Horizontal scroll with auto-slide */}
      <div className="hidden sm:block">
        <GameCarousel
          games={games}
          type={type}
          autoSlide={true}
          autoSlideInterval={7000}
        />
      </div>
    </div>
  )
}
