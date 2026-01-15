import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, Gamepad2 } from 'lucide-react'
import { isGuestModeFromCookies } from '@/lib/guest'
import { createClient } from '@/lib/supabase/server'
import { getPatchesList } from '../patches/queries'
import { getHomeFeed } from './queries'
import { getRandomVideos } from '../videos/queries'
import { getStalePlayingGames, getReturnSuggestions } from '../backlog/queries'
import type { SeasonalImage } from '@/lib/images/seasonal'
import { StaleGamesPrompt } from '@/components/backlog/StaleGamesPrompt'
import { ReturnSuggestions } from '@/components/backlog/ReturnSuggestions'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { formatDate } from '@/lib/dates'
import { InstallHint } from '@/components/ui/InstallHint'
import { HeadlinesSection } from './HeadlinesSection'
import { HomeGameStrip } from './HomeGameStrip'
import { HomeVideosSection } from './HomeVideosSection'
import { CyclingPatches } from '@/components/home/CyclingPatches'

// Force dynamic rendering so videos shuffle on each refresh
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const cookieStore = await cookies()
  const hasGuestCookie = isGuestModeFromCookies(cookieStore)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // User is only a guest if they have the cookie AND are not logged in
  const isGuest = !user && hasGuestCookie

  // For guests, skip user-specific queries
  const [feed, staleGames, returnSuggestions, patchesResult, randomVideos] = await Promise.all([
    getHomeFeed(),
    isGuest ? [] : getStalePlayingGames(14),
    isGuest ? [] : getReturnSuggestions(),
    isGuest ? { items: [], total: 0 } : getPatchesList({ page: 1, followedOnly: true, pageSize: 18 }),
    getRandomVideos(30), // Fetch more for player, display 3 on page
  ])

  return (
    <>
      <InstallHint />
      <div className="space-y-6 page-enter w-full max-w-full">
        {/* Mobile: Compact "For You" header */}
        <section className="flex items-center gap-2 px-4 md:px-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-medium text-violet-300">{isGuest ? 'Discover' : 'For You'}</span>
          </div>
          <span className="text-[11px] text-zinc-500 hidden sm:inline">
            {isGuest ? 'Latest gaming updates' : 'Based on games you follow'}
          </span>
        </section>

        {/* Mobile-First: Game Strips at Top */}
        {/* New Releases */}
        {feed.newReleases.length > 0 && (
          <section className="mt-4">
            <div className="px-4 md:px-0">
              <SectionHeader title="New Releases" href="/releases" />
            </div>
            <div className="mt-3 px-4 md:px-0">
              <HomeGameStrip games={feed.newReleases} type="new" />
            </div>
          </section>
        )}

        {/* Coming Soon */}
        {feed.upcomingGames.length > 0 && (
          <section className="mt-4">
            <div className="px-4 md:px-0">
              <SectionHeader title="Coming Soon" href="/upcoming" />
            </div>
            <div className="mt-3 px-4 md:px-0">
              <HomeGameStrip games={feed.upcomingGames} type="upcoming" />
            </div>
          </section>
        )}

        {/* Latest Headlines */}
        <HeadlinesSection
          userNews={feed.userNews}
          latestNews={feed.latestNews}
          seasonalImages={feed.seasonalImages}
          gamePlatforms={feed.gamePlatforms}
        />

        {/* Random Videos - Fresh on every refresh */}
        <HomeVideosSection videos={randomVideos} />

        {/* Your Patches - Cycling through all patches */}
        {patchesResult.items.length > 0 && (
          <section className="space-y-4 px-4 md:px-0">
            <SectionHeader title="Your Patches" href="/patches?filter=your_patches" badge={patchesResult.total} glowLine />
            <CyclingPatches patches={patchesResult.items} visibleCount={6} cycleInterval={4000} />
          </section>
        )}

        {/* Main Content + Sidebar Layout for Desktop */}
        <div className="lg:flex lg:gap-8 px-4 md:px-0">
          <div className="flex-1 space-y-6">
            {/* AI Return Suggestions */}
            {returnSuggestions.length > 0 && (
              <section>
                <ReturnSuggestions suggestions={returnSuggestions} />
              </section>
            )}

            {/* Stale Games Prompt */}
            {staleGames.length > 0 && (
              <section>
                <StaleGamesPrompt staleGames={staleGames} />
              </section>
            )}

            {/* Mobile Release Radar */}
            <div className="lg:hidden">
              <ReleaseRadarSection releases={feed.upcomingReleases} />
            </div>
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-80 lg:flex-shrink-0">
            <div className="sticky top-6">
              <ReleaseRadarSection releases={feed.upcomingReleases} />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}

type ReleaseItem = {
  id: string
  title: string
  release_date: string | null
  release_type: string
  game: { name: string; slug: string; cover_url: string | null }
}

function ReleaseRadarSection({ releases }: { releases: ReleaseItem[] }) {
  if (releases.length === 0) return null

  return (
    <section className="space-y-3">
      <SectionHeader title="Release Radar" href="/news" />
      <Card variant="subtle" className="p-0 overflow-hidden">
        <div className="divide-y divide-border">
          {releases.map((item) => {
            const releaseDate = item.release_date ? new Date(item.release_date) : null
            const daysUntil = releaseDate ? Math.ceil((releaseDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null

            return (
              <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.game.name} {releaseDate && `• ${formatDate(releaseDate)}`}
                  </p>
                </div>
                {daysUntil !== null ? (
                  <Badge variant="upcoming" size="sm">
                    {daysUntil <= 0 ? 'Out Now' : daysUntil === 1 ? '1 day' : `${daysUntil} days`}
                  </Badge>
                ) : (
                  <Badge variant="secondary" size="sm">TBA</Badge>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </section>
  )
}

// Mobile featured card - Compact for mobile screens
function MobileFeaturedCard({
  item,
  seasonalImages
}: {
  item: { type: 'patch' | 'news'; data: any }
  seasonalImages: Map<string, SeasonalImage>
}) {
  const isPatch = item.type === 'patch'
  const href = isPatch ? `/patches/${item.data.id}` : `/news/${item.data.id}`
  const title = item.data.title
  const gameName = item.data.games?.name || 'Gaming'
  const imageUrl = item.data.game_id
    ? (seasonalImages.get(item.data.game_id)?.coverUrl || item.data.games?.cover_url)
    : item.data.games?.cover_url

  return (
    <Link
      href={href}
      className="group flex gap-2.5 p-2 rounded-xl border border-white/10 bg-white/5 active:scale-[0.98] transition-transform"
    >
      {/* Thumbnail - 64px compact */}
      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <Gamepad2 className="w-5 h-5 text-zinc-700" />
          </div>
        )}
        {/* Type badge */}
        <span className={`absolute top-0.5 left-0.5 px-1 py-0.5 rounded text-[8px] font-bold uppercase ${
          isPatch ? 'bg-blue-500/90 text-white' : 'bg-purple-500/90 text-white'
        }`}>
          {isPatch ? 'Patch' : 'News'}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center overflow-hidden">
        <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-500">
          <span className="truncate max-w-[80px]">{gameName}</span>
          <span className="text-zinc-600">·</span>
          <span>{formatDate(item.data.published_at)}</span>
        </div>
      </div>
    </Link>
  )
}

