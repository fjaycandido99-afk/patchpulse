'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Eye, Gamepad2, FileText, ChevronRight, Bell, Clock } from 'lucide-react'
import { relativeDaysText } from '@/lib/dates'

type FollowedGameWithActivity = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  latestPatch: {
    id: string
    title: string
    published_at: string
  } | null
  patchCount: number
  inBacklog: boolean
}

type WatchlistSectionProps = {
  games: FollowedGameWithActivity[]
}

function WatchlistCard({ game }: { game: FollowedGameWithActivity }) {
  const hasActivity = game.latestPatch !== null

  return (
    <Link
      href={`/backlog/${game.id}`}
      className="group relative flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-card/80 transition-all"
    >
      {/* Cover Image */}
      <div className="relative h-20 w-14 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
        {game.cover_url ? (
          <Image
            src={game.cover_url}
            alt={game.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="56px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Gamepad2 className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
          {game.name}
        </h3>

        {hasActivity ? (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <FileText className="h-3 w-3" />
              {game.patchCount} {game.patchCount === 1 ? 'update' : 'updates'}
            </span>
            <span className="text-xs text-muted-foreground">
              {relativeDaysText(game.latestPatch!.published_at)}
            </span>
          </div>
        ) : (
          <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            No recent updates
          </p>
        )}

        {game.latestPatch && (
          <p className="mt-1 text-xs text-muted-foreground truncate">
            Latest: {game.latestPatch.title}
          </p>
        )}
      </div>

      {/* Activity indicator */}
      {hasActivity && (
        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
      )}

      {/* In backlog badge */}
      {game.inBacklog && (
        <div className="absolute bottom-2 right-2">
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            In backlog
          </span>
        </div>
      )}
    </Link>
  )
}

export function WatchlistSection({ games }: WatchlistSectionProps) {
  if (games.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/10 flex items-center justify-center">
          <Eye className="h-6 w-6 text-blue-400" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No games on your watchlist</p>
        <p className="text-muted-foreground text-xs mb-4">Follow games to get patch updates</p>
        <Link
          href="/releases"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-sm font-medium border border-blue-500/20 transition-colors"
        >
          Browse New Releases
        </Link>
      </div>
    )
  }

  // Separate games with activity from quiet ones
  const withActivity = games.filter(g => g.latestPatch !== null)
  const quiet = games.filter(g => g.latestPatch === null)

  return (
    <div className="space-y-4">
      {/* Active games header */}
      {withActivity.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <Bell className="h-4 w-4 text-emerald-400" />
          <span className="font-medium">{withActivity.length} with recent updates</span>
        </div>
      )}

      {/* Games with activity */}
      <div className="grid gap-3 sm:grid-cols-2">
        {withActivity.map(game => (
          <WatchlistCard key={game.id} game={game} />
        ))}
      </div>

      {/* Quiet games */}
      {quiet.length > 0 && (
        <>
          {withActivity.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
              <Clock className="h-4 w-4" />
              <span>{quiet.length} quiet</span>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {quiet.map(game => (
              <WatchlistCard key={game.id} game={game} />
            ))}
          </div>
        </>
      )}

      {/* View all link */}
      {games.length > 6 && (
        <Link
          href="/search?category=games"
          className="flex items-center justify-center gap-1 text-sm text-primary hover:underline pt-2"
        >
          View all followed games
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
