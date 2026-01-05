import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { Calendar, Gamepad2, Monitor, RefreshCw, ShoppingCart, Heart, Plus, Clock, FileText, Newspaper, ChevronRight, Flame, Home } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSeasonalGameImage } from '@/lib/images/seasonal'
import { WhatsNew } from '@/components/backlog/WhatsNew'
import { relativeDaysText } from '@/lib/dates'
import { AddToBacklogButton } from '@/components/backlog/AddToBacklogButton'
import { StoreLinkButtons } from '@/components/ui/StoreLinkButtons'
import { SteamStats } from '@/components/library/SteamStats'
import { StudioInfoSection } from '@/components/games/StudioInfoSection'
import { SentimentPulse } from '@/components/ai/SentimentPulse'
import { BackButton } from '@/components/ui/BackButton'
import { HeroBanner } from '@/components/ui/HeroBanner'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Try by slug first
  let { data: game } = await supabase
    .from('games')
    .select('name')
    .eq('slug', slug)
    .single()

  // Fallback to ID
  if (!game) {
    const { data: byId } = await supabase
      .from('games')
      .select('name')
      .eq('id', slug)
      .single()
    game = byId
  }

  return {
    title: game ? `${game.name} | PatchPulse` : 'Game | PatchPulse',
  }
}

async function getGameBySlug(slug: string) {
  const supabase = await createClient()

  // First try by slug
  const { data } = await supabase
    .from('games')
    .select('id, name, slug, cover_url, hero_url, logo_url, brand_color, release_date, genre, is_live_service, platforms, steam_app_id, developer, publisher, studio_type, similar_games, developer_notable_games')
    .eq('slug', slug)
    .single()

  if (data) return data

  // Fallback: try by ID (for recommendation links that use game_id)
  const { data: byId } = await supabase
    .from('games')
    .select('id, name, slug, cover_url, hero_url, logo_url, brand_color, release_date, genre, is_live_service, platforms, steam_app_id, developer, publisher, studio_type, similar_games, developer_notable_games')
    .eq('id', slug)
    .single()

  return byId
}

async function getGameActivity(gameId: string) {
  const supabase = await createClient()

  const [patchesResult, newsResult, totalPatchesResult, totalNewsResult] = await Promise.all([
    supabase
      .from('patch_notes')
      .select('id, title, published_at, summary_tldr, impact_score')
      .eq('game_id', gameId)
      .order('published_at', { ascending: false })
      .limit(10),
    supabase
      .from('news_items')
      .select('id, title, published_at, summary')
      .eq('game_id', gameId)
      .order('published_at', { ascending: false })
      .limit(10),
    supabase
      .from('patch_notes')
      .select('id', { count: 'exact', head: true })
      .eq('game_id', gameId),
    supabase
      .from('news_items')
      .select('id', { count: 'exact', head: true })
      .eq('game_id', gameId),
  ])

  return {
    recentPatches: patchesResult.data || [],
    recentNews: newsResult.data || [],
    totalPatches: totalPatchesResult.count || 0,
    totalNews: totalNewsResult.count || 0,
  }
}

async function isInBacklog(gameId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { data } = await supabase
    .from('backlog_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  return !!data
}

function getHeroImage(game: { hero_url?: string | null; cover_url: string | null }, seasonal: { heroUrl: string | null; coverUrl: string | null }): string | null {
  return seasonal.heroUrl || seasonal.coverUrl || game.hero_url || game.cover_url
}

function WhatsNewSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-6 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-5 rounded bg-muted" />
        <div className="h-5 w-24 rounded bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>
    </div>
  )
}


function getImpactColor(score: number) {
  if (score >= 8) return 'text-red-400'
  if (score >= 6) return 'text-amber-400'
  if (score >= 4) return 'text-cyan-400'
  return 'text-zinc-400'
}

function getImpactBg(score: number) {
  if (score >= 8) return 'bg-red-500/20 border-red-500/30'
  if (score >= 6) return 'bg-amber-500/20 border-amber-500/30'
  if (score >= 4) return 'bg-cyan-500/20 border-cyan-500/30'
  return 'bg-zinc-500/20 border-zinc-500/30'
}

function PatchCard({
  id,
  title,
  date,
  summary,
  impactScore,
}: {
  id: string
  title: string
  date: string
  summary: string | null
  impactScore: number
}) {
  return (
    <Link
      href={`/patches/${id}`}
      className="group flex gap-3 p-3 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all"
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
        <FileText className="w-5 h-5 text-amber-400" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                {title}
              </p>
              {impactScore >= 8 && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-red-500/20 text-red-400">
                  <Flame className="w-2.5 h-2.5 fill-red-400" />
                  Major
                </span>
              )}
            </div>
          </div>
          <span className={`flex-shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded border ${getImpactBg(impactScore)} ${getImpactColor(impactScore)}`}>
            {impactScore}/10
          </span>
        </div>

        {summary && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {summary}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-muted-foreground">
            {relativeDaysText(date)}
          </span>
          <span className="flex items-center gap-0.5 text-[11px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            View
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function NewsCard({
  id,
  title,
  date,
  summary,
}: {
  id: string
  title: string
  date: string
  summary: string | null
}) {
  return (
    <Link
      href={`/news/${id}`}
      className="group flex gap-3 p-3 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all"
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
        <Newspaper className="w-5 h-5 text-emerald-400" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </p>

        {summary && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {summary}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-muted-foreground">
            {relativeDaysText(date)}
          </span>
          <span className="flex items-center gap-0.5 text-[11px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Read
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const game = await getGameBySlug(slug)

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
          <Gamepad2 className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Game Not Found</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          This game isn&apos;t in our database yet. It may have been recommended but hasn&apos;t been added to PatchPulse.
        </p>
        <div className="flex gap-3">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/patches"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 font-medium transition-colors"
          >
            Browse Patches
          </Link>
        </div>
      </div>
    )
  }

  const [seasonalImage, activity, inBacklog] = await Promise.all([
    getSeasonalGameImage(game.id),
    getGameActivity(game.id),
    isInBacklog(game.id),
  ])

  const bannerUrl = getHeroImage(game, seasonalImage)
  const brandColor = seasonalImage.brandColor || game.brand_color

  const hasPatches = activity.recentPatches.length > 0
  const hasNews = activity.recentNews.length > 0

  // Check if upcoming
  const isUpcoming = game.release_date && new Date(game.release_date) > new Date()

  // Check if new release (within last 30 days)
  const isNewRelease = game.release_date && (() => {
    const releaseDate = new Date(game.release_date)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const today = new Date()
    return releaseDate >= thirtyDaysAgo && releaseDate <= today
  })()

  // Format release date
  const formattedReleaseDate = game.release_date
    ? new Date(game.release_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  // Format platforms
  const platformsDisplay = game.platforms?.length > 0
    ? game.platforms.join(', ')
    : null

  return (
    <div className="relative overflow-x-hidden min-h-screen">
      <HeroBanner imageUrl={bannerUrl} altText={game.name} fallbackColor={brandColor || undefined} />

      <div className="relative z-10 pt-[140px] sm:pt-[180px] md:pt-[220px] lg:pt-[280px] space-y-6">
        {/* Back Link */}
        <div>
          <BackButton defaultHref="/home" defaultLabel="Back" />
        </div>

        {/* Game Header */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            {/* Cover Image */}
            <div className="relative w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden shadow-2xl ring-2 ring-white/10 flex-shrink-0">
              {game.cover_url ? (
                <Image
                  src={game.cover_url}
                  alt={game.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Gamepad2 className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Title and Badges */}
            <div className="min-w-0 flex-1">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {isUpcoming && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Calendar className="h-3 w-3" />
                    COMING SOON
                  </span>
                )}
                {isNewRelease && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    NEW RELEASE
                  </span>
                )}
                {game.is_live_service && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <RefreshCw className="h-3 w-3" />
                    Live Service
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight line-clamp-2">
                {game.name}
              </h1>

              {formattedReleaseDate && (
                <p className="text-sm text-muted-foreground mt-1">
                  {isUpcoming ? `Releases ${formattedReleaseDate}` : formattedReleaseDate}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Primary Actions - Wishlist or Buy */}
        <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">{isUpcoming ? 'Wishlist' : 'Get the Game'}</h2>
          </div>

          <StoreLinkButtons
            gameName={game.name}
            platforms={game.platforms || []}
            steamAppId={game.steam_app_id}
            showLabel={true}
            size="md"
          />

          {isUpcoming && (
            <p className="text-xs text-muted-foreground mt-3">
              Add to your wishlist to get notified when it releases
            </p>
          )}
        </div>

        {/* Add to Backlog */}
        {!inBacklog ? (
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-blue-500/10">
                <Plus className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Track this game</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add to your backlog to track progress, get patch alerts, and receive personalized recommendations.
                </p>
                <div className="mt-4">
                  <AddToBacklogButton gameId={game.id} gameName={game.name} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Link
            href={`/backlog/${game.id}`}
            className="block rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-6 hover:bg-emerald-500/15 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/20">
                <Heart className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-emerald-400">In your backlog</p>
                <p className="text-sm text-muted-foreground">Tap to view your progress and settings</p>
              </div>
            </div>
          </Link>
        )}

        {/* At a Glance Card */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="font-semibold mb-4">At a Glance</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {game.genre && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Gamepad2 className="h-3.5 w-3.5" />
                  Genre
                </div>
                <p className="text-sm font-medium">{game.genre}</p>
              </div>
            )}
            {platformsDisplay && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Monitor className="h-3.5 w-3.5" />
                  Platforms
                </div>
                <p className="text-sm font-medium">{platformsDisplay}</p>
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5" />
                Type
              </div>
              <p className="text-sm font-medium">
                {game.is_live_service ? 'Live Service' : 'Standard'}
              </p>
            </div>
            {formattedReleaseDate && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {isUpcoming ? 'Releases' : 'Released'}
                </div>
                <p className="text-sm font-medium">{formattedReleaseDate}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sentiment Pulse - Community Mood (Pro) */}
        <SentimentPulse gameId={game.id} />

        {/* Studio Info Section */}
        <StudioInfoSection
          developer={game.developer}
          publisher={game.publisher}
          studioType={game.studio_type as 'AAA' | 'AA' | 'indie' | null}
          genre={game.genre}
          similarGames={game.similar_games}
          developerNotableGames={game.developer_notable_games}
        />

        {/* Steam Stats Card - Player Count */}
        {game.steam_app_id && !isUpcoming && (
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="font-semibold mb-4">Steam Stats</h2>
            <SteamStats
              steamAppId={game.steam_app_id}
              showPlayerCount={true}
              layout="stacked"
            />
          </div>
        )}

        {/* AI Summary - What's New */}
        {!isUpcoming && (
          <Suspense fallback={<WhatsNewSkeleton />}>
            <WhatsNew gameId={game.id} />
          </Suspense>
        )}

        {/* Recent Patches Section */}
        {hasPatches && !isUpcoming && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-400" />
                <h2 className="font-semibold">Recent Patches</h2>
                <span className="text-xs text-muted-foreground">
                  {activity.totalPatches} {activity.totalPatches === 1 ? 'patch' : 'patches'}
                </span>
              </div>
              {activity.totalPatches > 5 && (
                <Link
                  href={`/patches?game=${game.slug}`}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            <div className="space-y-2">
              {activity.recentPatches.slice(0, 5).map((patch) => (
                <PatchCard
                  key={patch.id}
                  id={patch.id}
                  title={patch.title}
                  date={patch.published_at}
                  summary={patch.summary_tldr}
                  impactScore={patch.impact_score}
                />
              ))}
            </div>

            {activity.totalPatches > 5 && (
              <Link
                href={`/patches?game=${game.slug}`}
                className="block text-center py-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                View all {activity.totalPatches} patches
              </Link>
            )}
          </section>
        )}

        {/* Recent News Section */}
        {hasNews && !isUpcoming && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-emerald-400" />
                <h2 className="font-semibold">Related News</h2>
                <span className="text-xs text-muted-foreground">
                  {activity.totalNews} {activity.totalNews === 1 ? 'article' : 'articles'}
                </span>
              </div>
              {activity.totalNews > 5 && (
                <Link
                  href={`/news?game=${game.slug}`}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            <div className="space-y-2">
              {activity.recentNews.slice(0, 5).map((news) => (
                <NewsCard
                  key={news.id}
                  id={news.id}
                  title={news.title}
                  date={news.published_at}
                  summary={news.summary}
                />
              ))}
            </div>

            {activity.totalNews > 5 && (
              <Link
                href={`/news?game=${game.slug}`}
                className="block text-center py-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                View all {activity.totalNews} articles
              </Link>
            )}
          </section>
        )}

        {/* No Activity State */}
        {!hasPatches && !hasNews && !isUpcoming && (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
            <Clock className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No recent patches or news for this game.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Updates will appear here when available.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
