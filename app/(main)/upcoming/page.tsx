import { getUpcomingGames, getUpcomingCounts } from './queries'
import { EmptyGameState, GameGridWithSearch } from '@/components/games'
import { Calendar, Sparkles } from 'lucide-react'
import { UpcomingCalendar } from './UpcomingCalendar'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/subscriptions/limits'
import { redirect } from 'next/navigation'
import { ProUpgradeCTA } from '@/components/ui/ProUpgradeCTA'

export const metadata = {
  title: 'Upcoming Games | PatchPulse',
  description: 'Games launching soon — without the hype.',
}

export default async function UpcomingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const plan = await getUserPlan(user.id)
  const isPro = plan === 'pro'

  if (!isPro) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Upcoming Games
          </h1>
          <p className="mt-1 text-muted-foreground">
            Games launching soon — without the hype.
          </p>
        </header>

        <ProUpgradeCTA
          title="Unlock Upcoming Games"
          description="Get access to the full release calendar with anticipated games and launch dates."
          features={[
            'View all games releasing in the next year',
            'See the most anticipated titles',
            'Full release calendar view',
            'Track launch dates for games you care about',
          ]}
        />
      </div>
    )
  }

  const [upcoming, counts] = await Promise.all([
    getUpcomingGames({ days: 365, limit: 100 }),
    getUpcomingCounts(),
  ])

  const hasGames = upcoming.comingSoon.length > 0 || upcoming.anticipated.length > 0
  const hasCalendar = upcoming.calendar.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Upcoming Games
        </h1>
        <p className="mt-1 text-muted-foreground">
          Games launching soon — without the hype.
        </p>
      </header>

      {/* Quick stats */}
      {hasGames && (
        <div className="flex flex-wrap gap-4">
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-2xl font-bold text-primary">{counts.next30}</p>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-2xl font-bold text-foreground">{counts.next90}</p>
            <p className="text-xs text-muted-foreground">Next 90 days</p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-2xl font-bold text-foreground">{counts.thisYear}</p>
            <p className="text-xs text-muted-foreground">This year</p>
          </div>
        </div>
      )}

      {/* Coming Soon - Next 30 Days */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Calendar className="h-5 w-5 text-primary" />
          Coming Soon
          <span className="text-sm font-normal text-muted-foreground">
            (Next 30 days)
          </span>
        </h2>

        {upcoming.comingSoon.length > 0 ? (
          <GameGridWithSearch
            games={upcoming.comingSoon.map((game) => ({
              id: game.id,
              name: game.name,
              slug: game.slug,
              cover_url: game.cover_url,
              hero_url: game.hero_url,
              release_date: game.release_date,
              days_until: game.days_until ?? undefined,
              genre: game.genre,
              is_live_service: game.is_live_service,
              platforms: game.platforms,
            }))}
            type="upcoming"
            placeholder="Search coming soon..."
            showGenreFilter
          />
        ) : (
          <EmptyGameState
            type="upcoming"
            title="No games releasing soon"
            description="Major upcoming releases will appear here 14–30 days before launch."
          />
        )}
      </section>

      {/* Most Anticipated */}
      {upcoming.anticipated.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-5 w-5 text-amber-400" />
            Most Anticipated
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Based on player interest and community activity
          </p>

          <GameGridWithSearch
            games={upcoming.anticipated.slice(0, 6).map((game) => ({
              id: game.id,
              name: game.name,
              slug: game.slug,
              cover_url: game.cover_url,
              hero_url: game.hero_url,
              release_date: game.release_date,
              days_until: game.days_until ?? undefined,
              genre: game.genre,
              is_live_service: game.is_live_service,
              platforms: game.platforms,
            }))}
            type="upcoming"
            variant="featured"
            columns="featured"
            placeholder="Search anticipated..."
          />
        </section>
      )}

      {/* Release Calendar */}
      {hasCalendar && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Release Calendar
          </h2>

          <UpcomingCalendar calendar={upcoming.calendar} />
        </section>
      )}

      {/* Empty state if no games at all */}
      {!hasGames && !hasCalendar && (
        <EmptyGameState type="upcoming" />
      )}
    </div>
  )
}
