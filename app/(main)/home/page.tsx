import Link from 'next/link'
import { Search, Sparkles } from 'lucide-react'
import { getPatchFiltersData, getPatchesList } from '../patches/queries'
import { getHomeFeed, type Platform } from './queries'
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

type SearchParams = {
  game?: string
  tag?: string
  importance?: string
  page?: string
}

function buildUrl(
  base: Record<string, string | undefined>,
  updates: Record<string, string | undefined>
): string {
  const params = new URLSearchParams()

  const merged = { ...base, ...updates }

  if (merged.game) params.set('game', merged.game)
  if (merged.tag) params.set('tag', merged.tag)
  if (merged.importance) params.set('importance', merged.importance)
  if (merged.page && merged.page !== '1') params.set('page', merged.page)

  const query = params.toString()
  return query ? `/home?${query}` : '/home'
}

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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const gameId = params.game
  const tag = params.tag
  const importance = params.importance as
    | 'major'
    | 'medium'
    | 'minor'
    | undefined
  const page = params.page ? parseInt(params.page, 10) : 1

  const [filtersData, patchesResult, feed, staleGames, returnSuggestions] = await Promise.all([
    getPatchFiltersData(),
    getPatchesList({
      gameId,
      tag,
      importance:
        importance && ['major', 'medium', 'minor'].includes(importance)
          ? importance
          : undefined,
      page,
    }),
    getHomeFeed(),
    getStalePlayingGames(14),
    getReturnSuggestions(),
  ])

  const currentFilters = {
    game: gameId,
    tag: tag,
    importance: importance,
    page: undefined,
  }

  const hasFilters = gameId || tag || importance

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
      <div className="space-y-6 sm:space-y-8 page-enter">
        {/* For You Section - Personalized header */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">For You</span>
            </div>
            <span className="text-xs text-zinc-500">Based on games you follow</span>
          </div>
        </section>

        {/* Hero Carousel */}
        {heroItems.length > 0 && (
          <section>
            <HeroCarousel autoPlayInterval={6000}>
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
        )}

        {/* Main Content + Sidebar Layout */}
        <div className="lg:flex lg:gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6 sm:space-y-8">
            {/* Patches Section with Filters */}
            <section className="space-y-4">
              <SectionHeader title="All Patches" glowLine />

              {/* Filters */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <div className="relative">
                    <select
                      defaultValue={gameId || ''}
                      className="appearance-none rounded-lg border border-input bg-background px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">All Games</option>
                      {filtersData.followedGames.map((game) => (
                        <option key={game.id} value={game.id}>
                          {game.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <select
                      defaultValue={tag || ''}
                      className="appearance-none rounded-lg border border-input bg-background px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">All Tags</option>
                      {filtersData.availableTags.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <select
                      defaultValue={importance || ''}
                      className="appearance-none rounded-lg border border-input bg-background px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">All Importance</option>
                      <option value="major">Major (8-10)</option>
                      <option value="medium">Medium (5-7)</option>
                      <option value="minor">Minor (1-4)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {hasFilters && (
                    <Link
                      href="/home"
                      className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear filters
                    </Link>
                  )}
                </div>

                {/* Quick game filter chips */}
                <div className="flex flex-wrap gap-2">
                  {filtersData.followedGames.map((game) => (
                    <Link
                      key={game.id}
                      href={buildUrl(currentFilters, {
                        game: gameId === game.id ? undefined : game.id,
                      })}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                        gameId === game.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-input bg-background hover:bg-accent'
                      }`}
                    >
                      {game.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Patches Grid with Infinite Scroll */}
              {patchesResult.items.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No patches found</p>
                  <p className="mt-1 text-muted-foreground">
                    {hasFilters ? 'Try adjusting your filters' : 'Follow some games to see their patches here'}
                  </p>
                  {hasFilters && (
                    <Link href="/home" className="mt-4 inline-block text-sm text-primary hover:underline">
                      Clear all filters
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {patchesResult.total} patch{patchesResult.total !== 1 ? 'es' : ''}
                    {hasFilters && ' (filtered)'}
                  </p>

                  <InfinitePatchesGrid
                    initialPatches={patchesResult.items}
                    initialHasMore={patchesResult.hasMore}
                    initialPage={patchesResult.page}
                    filters={{
                      gameId,
                      tag,
                      importance,
                    }}
                  />
                </>
              )}
            </section>

            {/* Latest Headlines - with contrasting background */}
            <HeadlinesSection
              news={feed.latestNews}
              seasonalImages={feed.seasonalImages}
              gamePlatforms={feed.gamePlatforms}
            />

            {/* Continue Playing */}
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

          {/* Sidebar */}
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
