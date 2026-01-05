import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { FileText, RefreshCw, Gamepad2, Home, ArrowLeft, Plus, Play, Pause, Clock, Check, X, Calendar, Monitor, Newspaper, ChevronRight, Flame } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { relativeDaysText } from '@/lib/dates'
import { AddToBacklogButton } from '@/components/backlog/AddToBacklogButton'
import { StoreLinkButtons } from '@/components/ui/StoreLinkButtons'
import { PlayNowButton } from '@/components/ui/PlayNowButton'
import { SteamStats } from '@/components/library/SteamStats'
import { GameManagement } from '@/components/backlog/GameManagement'
import { BackButton } from '@/components/ui/BackButton'
import { StudioInfoSection } from '@/components/games/StudioInfoSection'
import { SentimentPulse } from '@/components/ai/SentimentPulse'
import { WhatsNew } from '@/components/backlog/WhatsNew'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'

// Get game data (using admin client to bypass RLS)
async function getGame(gameId: string) {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('games')
      .select('id, name, slug, cover_url, hero_url, brand_color, release_date, genre, is_live_service, platforms, steam_app_id, developer, publisher, studio_type, similar_games, developer_notable_games')
      .eq('id', gameId)
      .single()

    if (error) return null
    return data
  } catch {
    return null
  }
}

// Get backlog item for this game
async function getBacklogItem(gameId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
      .from('backlog_items')
      .select('id, status, progress, next_note, last_played_at')
      .eq('user_id', user.id)
      .eq('game_id', gameId)
      .single()
    return data
  } catch {
    return null
  }
}

// Get recent patches for this game
async function getRecentPatches(gameId: string) {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('patch_notes')
      .select('id, title, published_at, summary_tldr, impact_score')
      .eq('game_id', gameId)
      .order('published_at', { ascending: false })
      .limit(5)
    return data || []
  } catch {
    return []
  }
}

// Get recent news for this game
async function getRecentNews(gameId: string) {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('news_items')
      .select('id, title, published_at, summary')
      .eq('game_id', gameId)
      .order('published_at', { ascending: false })
      .limit(5)
    return data || []
  } catch {
    return []
  }
}

// Check if user is following this game
async function isFollowingGame(gameId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data } = await supabase
      .from('user_games')
      .select('id')
      .eq('user_id', user.id)
      .eq('game_id', gameId)
      .single()
    return !!data
  } catch {
    return false
  }
}

// Impact score colors
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

// WhatsNew skeleton
function WhatsNewSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 animate-pulse">
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

// Game banner component
function GameBanner({ imageUrl, gameName, brandColor }: { imageUrl: string | null; gameName: string; brandColor?: string | null }) {
  return (
    <div className="fixed inset-x-0 top-0 h-[280px] sm:h-[340px] overflow-hidden -z-10">
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-background" />
        </>
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-b from-primary/20 to-background"
          style={brandColor ? { background: `linear-gradient(to bottom, ${brandColor}33, var(--background))` } : undefined}
        />
      )}
    </div>
  )
}

// Status badge component
const STATUS_CONFIG = {
  playing: { icon: Play, label: 'Playing', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  paused: { icon: Pause, label: 'Paused', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  backlog: { icon: Clock, label: 'Backlog', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  finished: { icon: Check, label: 'Finished', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  dropped: { icon: X, label: 'Dropped', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.backlog
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

export default async function BacklogDetailPage({
  params,
}: {
  params: Promise<{ gameId: string }>
}) {
  const { gameId } = await params

  // Fetch game first
  const game = await getGame(gameId)

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
          <Gamepad2 className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Game Not Found</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          This game may have been removed or doesn't exist.
        </p>
        <div className="flex gap-3">
          <Link href="/backlog" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>
          <Link href="/home" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 font-medium transition-colors">
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  // Fetch additional data in parallel
  const [backlogItem, recentPatches, recentNews, isFollowing] = await Promise.all([
    getBacklogItem(gameId),
    getRecentPatches(gameId),
    getRecentNews(gameId),
    isFollowingGame(gameId),
  ])

  const isInBacklog = !!backlogItem
  const bannerUrl = game.hero_url || game.cover_url

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
      <GameBanner imageUrl={bannerUrl} gameName={game.name} brandColor={game.brand_color} />

      <div className="relative z-0 pt-[180px] sm:pt-[220px] space-y-6">
        {/* Back button */}
        <BackButton defaultHref="/backlog" defaultLabel="Back" />

        {/* Game header card */}
        <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm p-4 overflow-hidden">
          <div className="flex gap-4">
            {/* Cover image */}
            <div className="relative w-20 sm:w-24 flex-shrink-0 aspect-[3/4] rounded-lg overflow-hidden shadow-lg">
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

            {/* Game info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight line-clamp-2">
                  {game.name}
                </h1>
                {isInBacklog && backlogItem && (
                  <StatusBadge status={backlogItem.status} />
                )}
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
                {game.genre && <span>{game.genre}</span>}
                {formattedReleaseDate && <span>• {formattedReleaseDate}</span>}
                {game.is_live_service && (
                  <span className="flex items-center gap-1 text-blue-400">
                    <RefreshCw className="h-3 w-3" />
                    Live Service
                  </span>
                )}
              </div>

              {/* Progress bar (if in backlog) */}
              {isInBacklog && backlogItem && (
                <div className="flex items-center gap-2 pt-1">
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
              )}

              {/* Steam stats */}
              {game.steam_app_id && (
                <div className="pt-1">
                  <SteamStats
                    steamAppId={game.steam_app_id}
                    showPlayerCount={true}
                    layout="inline"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Play button */}
          {game.steam_app_id && (
            <div className="mt-4 pt-4 border-t border-border">
              <PlayNowButton
                gameName={game.name}
                steamAppId={game.steam_app_id}
                hasXbox={game.platforms?.some((p: string) => p.toLowerCase().includes('xbox'))}
                size="md"
                variant="primary"
              />
            </div>
          )}
        </div>

        {/* At a Glance */}
        <div className="rounded-xl border border-border bg-card p-4">
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

        {/* Sentiment Pulse - Community Mood */}
        <SentimentPulse gameId={gameId} />

        {/* Studio Info Section */}
        <StudioInfoSection
          developer={game.developer}
          publisher={game.publisher}
          studioType={game.studio_type as 'AAA' | 'AA' | 'indie' | null}
          genre={game.genre}
          similarGames={game.similar_games}
          developerNotableGames={game.developer_notable_games}
        />

        {/* AI Summary - What's New */}
        <Suspense fallback={<WhatsNewSkeleton />}>
          <WhatsNew gameId={gameId} />
        </Suspense>

        {/* Recent patches */}
        {recentPatches.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-amber-400" />
              <h2 className="font-semibold">Recent Patches</h2>
              <span className="text-xs text-muted-foreground ml-auto">
                {recentPatches.length} patch{recentPatches.length !== 1 ? 'es' : ''}
              </span>
            </div>
            <div className="space-y-2">
              {recentPatches.map((patch) => (
                <Link
                  key={patch.id}
                  href={`/patches/${patch.id}`}
                  className="group flex gap-3 p-3 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                            {patch.title}
                          </p>
                          {patch.impact_score >= 8 && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-red-500/20 text-red-400">
                              <Flame className="w-2.5 h-2.5 fill-red-400" />
                              Major
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`flex-shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded border ${getImpactBg(patch.impact_score)} ${getImpactColor(patch.impact_score)}`}>
                        {patch.impact_score}/10
                      </span>
                    </div>
                    {patch.summary_tldr && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {patch.summary_tldr}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-muted-foreground">
                        {relativeDaysText(patch.published_at)}
                      </span>
                      <span className="flex items-center gap-0.5 text-[11px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        View
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent news */}
        {recentNews.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Newspaper className="h-5 w-5 text-emerald-400" />
              <h2 className="font-semibold">Related News</h2>
              <span className="text-xs text-muted-foreground ml-auto">
                {recentNews.length} article{recentNews.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2">
              {recentNews.map((news) => (
                <Link
                  key={news.id}
                  href={`/news/${news.id}`}
                  className="group flex gap-3 p-3 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Newspaper className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {news.title}
                    </p>
                    {news.summary && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {news.summary}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-muted-foreground">
                        {relativeDaysText(news.published_at)}
                      </span>
                      <span className="flex items-center gap-0.5 text-[11px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Read
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Store links */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-semibold mb-3">Get the Game</h2>
          <StoreLinkButtons
            gameName={game.name}
            platforms={game.platforms || []}
            steamAppId={game.steam_app_id}
          />
        </div>

        {/* Add to backlog (if not already) */}
        {!isInBacklog && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Plus className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Track this game</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add to your backlog to track progress and get patch alerts.
                </p>
                <div className="mt-4">
                  <AddToBacklogButton gameId={gameId} gameName={game.name} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game management (remove, unfollow, etc.) */}
        <GameManagement
          gameId={gameId}
          gameName={game.name}
          isInBacklog={isInBacklog}
          isFollowing={isFollowing}
        />
      </div>
    </div>
  )
}
