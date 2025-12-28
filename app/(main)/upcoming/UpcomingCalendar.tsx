'use client'

import { useSpotlight } from '@/components/games'
import { ChevronRight } from 'lucide-react'
import type { CalendarMonth } from './queries'

type UpcomingCalendarProps = {
  calendar: CalendarMonth[]
}

export function UpcomingCalendar({ calendar }: UpcomingCalendarProps) {
  const { openSpotlight } = useSpotlight()

  return (
    <div className="space-y-6">
      {calendar.map((month) => (
        <div key={month.month}>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {month.month}
          </h3>
          <div className="space-y-2">
            {month.games.map((game) => (
              <button
                key={game.id}
                onClick={() => openSpotlight({
                  ...game,
                  days_until: game.days_until ?? undefined,
                }, 'upcoming')}
                className="w-full flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/50 hover:bg-card/80 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="w-16 text-sm font-medium text-primary">
                    {game.release_date
                      ? new Date(game.release_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'TBA'}
                  </span>
                  <span className="font-medium text-foreground">{game.name}</span>
                  {game.genre && (
                    <span className="hidden sm:inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {game.genre}
                    </span>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
