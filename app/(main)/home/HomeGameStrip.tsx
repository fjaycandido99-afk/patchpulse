'use client'

import { GameCarousel } from '@/components/games'
import type { UpcomingGame, NewReleaseGame } from './queries'

type HomeGameStripProps = {
  games: (UpcomingGame | NewReleaseGame)[]
  type: 'upcoming' | 'new'
}

export function HomeGameStrip({ games, type }: HomeGameStripProps) {
  if (games.length === 0) return null

  // Single-row horizontal carousel for both mobile and desktop
  return (
    <GameCarousel
      games={games}
      type={type}
      autoSlide={true}
      autoSlideInterval={7000}
    />
  )
}
