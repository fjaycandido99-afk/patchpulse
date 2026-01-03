import { cookies } from 'next/headers'
import { Suspense } from 'react'
import { getNewReleases, getReleaseCounts } from './queries'
import { EmptyGameState, GameGridWithSearch } from '@/components/games'
import { ReleasesFilters } from './ReleasesFilters'
import { Info, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { isGuestModeFromCookies } from '@/lib/guest'
import { getUserPlan } from '@/lib/subscriptions/limits'
import { redirect } from 'next/navigation'
import { ProUpgradeCTA } from '@/components/ui/ProUpgradeCTA'

type SearchParams = Promise<{
  days?: string
  platform?: string
}>

export const metadata = {
  title: 'New Releases | PatchPulse',
  description: 'Recently released games worth knowing about.',
}

export default async function ReleasesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const cookieStore = await cookies()
  const hasGuestCookie = isGuestModeFromCookies(cookieStore)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // User is only a guest if they have the cookie AND are not logged in
  const isGuest = !user && hasGuestCookie

  if (!user && !isGuest) {
    redirect('/login')
  }

  let isPro = false

  // For authenticated users, check their plan
  if (user) {
    const plan = await getUserPlan(user.id)
    isPro = plan === 'pro'
  }

  if (!isPro) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            New Releases
          </h1>
          <p className="mt-1 text-muted-foreground">
            Recently released games worth knowing about.
          </p>
        </header>

        <ProUpgradeCTA
          title="Unlock Full Releases"
          description="Get access to the complete catalog of new releases with filters and search."
          features={[
            'Browse all new releases from the past 30 days',
            'Filter by platform and time period',
            'Search through featured releases',
            'Track games worth knowing about',
          ]}
        />
      </div>
    )
  }

  const params = await searchParams
  const days = (parseInt(params.days || '30') as 7 | 14 | 30) || 30
  const platform = params.platform || 'all'

  const [releases, counts] = await Promise.all([
    getNewReleases({ days, platform, limit: 50 }),
    getReleaseCounts(),
  ])

  const hasGames = releases.all.length > 0
  const hasFeatured = releases.featured.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          New Releases
        </h1>
        <p className="mt-1 text-muted-foreground">
          Recently released games worth knowing about.
        </p>
      </header>

      {/* Featured New Releases */}
      {hasFeatured ? (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5 text-primary" />
            Featured Releases
          </h2>
          <GameGridWithSearch
            games={releases.featured.slice(0, 3).map((game) => ({
              id: game.id,
              name: game.name,
              slug: game.slug,
              cover_url: game.cover_url,
              hero_url: game.hero_url,
              release_date: game.release_date,
              days_since: game.days_since,
              genre: game.genre,
              is_live_service: game.is_live_service,
              platforms: game.platforms,
            }))}
            type="new"
            variant="featured"
            columns="featured"
            placeholder="Search featured..."
          />
        </section>
      ) : (
        <EmptyGameState
          type="releases"
          title="No new releases yet"
          description="We're tracking major new releases as they roll out. More coming soon."
        />
      )}

      {/* Filters + Grid */}
      {hasGames && (
        <section>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">Recently Released</h2>
            <Suspense fallback={null}>
              <ReleasesFilters
                currentDays={days}
                currentPlatform={platform}
                counts={counts}
              />
            </Suspense>
          </div>

          {releases.all.length > 0 ? (
            <GameGridWithSearch
              games={releases.all.map((game) => ({
                id: game.id,
                name: game.name,
                slug: game.slug,
                cover_url: game.cover_url,
                release_date: game.release_date,
                days_since: game.days_since,
                genre: game.genre,
                is_live_service: game.is_live_service,
                platforms: game.platforms,
              }))}
              type="new"
              placeholder="Search releases..."
              showGenreFilter
            />
          ) : (
            <div className="rounded-lg border border-dashed border-border py-12 text-center">
              <p className="text-muted-foreground">No games found for this filter.</p>
            </div>
          )}
        </section>
      )}

      {/* Why It Matters - Insight Card */}
      <section className="rounded-xl border border-border bg-card/50 p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Why Track New Releases?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              New releases often receive major balance patches, hotfixes, and early-meta shifts
              within the first few weeks. PatchPulse helps you track what actually changes after launch,
              so you can make informed decisions about when to dive in.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
