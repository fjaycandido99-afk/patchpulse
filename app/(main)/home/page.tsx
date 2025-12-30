import Link from 'next/link'
import Image from 'next/image'
import { Search, Sparkles, Gamepad2 } from 'lucide-react'
import { getPatchesList } from '../patches/queries'
import { getHomeFeed, type Platform, type UpcomingGame, type NewReleaseGame } from './queries'
import { getStalePlayingGames, getReturnSuggestions } from '../backlog/queries'
import type { SeasonalImage } from '@/lib/images/seasonal'
import { HeroCard } from '@/components/media/HeroCard'
import { HeroCarousel } from '@/components/media/HeroCarousel'
import { BacklogCard } from '@/components/backlog/BacklogCard'
import { StaleGamesPrompt } from '@/components/backlog/StaleGamesPrompt'
import { ReturnSuggestions } from '@/components/backlog/ReturnSuggestions'
import { Badge, ImpactBadge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { MetaRow } from '@/components/ui/MetaRow'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { formatDate, relativeDaysText } from '@/lib/dates'
import { InstallHint } from '@/components/ui/InstallHint'
import { InfinitePatchesGrid } from '@/components/patches/InfinitePatchesGrid'
import { HeadlinesSection } from './HeadlinesSection'
import { HomeGameStrip } from './HomeGameStrip'


// Helper to get platforms for a game
function getPlatformsForGame(gameId: string, platformMap: Map<string, Platform[]>): Platform[] {
  return platformMap.get(gameId) || []
}

// Helper to get seasonal-aware image URL
function getSeasonalCoverUrl(
  gameId: string,
  defaultCoverUrl: string | null | undefined,
  seasonalImages: Map<string, SeasonalImage>
): string | null {
  const seasonal = seasonalImages.get(gameId)
  if (seasonal?.isSeasonal && seasonal.coverUrl) {
    return seasonal.coverUrl
  }
  return defaultCoverUrl ?? null
}

// Helper to get seasonal-aware logo URL
function getSeasonalLogoUrl(
  gameId: string,
  defaultLogoUrl: string | null | undefined,
  seasonalImages: Map<string, SeasonalImage>
): string | null {
  const seasonal = seasonalImages.get(gameId)
  if (seasonal?.isSeasonal && seasonal.logoUrl) {
    return seasonal.logoUrl
  }
  return defaultLogoUrl ?? null
}

type AffectedSystem = 'map' | 'mobility' | 'weapons' | 'ranked' | 'casual' | 'balance' | 'ui' | 'performance' | 'social' | 'audio'

// Helper to infer affected systems from patch content
function inferAffectedSystems(patch: { title: string; summary_tldr?: string | null; tags?: string[] }): AffectedSystem[] {
  const text = `${patch.title} ${patch.summary_tldr || ''} ${(patch.tags || []).join(' ')}`.toLowerCase()
  const systems: AffectedSystem[] = []

  if (text.includes('map') || text.includes('zone') || text.includes('arena')) systems.push('map')
  if (text.includes('mobility') || text.includes('movement') || text.includes('speed')) systems.push('mobility')
  if (text.includes('weapon') || text.includes('gun') || text.includes('damage')) systems.push('weapons')
  if (text.includes('ranked') || text.includes('competitive')) systems.push('ranked')
  if (text.includes('balance') || text.includes('nerf') || text.includes('buff')) systems.push('balance')
  if (text.includes('ui') || text.includes('menu') || text.includes('interface')) systems.push('ui')
  if (text.includes('performance') || text.includes('fps') || text.includes('optimization')) systems.push('performance')

  if (systems.length === 0) systems.push('balance')
  return systems.slice(0, 5)
}

export default async function HomePage() {
  const [patchesResult, feed, staleGames, returnSuggestions] = await Promise.all([
    getPatchesList({ page: 1, followedOnly: true }),
    getHomeFeed(),
    getStalePlayingGames(14),
    getReturnSuggestions(),
  ])

  // Create hero items for carousel (top patches + news)
  const heroItems: Array<{ type: 'patch' | 'news'; data: any }> = []
  feed.topPatches.slice(0, 3).forEach((patch) => {
    heroItems.push({ type: 'patch', data: patch })
  })
  feed.latestNews.slice(0, 2).forEach((news) => {
    heroItems.push({ type: 'news', data: news })
  })

  return (
    <>
      <InstallHint />
      <div className="space-y-6 page-enter">
        {/* Mobile: Compact "For You" header */}
        <section className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-medium text-violet-300">For You</span>
          </div>
          <span className="text-[11px] text-zinc-500 hidden sm:inline">Based on games you follow</span>
        </section>

        {/* Mobile-First: Game Strips at Top */}
        {/* New Releases */}
        {feed.newReleases.length > 0 && (
          <section className="mt-4">
            <SectionHeader title="New Releases" href="/releases" />
            <div className="mt-3">
              <HomeGameStrip games={feed.newReleases} type="new" />
            </div>
          </section>
        )}

        {/* Coming Soon */}
        {feed.upcomingGames.length > 0 && (
          <section className="mt-4">
            <SectionHeader title="Coming Soon" href="/upcoming" />
            <div className="mt-3">
              <HomeGameStrip games={feed.upcomingGames} type="upcoming" />
            </div>
          </section>
        )}

        {/* Hero Carousel - Desktop only, mobile gets compact list */}
        {heroItems.length > 0 && (
          <>
            {/* Desktop: Full carousel */}
            <section className="hidden sm:block">
              <HeroCarousel autoPlayInterval={3000}>
                {heroItems.map((heroItem, index) => (
                  heroItem.type === 'patch' ? (
                    <HeroCard
                      key={`patch-${heroItem.data.id}`}
                      href={`/patches/${heroItem.data.id}`}
                      title={heroItem.data.title}
                      summary={heroItem.data.summary_tldr}
                      imageUrl={getSeasonalCoverUrl(heroItem.data.game_id, heroItem.data.games?.cover_url, feed.seasonalImages)}
                      fallbackTitle={heroItem.data.games?.name}
                      type="patch"
                      showActions={index === 0}
                      impactMeter={{
                        meta: heroItem.data.impact_score,
                        casual: Math.max(2, Math.round(heroItem.data.impact_score * 0.7)),
                      }}
                      affectedSystems={inferAffectedSystems(heroItem.data)}
                      game={{
                        name: heroItem.data.games?.name || 'Unknown Game',
                        logoUrl: getSeasonalLogoUrl(heroItem.data.game_id, heroItem.data.games?.logo_url, feed.seasonalImages),
                        platforms: getPlatformsForGame(heroItem.data.game_id, feed.gamePlatforms),
                      }}
                      badges={
                        <>
                          <Badge variant="patch" size="md">Patch</Badge>
                          <ImpactBadge score={heroItem.data.impact_score} size="md" />
                        </>
                      }
                      metaLeft={
                        <MetaRow
                          items={[
                            heroItem.data.games?.name,
                            formatDate(heroItem.data.published_at),
                          ]}
                          size="sm"
                        />
                      }
                    />
                  ) : (
                    <HeroCard
                      key={`news-${heroItem.data.id}`}
                      href={`/news/${heroItem.data.id}`}
                      title={heroItem.data.title}
                      summary={heroItem.data.summary}
                      imageUrl={heroItem.data.game_id ? getSeasonalCoverUrl(heroItem.data.game_id, heroItem.data.games?.cover_url, feed.seasonalImages) : heroItem.data.games?.cover_url}
                      fallbackTitle={heroItem.data.games?.name || 'Gaming News'}
                      type="news"
                      game={heroItem.data.game_id ? {
                        name: heroItem.data.games?.name || 'General',
                        logoUrl: getSeasonalLogoUrl(heroItem.data.game_id, heroItem.data.games?.logo_url, feed.seasonalImages),
                        platforms: getPlatformsForGame(heroItem.data.game_id, feed.gamePlatforms),
                      } : undefined}
                      badges={
                        <>
                          <Badge variant="news" size="md">News</Badge>
                          {heroItem.data.is_rumor && (
                            <Badge variant="rumor" size="md">Rumor</Badge>
                          )}
                        </>
                      }
                      metaLeft={
                        <MetaRow
                          items={[
                            heroItem.data.games?.name || 'General',
                            heroItem.data.source_name,
                            formatDate(heroItem.data.published_at),
                          ]}
                          size="sm"
                        />
                      }
                    />
                  )
                ))}
              </HeroCarousel>
            </section>

            {/* Mobile: Compact featured card */}
            <section className="sm:hidden">
              <MobileFeaturedCard item={heroItems[0]} seasonalImages={feed.seasonalImages} />
            </section>
          </>
        )}

        {/* Continue Playing - Important for mobile engagement */}
        {feed.backlogNudge && (
          <section className="space-y-3">
            <SectionHeader title="Continue Playing" href="/backlog" />
            <BacklogCard
              href={`/backlog/${feed.backlogNudge.game_id}`}
              title={feed.backlogNudge.games?.name || 'Unknown Game'}
              progress={feed.backlogNudge.progress}
              imageUrl={getSeasonalCoverUrl(feed.backlogNudge.game_id, feed.backlogNudge.games?.cover_url, feed.seasonalImages)}
              lastPlayedText={
                feed.backlogNudge.last_played_at
                  ? `Last played ${relativeDaysText(feed.backlogNudge.last_played_at)}`
                  : undefined
              }
            />
          </section>
        )}

        {/* Latest Headlines */}
        <HeadlinesSection
          news={feed.latestNews}
          seasonalImages={feed.seasonalImages}
          gamePlatforms={feed.gamePlatforms}
        />

        {/* Main Content + Sidebar Layout for Desktop */}
        <div className="lg:flex lg:gap-8">
          <div className="flex-1 space-y-6">
            {/* Patches Section - Shows only followed/backlog games */}
            <section className="space-y-3 sm:space-y-4">
              <SectionHeader title="Your Patches" glowLine />

              {patchesResult.items.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 sm:p-12 text-center">
                  <Search className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-base font-medium">No patches for your games</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Follow games to see their patches here. Tap the gamepad icon to see all latest patches.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {patchesResult.total} patch{patchesResult.total !== 1 ? 'es' : ''}
                  </p>

                  <InfinitePatchesGrid
                    initialPatches={patchesResult.items}
                    initialHasMore={patchesResult.hasMore}
                    initialPage={patchesResult.page}
                    filters={{ followedOnly: true }}
                  />
                </>
              )}
            </section>

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

// Mobile featured card - Compact hero replacement (matches MediaCard horizontal)
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
      className="group flex gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-2 active:scale-[0.98] transition-transform"
    >
      {/* Thumbnail - matches MediaCard horizontal (w-14 = 56px) */}
      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <Gamepad2 className="w-4 h-4 text-zinc-700" />
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
      <div className="flex flex-1 flex-col justify-center overflow-hidden min-w-0">
        <h3 className="text-sm font-medium leading-snug line-clamp-2 text-white group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-500 overflow-hidden">
          <span className="truncate max-w-[100px]">{gameName}</span>
          <span className="text-zinc-600">·</span>
          <span className="truncate">{formatDate(item.data.published_at)}</span>
        </div>
      </div>
    </Link>
  )
}

