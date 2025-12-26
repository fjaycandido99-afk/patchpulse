import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { ArrowLeft, FileText } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBacklogItem } from '../queries'
import { getSeasonalGameImage } from '@/lib/images/seasonal'
import { BacklogControls } from '@/components/backlog/BacklogControls'
import { WhatsNew } from '@/components/backlog/WhatsNew'
import { formatDate } from '@/lib/dates'

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
    .select('id, name, slug, cover_url, logo_url, brand_color')
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

// Game Banner Component
function GameBanner({
  imageUrl,
  gameName,
}: {
  imageUrl: string | null
  gameName: string
}) {
  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 mb-6 h-20 sm:h-32 lg:h-40 overflow-hidden">
      {imageUrl ? (
        <>
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-background" />
        </>
      ) : (
        // Fallback gradient if no image
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
      )}
    </div>
  )
}

// Game Icon Component
function GameIcon({
  logoUrl,
  coverUrl,
  gameName,
  brandColor,
}: {
  logoUrl: string | null
  coverUrl: string | null
  gameName: string
  brandColor: string | null
}) {
  const imageUrl = logoUrl || coverUrl
  const glowColor = brandColor || '#6366f1' // Default to indigo if no brand color

  return (
    <div
      className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-border"
      style={{
        boxShadow: `0 0 20px ${glowColor}40, 0 0 40px ${glowColor}20`,
      }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={gameName}
          fill
          className="object-cover"
          sizes="56px"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-muted to-background flex items-center justify-center">
          <span className="text-sm font-bold text-primary/60">
            {getInitials(gameName)}
          </span>
        </div>
      )}
    </div>
  )
}

export default async function BacklogDetailPage({
  params,
}: {
  params: Promise<{ gameId: string }>
}) {
  const { gameId } = await params
  const [game, backlogItem, seasonalImage] = await Promise.all([
    getGame(gameId),
    getBacklogItem(gameId),
    getSeasonalGameImage(gameId),
  ])

  if (!game) {
    notFound()
  }

  // Use seasonal images if available, otherwise fall back to game defaults
  const bannerUrl = seasonalImage.heroUrl || seasonalImage.coverUrl || game.cover_url
  const logoUrl = seasonalImage.logoUrl || game.logo_url
  const brandColor = seasonalImage.brandColor || game.brand_color

  const initialStatus = backlogItem?.status ?? 'backlog'
  const initialProgress = backlogItem?.progress ?? 0
  const initialNextNote = backlogItem?.next_note ?? null
  const initialPauseReason = backlogItem?.pause_reason ?? null

  return (
    <div className="relative">
      {/* Subtle Game Banner */}
      <GameBanner imageUrl={bannerUrl} gameName={game.name} />

      <div className="space-y-6 sm:space-y-8">
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

        {/* Game Title with Icon */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <GameIcon
              logoUrl={logoUrl}
              coverUrl={game.cover_url}
              gameName={game.name}
              brandColor={brandColor}
            />
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
                {game.name}
              </h1>
              {seasonalImage.isSeasonal && seasonalImage.eventName && (
                <p className="text-xs text-violet-400 mt-1">
                  {seasonalImage.eventName}
                </p>
              )}
            </div>
          </div>

          {backlogItem && (
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {backlogItem.last_played_at && (
                <span>Last played: {formatDate(backlogItem.last_played_at)}</span>
              )}
              {backlogItem.started_at && (
                <span>Started: {formatDate(backlogItem.started_at)}</span>
              )}
              {backlogItem.finished_at && (
                <span>Finished: {formatDate(backlogItem.finished_at)}</span>
              )}
            </div>
          )}
        </div>

        <Suspense fallback={<WhatsNewSkeleton />}>
          <WhatsNew gameId={gameId} />
        </Suspense>

        {backlogItem && backlogItem.recentPatches.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
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

        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <BacklogControls
            gameId={gameId}
            initialStatus={initialStatus}
            initialProgress={initialProgress}
            initialNextNote={initialNextNote}
            initialPauseReason={initialPauseReason}
          />
        </div>

        <p className="text-sm text-muted-foreground/70">
          Tip: Write the next step so you can jump back in later.
        </p>
      </div>
    </div>
  )
}
