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
    <GameCarousel
      games={games}
      type={type}
      autoPlay={true}
      autoPlayInterval={5000}
    />
  )
}
