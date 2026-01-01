import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { ArrowLeft, FileText, Newspaper, Plus, Clock, RefreshCw, Calendar, Gamepad2, Monitor } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBacklogItem, getGameActivity, isFollowingGame } from '../queries'
import { getSeasonalGameImage } from '@/lib/images/seasonal'
import { WhatsNew } from '@/components/backlog/WhatsNew'
import { formatDate, relativeDaysText } from '@/lib/dates'
import { AddToBacklogButton } from '@/components/backlog/AddToBacklogButton'
import { StoreLinkButtons } from '@/components/ui/StoreLinkButtons'
import { SteamStats } from '@/components/library/SteamStats'
import { GameManagement } from '@/components/backlog/GameManagement'
import { StudioInfoSection } from '@/components/games/StudioInfoSection'
import { SentimentPulse } from '@/components/ai/SentimentPulse'

// Fix #3: Image source priority helper
function getHeroImage(game: { hero_url?: string | null; cover_url: string | null }, seasonal: { heroUrl: string | null; coverUrl: string | null }): string | null {
  // Priority: seasonal hero > seasonal cover > game hero > game cover
  return seasonal.heroUrl || seasonal.coverUrl || game.hero_url || game.cover_url
}

function getIconImage(game: { logo_url: string | null; cover_url: string | null }, seasonal: { logoUrl: string | null }): string | null {
  // Priority: seasonal logo > game logo > game cover (cropped)
  return seasonal.logoUrl || game.logo_url || game.cover_url
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
        <div className="h-4 w-1/2 rounded bg-muted" />
      </div>
    </div>
  )
}

async function getGame(gameId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('games')
    .select('id, name, slug, cover_url, hero_url, logo_url, brand_color, release_date, genre, is_live_service, platforms, steam_app_id, developer, publisher, studio_type, similar_games, developer_notable_games')
    .eq('id', gameId)
    .single()

  return data
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

// Fix #1: Game Banner Component - Full bleed hero, no edges visible
function GameBanner({
  imageUrl,
  gameName,
  isInBacklog,
  brandColor,
}: {
  imageUrl: string | null
  gameName: string
  isInBacklog: boolean
  brandColor?: string | null
}) {
  // Fallback gradient color based on brand or default
  const fallbackColor = brandColor || (isInBacklog ? '#1e3a5f' : '#1a1a2e')

  return (
    <div className="fixed inset-x-0 top-0 h-[320px] sm:h-[380px] lg:h-[440px] overflow-hidden -z-10">
      {imageUrl ? (
        <>
          <Image
            src={imageUrl}
            alt={gameName}
            fill
            className="object-cover object-top"
            sizes="100vw"
            priority
            unoptimized
          />
          {/* Gradient overlay - seamless fade to background */}
          <div
            className="absolute inset-0"
            style={{
              background: isInBacklog
                ? 'linear-gradient(to bottom, rgba(30,58,95,0.05) 0%, rgba(10,10,25,0.2) 40%, rgba(10,10,25,0.8) 80%, rgb(10,10,25) 100%)'
                : 'linear-gradient(to bottom, rgba(10,10,25,0.05) 0%, rgba(10,10,25,0.2) 40%, rgba(10,10,25,0.8) 80%, rgb(10,10,25) 100%)'
            }}
          />
          {/* Top gradient to blend with header */}
          <div
            className="absolute inset-x-0 top-0 h-20"
            style={{
              background: 'linear-gradient(to bottom, rgba(10,15,30,0.6) 0%, transparent 100%)'
            }}
          />
        </>
      ) : (
        // Fallback gradient when no image
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${fallbackColor} 0%, rgb(10,10,25) 100%)`
          }}
        />
      )}
    </div>
  )
}

// Fix #2: Game Icon Component - Always 44x44px, always visible, has fallback
function GameIcon({
  logoUrl,
  coverUrl,
  gameName,
  brandColor,
  isInBacklog,
}: {
  logoUrl: string | null
  coverUrl: string | null
  gameName: string
  brandColor: string | null
  isInBacklog: boolean
}) {
  const imageUrl = logoUrl || coverUrl
  // Blue glow for backlog, brand color or neutral for info hub
  const glowColor = isInBacklog ? '#3b82f6' : (brandColor || '#6366f1')
  const bgColor = brandColor || '#1b1f3a'

  return (
    <div
      className="relative flex-shrink-0 rounded-[10px] overflow-hidden ring-2 ring-white/10"
      style={{
        width: '44px',
        height: '44px',
        backgroundColor: bgColor,
        boxShadow: `0 0 20px ${glowColor}40, 0 0 40px ${glowColor}20`,
      }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={gameName}
          fill
          className={logoUrl ? 'object-contain p-1' : 'object-cover'}
          sizes="44px"
          unoptimized
        />
      ) : (
        // Fallback: Show first letter or controller icon
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          <Gamepad2 className="w-5 h-5 text-white/40" />
        </div>
      )}
    </div>
  )
}

// Timeline item for news briefing view
function TimelineItem({
  type,
  title,
  date,
  summary,
}: {
  type: 'patch' | 'news'
  title: string
  date: string
  summary: string | null
}) {
  const Icon = type === 'patch' ? FileText : Newspaper
  const iconColor = type === 'patch' ? 'text-amber-400' : 'text-emerald-400'

  return (
    <div className="flex gap-3 py-3 border-b border-border/50 last:border-0">
      <div className={`mt-0.5 ${iconColor}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium truncate">{title}</h4>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {relativeDaysText(date)}
          </span>
        </div>
        {summary && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {summary}
          </p>
        )}
      </div>
    </div>
  )
}

export default async function BacklogDetailPage({
  params,
}: {
  params: Promise<{ gameId: string }>
}) {
  const { gameId } = await params

  const [game, backlogItem, seasonalImage, activity, isFollowing] = await Promise.all([
    getGame(gameId),
    getBacklogItem(gameId),
    getSeasonalGameImage(gameId),
    getGameActivity(gameId),
    isFollowingGame(gameId),
  ])

  if (!game) {
    notFound()
  }

  // Simple check: is this game in the user's backlog?
  const isInBacklog = !!backlogItem

  // Fix #3: Use image source priority helpers
  const bannerUrl = getHeroImage(game, seasonalImage)
  const logoUrl = getIconImage(game, seasonalImage)
  const brandColor = seasonalImage.brandColor || game.brand_color

  // Combine patches and news into timeline for info hub view
  const timeline = [
    ...activity.recentPatches.map((p) => ({
      type: 'patch' as const,
      id: p.id,
      title: p.title,
      date: p.published_at,
      summary: p.summary_tldr,
    })),
    ...activity.recentNews.map((n) => ({
      type: 'news' as const,
      id: n.id,
      title: n.title,
      date: n.published_at,
      summary: n.summary,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const hasActivity = timeline.length > 0

  // ============================================
  // INFO HUB VIEW (not in backlog - news briefing style)
  // ============================================
  if (!isInBacklog) {
    // Check if this is a new release (within last 30 days)
    const isNewRelease = game.release_date && (() => {
      const releaseDate = new Date(game.release_date)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const today = new Date()
      return releaseDate >= thirtyDaysAgo && releaseDate <= today
    })()

    // Format release date
    const formattedReleaseDate = game.release_date
      ? new Date(game.release_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : null

    // Format platforms
    const platformsDisplay = game.platforms?.length > 0
      ? game.platforms.join(', ')
      : null

    return (
      // Fix #5: overflow-x-hidden prevents swipe hijacking
      <div className="relative overflow-x-hidden min-h-screen">
        <GameBanner imageUrl={bannerUrl} gameName={game.name} isInBacklog={false} brandColor={brandColor} />

        {/* Content pushed below hero with padding */}
        <div className="relative z-10 pt-[200px] sm:pt-[240px] lg:pt-[280px] space-y-6">
          {/* Back Link */}
          <div>
            <Link
              href="/backlog"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>

          {/* Game Title with Icon and Badges */}
          <div className="space-y-3">
            <div className="flex items-start gap-4">
              <GameIcon
                logoUrl={logoUrl}
                coverUrl={game.cover_url}
                gameName={game.name}
                brandColor={brandColor}
                isInBacklog={false}
              />
              <div className="min-w-0 flex-1">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {isNewRelease && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      NEW RELEASE
                    </span>
                  )}
                  {game.is_live_service && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      <RefreshCw className="h-3 w-3" />
                      Live Service
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
                  {game.name}
                </h1>
                {game.is_live_service && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Live service with ongoing content
                  </p>
                )}
              </div>
            </div>
          </div>

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
                    Released
                  </div>
                  <p className="text-sm font-medium">{formattedReleaseDate}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sentiment Pulse - Community Mood (Pro) */}
          <Suspense fallback={null}>
            <SentimentPulse gameId={gameId} />
          </Suspense>

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
          {game.steam_app_id && (
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
          <Suspense fallback={<WhatsNewSkeleton />}>
            <WhatsNew gameId={gameId} />
          </Suspense>

          {/* Activity Timeline */}
          {hasActivity ? (
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-semibold">Recent Activity</h2>
                <span className="ml-auto text-xs text-muted-foreground">
                  Last 90 days
                </span>
              </div>
              <div className="divide-y divide-border/50">
                {timeline.slice(0, 8).map((item) => (
                  <TimelineItem
                    key={`${item.type}-${item.id}`}
                    type={item.type}
                    title={item.title}
                    date={item.date}
                    summary={item.summary}
                  />
                ))}
              </div>
              {timeline.length > 8 && (
                <p className="text-xs text-muted-foreground mt-4">
                  +{timeline.length - 8} more updates
                </p>
              )}
            </div>
          ) : (
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

          {/* External Links */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <h2 className="font-semibold mb-3">Wishlist or Buy</h2>
            <StoreLinkButtons
              gameName={game.name}
              platforms={game.platforms || []}
              steamAppId={game.steam_app_id}
            />
          </div>

          {/* Add to Backlog CTA */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Plus className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Track your progress</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add to your backlog to track playtime, set goals, and get personalized recommendations.
                </p>
                <div className="mt-4">
                  <AddToBacklogButton gameId={gameId} gameName={game.name} />
                </div>
              </div>
            </div>
          </div>

          {/* Manage Game - For followed but not in backlog */}
          {isFollowing && (
            <GameManagement
              gameId={gameId}
              gameName={game.name}
              isInBacklog={false}
              isFollowing={true}
            />
          )}
        </div>
      </div>
    )
  }

  // ============================================
  // BACKLOG VIEW (in backlog - Steam library style)
  // ============================================
  return (
    // Fix #5: overflow-x-hidden prevents swipe hijacking
    <div className="relative overflow-x-hidden min-h-screen">
      <GameBanner imageUrl={bannerUrl} gameName={game.name} isInBacklog={true} brandColor={brandColor} />

      {/* Content pushed below hero with padding */}
      <div className="relative z-10 pt-[200px] sm:pt-[240px] lg:pt-[280px] space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/backlog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Backlog
          </Link>
        </div>

        {/* Steam Library Style Card - Fixed size, extends to edges on mobile */}
        <div className="-mx-1 sm:mx-0 rounded-xl border border-border bg-card/95 backdrop-blur-sm p-3 sm:p-4 overflow-hidden">
          <div className="flex gap-3 sm:gap-4">
            {/* Cover Image - Left Side - Fixed size */}
            <div className="relative w-20 sm:w-24 flex-shrink-0 aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
              {game.cover_url ? (
                <Image
                  src={game.cover_url}
                  alt={game.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Gamepad2 className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Right Side - Game Info - Compact */}
            <div className="flex-1 min-w-0 space-y-2 overflow-hidden">
              {/* Title */}
              <h1 className="text-lg sm:text-xl font-bold tracking-tight line-clamp-2">
                {game.name}
              </h1>

              {/* Steam Stats - Playtime, Last Played, Player Count */}
              {game.steam_app_id && (
                <SteamStats
                  steamAppId={game.steam_app_id}
                  steamStats={backlogItem.steamStats}
                  showPlayerCount={true}
                  layout="stacked"
                />
              )}

              {/* Progress Bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, backlogItem.progress))}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                  {backlogItem.progress}%
                </span>
              </div>

              {/* Latest Patch Info */}
              {backlogItem.latestPatch && (
                <div className="flex items-center gap-1 text-[11px] text-blue-400/80">
                  <FileText className="h-3 w-3 flex-shrink-0" />
                  <span className="font-medium">{relativeDaysText(backlogItem.latestPatch.published_at)}</span>
                  <span className="text-muted-foreground/50">·</span>
                  <span className="truncate text-muted-foreground/80">{backlogItem.latestPatch.title}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sentiment Pulse - Community Mood (Pro) */}
        <Suspense fallback={null}>
          <SentimentPulse gameId={gameId} />
        </Suspense>

        {/* Studio Info Section */}
        <StudioInfoSection
          developer={game.developer}
          publisher={game.publisher}
          studioType={game.studio_type as 'AAA' | 'AA' | 'indie' | null}
          genre={game.genre}
          similarGames={game.similar_games}
          developerNotableGames={game.developer_notable_games}
        />

        {/* AI Summary */}
        <Suspense fallback={<WhatsNewSkeleton />}>
          <WhatsNew gameId={gameId} />
        </Suspense>

        {/* Recent Patches */}
        {backlogItem.recentPatches.length > 0 && (
          <div className="rounded-xl border border-blue-500/20 bg-card p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-blue-400" />
              <h2 className="font-semibold">Recent Patches</h2>
              <span className="ml-auto text-xs text-muted-foreground">
                {backlogItem.recentPatches.length} patch{backlogItem.recentPatches.length !== 1 ? 'es' : ''}
              </span>
            </div>
            <div className="space-y-4">
              {backlogItem.recentPatches.map((patch, index) => (
                <div
                  key={patch.id}
                  className={index > 0 ? 'border-t border-border/50 pt-4' : ''}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm">{patch.title}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(patch.published_at)}
                    </span>
                  </div>
                  {patch.summary_tldr && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {patch.summary_tldr}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <Link
              href={`/patches?game=${backlogItem.game_id}`}
              className="inline-block mt-4 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all patches for this game
            </Link>
          </div>
        )}

        {/* Manage Game - Remove from backlog */}
        <GameManagement
          gameId={gameId}
          gameName={game.name}
          isInBacklog={true}
          isFollowing={isFollowing}
        />
      </div>
    </div>
  )
}
