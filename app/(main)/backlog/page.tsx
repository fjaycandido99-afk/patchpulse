import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Bookmark, ChevronRight, Eye, Gamepad2 } from 'lucide-react'
import { getBacklogBoard, getFollowedGamesForBacklogPicker, getFollowedGamesWithActivity } from './queries'
import { getFollowedGames, getBacklogGames } from '../profile/actions'
import { AddToBacklogPanel } from '@/components/backlog/AddToBacklogPanel'
import { BacklogCard } from '@/components/backlog/BacklogCard'
import { WatchlistSection } from '@/components/library/WatchlistSection'
import { MobileLibraryView } from '@/components/library/MobileLibraryView'
import { MarkAllReadButton } from '@/components/library/MarkAllReadButton'
import { relativeDaysText } from '@/lib/dates'

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [board, followedGamesForPicker, followedGames, followedGamesWithActivity, backlogGames, bookmarksCount] = await Promise.all([
    getBacklogBoard(),
    getFollowedGamesForBacklogPicker(),
    getFollowedGames(),
    getFollowedGamesWithActivity(),
    getBacklogGames(),
    // Get bookmarks count
    supabase
      .from('bookmarks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user?.id || '')
      .then(({ count }) => count || 0),
  ])

  // Combine all backlog items into a single flat list
  const allBacklogItems = [
    ...board.playing,
    ...board.paused,
    ...board.backlog,
    ...board.finished,
    ...board.dropped,
  ]

  const watchlistGames = followedGamesWithActivity.filter(g => !g.inBacklog)
  const totalUnread = watchlistGames.reduce(
    (sum, g) => sum + (g.unreadPatchCount || 0) + (g.unreadNewsCount || 0),
    0
  )

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden">
        {/* Saved Updates Link */}
        {bookmarksCount > 0 && (
          <Link
            href="/bookmarks"
            className="flex items-center justify-between p-4 mb-4 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Saved Updates</p>
                <p className="text-xs text-muted-foreground">{bookmarksCount} saved items</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
        )}
        <MobileLibraryView
          board={board}
          followedGames={followedGames}
          followedGamesWithActivity={followedGamesWithActivity}
          backlogGames={backlogGames}
          followedGamesForPicker={followedGamesForPicker}
        />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Library</h1>
          <p className="mt-1 text-muted-foreground">
            Your games collection and progress tracker
          </p>
        </div>

        {/* Add to Backlog */}
        <AddToBacklogPanel games={followedGamesForPicker} />

        {/* Saved Updates Link */}
        {bookmarksCount > 0 && (
          <Link
            href="/bookmarks"
            className="flex items-center justify-between p-4 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent hover:border-amber-500/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="font-medium">Saved Updates</p>
                <p className="text-sm text-muted-foreground">{bookmarksCount} bookmarked patches & news</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
        )}

        {/* My Games - Flat Grid */}
        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Gamepad2 className="h-5 w-5 text-primary" />
              <span>My Games</span>
              <span className="px-1.5 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                {allBacklogItems.length}
              </span>
            </h2>
          </div>

          <div className="p-4">
            {allBacklogItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm font-medium text-muted-foreground">No games in your library</p>
                <p className="text-xs text-muted-foreground mt-1">Add games to start tracking</p>
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {allBacklogItems.map((item) => (
                  <BacklogCard
                    key={item.id}
                    href={`/backlog/${item.game_id}`}
                    title={item.game.name}
                    progress={item.progress}
                    imageUrl={item.game.cover_url}
                    status={item.status}
                    nextNote={item.next_note}
                    lastPlayedText={
                      item.last_played_at
                        ? `Last played ${relativeDaysText(item.last_played_at)}`
                        : null
                    }
                    latestPatch={item.latestPatch}
                    patchCount={item.recentPatches.length}
                    steamAppId={item.game.steam_app_id}
                    steamStats={item.steamStats}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Watchlist */}
        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Eye className="h-5 w-5 text-blue-400" />
              <span>Watchlist</span>
              <span className="px-1.5 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                {watchlistGames.length}
              </span>
            </h2>
            <MarkAllReadButton totalUnread={totalUnread} />
          </div>

          <div className="p-4">
            <WatchlistSection games={watchlistGames} />
          </div>
        </section>
      </div>
    </>
  )
}
