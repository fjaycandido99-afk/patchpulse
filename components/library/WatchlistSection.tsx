'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, Gamepad2, FileText, ChevronRight, Bell, Clock, Newspaper } from 'lucide-react'
import { relativeDaysText } from '@/lib/dates'
import { ActivityBadge, UnreadDot } from './ActivityBadge'
import { SteamStats } from './SteamStats'
import { GenreFilter } from '@/components/ui/GenreFilter'

type SteamStatsData = {
  playtime_minutes: number | null
  last_played_at: string | null
}

type FollowedGameWithActivity = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  steam_app_id?: number | null
  genre?: string | null
  latestPatch: {
    id: string
    title: string
    published_at: string
  } | null
  patchCount: number
  inBacklog: boolean
  // New activity fields
  unreadPatchCount?: number
  unreadNewsCount?: number
  steamStats?: SteamStatsData | null
}

type WatchlistSectionProps = {
  games: FollowedGameWithActivity[]
  showGenreFilter?: boolean
}

function WatchlistCard({ game }: { game: FollowedGameWithActivity }) {
  const hasActivity = game.latestPatch !== null
  const totalUnread = (game.unreadPatchCount || 0) + (game.unreadNewsCount || 0)
  const hasUnread = totalUnread > 0
  const hasSteamData = game.steam_app_id && (game.steamStats?.playtime_minutes || game.steamStats?.last_played_at)

  return (
    <Link
      href={`/backlog/${game.id}`}
      className={`group relative flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all h-[140px] sm:h-auto ${
        hasUnread
          ? 'border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-transparent hover:border-blue-500/50'
          : 'border-border bg-card hover:border-primary/30 hover:bg-card/80'
      }`}
    >
      {/* Cover Image - locked 3:4 ratio for consistency */}
      <div className="relative w-[88px] sm:w-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted aspect-[3/4]">
        {game.cover_url ? (
          <Image
            src={game.cover_url}
            alt={game.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="96px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Gamepad2 className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        {/* Unread dot on cover */}
        <UnreadDot show={hasUnread} />
      </div>

      {/* Right side - Steam library style layout */}
      <div className="flex-1 min-w-0 flex flex-col py-0.5">
        {/* Game title and unread badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm sm:text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {game.name}
          </h3>
          {hasUnread && (
            <ActivityBadge
              patchCount={game.unreadPatchCount}
              newsCount={game.unreadNewsCount}
              size="sm"
            />
          )}
        </div>

        {/* Steam Stats - hidden on mobile for fixed height */}
        {hasSteamData && (
          <div className="mt-1.5 hidden sm:block">
            <SteamStats
              steamAppId={game.steam_app_id}
              steamStats={game.steamStats}
              showPlayerCount={true}
              layout="stacked"
            />
          </div>
        )}

        {/* Patch activity - fixed height footer */}
        <div className="mt-auto">
          <div className="h-5 flex items-center">
            {hasActivity ? (
              <div className="flex items-center gap-2 text-xs truncate">
                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${
                  hasUnread
                    ? 'text-blue-400 bg-blue-500/10'
                    : 'text-emerald-400 bg-emerald-500/10'
                }`}>
                  <FileText className="h-3 w-3" />
                  {game.patchCount}
                </span>
                <span className="text-muted-foreground">
                  {relativeDaysText(game.latestPatch!.published_at)}
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                No updates
              </p>
            )}
          </div>
        </div>
      </div>

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

export function WatchlistSection({ games, showGenreFilter = false }: WatchlistSectionProps) {
  const [selectedGenre, setSelectedGenre] = useState('')

  const filteredGames = useMemo(() => {
    if (!selectedGenre) return games
    return games.filter((game) =>
      game.genre?.toLowerCase().includes(selectedGenre.toLowerCase())
    )
  }, [games, selectedGenre])

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

  // Sort games: unread first, then by latest activity
  const sortedGames = [...filteredGames].sort((a, b) => {
    const aUnread = (a.unreadPatchCount || 0) + (a.unreadNewsCount || 0)
    const bUnread = (b.unreadPatchCount || 0) + (b.unreadNewsCount || 0)
    if (aUnread !== bUnread) return bUnread - aUnread

    // Then by latest patch
    const aLatest = a.latestPatch?.published_at || ''
    const bLatest = b.latestPatch?.published_at || ''
    return bLatest.localeCompare(aLatest)
  })

  // Separate games with unread from read
  const withUnread = sortedGames.filter(g => (g.unreadPatchCount || 0) + (g.unreadNewsCount || 0) > 0)
  const withActivity = sortedGames.filter(g => g.latestPatch !== null && (g.unreadPatchCount || 0) + (g.unreadNewsCount || 0) === 0)
  const quiet = sortedGames.filter(g => g.latestPatch === null)

  const totalUnread = filteredGames.reduce((sum, g) => sum + (g.unreadPatchCount || 0) + (g.unreadNewsCount || 0), 0)

  return (
    <div className="space-y-4">
      {/* Genre Filter */}
      {showGenreFilter && (
        <GenreFilter
          selected={selectedGenre}
          onChange={setSelectedGenre}
        />
      )}

      {/* Filter results count */}
      {selectedGenre && (
        <p className="text-sm text-muted-foreground">
          {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'} in {selectedGenre}
        </p>
      )}

      {/* Unread updates header */}
      {withUnread.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <Bell className="h-4 w-4 text-blue-400 animate-pulse" />
          <span className="font-medium text-blue-400">{totalUnread} new updates</span>
          <span className="text-muted-foreground">in {withUnread.length} games</span>
        </div>
      )}

      {/* Games with unread updates - show first */}
      {withUnread.length > 0 && (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {withUnread.map(game => (
            <WatchlistCard key={game.id} game={game} />
          ))}
        </div>
      )}

      {/* Games with recent activity but already read */}
      {withActivity.length > 0 && (
        <>
          {withUnread.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
              <FileText className="h-4 w-4" />
              <span>{withActivity.length} recently active</span>
            </div>
          )}
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {withActivity.map(game => (
              <WatchlistCard key={game.id} game={game} />
            ))}
          </div>
        </>
      )}

      {/* Quiet games */}
      {quiet.length > 0 && (
        <>
          {(withUnread.length > 0 || withActivity.length > 0) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
              <Clock className="h-4 w-4" />
              <span>{quiet.length} quiet</span>
            </div>
          )}
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {quiet.map(game => (
              <WatchlistCard key={game.id} game={game} />
            ))}
          </div>
        </>
      )}

      {/* View all link */}
      {filteredGames.length > 6 && (
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
