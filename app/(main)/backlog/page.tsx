import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Star, Gamepad2, Bookmark, ChevronRight, Eye } from 'lucide-react'
import { getBacklogBoard, getFollowedGamesForBacklogPicker, getFollowedGamesWithActivity } from './queries'
import { getFollowedGames, getBacklogGames, getFavoriteGames } from '../profile/actions'
import { AddToBacklogPanel } from '@/components/backlog/AddToBacklogPanel'
import { BacklogCard } from '@/components/backlog/BacklogCard'
import { CollapsibleSection } from '@/components/library/CollapsibleSection'
import { WatchlistSection } from '@/components/library/WatchlistSection'
import { ShowcaseSection } from '@/components/library/ShowcaseSection'
import { MobileLibraryView } from '@/components/library/MobileLibraryView'
import { relativeDaysText } from '@/lib/dates'

type BacklogStatus = 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped'

const SECTION_CONFIG: {
  key: BacklogStatus
  title: string
  icon: string
  emptyText: string
  emptySubtext: string
  color: string
  bgGradient: string
}[] = [
  {
    key: 'playing',
    title: 'Currently Playing',
    icon: '▶',
    emptyText: 'No active adventures',
    emptySubtext: 'Start a game to see it here',
    color: 'text-green-400',
    bgGradient: 'from-green-500/5 to-transparent',
  },
  {
    key: 'paused',
    title: 'On Hold',
    icon: '⏸',
    emptyText: 'No games on pause',
    emptySubtext: 'Sometimes you need a break',
    color: 'text-amber-400',
    bgGradient: 'from-amber-500/5 to-transparent',
  },
  {
    key: 'backlog',
    title: 'Up Next',
    icon: '📦',
    emptyText: 'Your backlog is clear!',
    emptySubtext: 'Add games you want to play later',
    color: 'text-blue-400',
    bgGradient: 'from-blue-500/5 to-transparent',
  },
  {
    key: 'finished',
    title: 'Completed',
    icon: '✓',
    emptyText: 'No victories yet',
    emptySubtext: 'Finish a game to celebrate here',
    color: 'text-purple-400',
    bgGradient: 'from-purple-500/5 to-transparent',
  },
  {
    key: 'dropped',
    title: 'Dropped',
    icon: '✗',
    emptyText: 'Nothing dropped',
    emptySubtext: 'Games that didn\'t click',
    color: 'text-zinc-400',
    bgGradient: 'from-zinc-500/5 to-transparent',
  },
]

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

  // Get favorite game IDs from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('favorite_game_ids')
    .eq('id', user?.id || '')
    .single()

  const favoriteGameIds: string[] = Array.isArray(profile?.favorite_game_ids)
    ? profile.favorite_game_ids
    : []

  // Fetch favorite games data
  const favoriteGames = await getFavoriteGames(favoriteGameIds)

  // Combine all games for the favorite picker
  const allGames = [
    ...followedGames,
    ...backlogGames.filter((bg) => !followedGames.some((fg) => fg.id === bg.id)),
  ]

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
          favoriteGames={favoriteGames}
          favoriteGameIds={favoriteGameIds}
          followedGamesForPicker={followedGamesForPicker}
          allGames={allGames}
        />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block space-y-8">
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

      {/* Favorite Games - Showcase Style */}
      <CollapsibleSection
        id="favorites"
        title="Favorites"
        icon={<Star className="h-5 w-5 text-amber-400 fill-amber-400" />}
        count={favoriteGames.length}
        defaultOpen={favoriteGames.length > 0}
      >
        <ShowcaseSection
          favoriteGames={favoriteGames}
          allGames={allGames}
          maxFavorites={5}
        />
      </CollapsibleSection>

      {/* Followed Games - Watchlist Style */}
      <CollapsibleSection
        id="followed"
        title="Watchlist"
        icon={<Eye className="h-5 w-5 text-blue-400" />}
        count={followedGamesWithActivity.filter(g => !g.inBacklog).length}
        defaultOpen={followedGamesWithActivity.some(g => g.latestPatch !== null)}
      >
        <WatchlistSection
          games={followedGamesWithActivity.filter(g => !g.inBacklog)}
        />
      </CollapsibleSection>

      {/* Backlog Sections */}
      <div className="space-y-6">
        {SECTION_CONFIG.map(({ key, title, icon, emptyText, emptySubtext, color, bgGradient }) => {
          const items = board[key]
          // Auto-collapse empty sections (except playing which should always be visible)
          if (items.length === 0 && key !== 'playing') {
            return null
          }
          return (
            <section
              key={key}
              className={`rounded-xl border border-border bg-gradient-to-r ${bgGradient} overflow-hidden`}
            >
              {/* Section header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <span className={`text-sm ${color}`}>{icon}</span>
                  <span>{title}</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    {items.length}
                  </span>
                </h2>
              </div>

              {/* Section content */}
              <div className="p-4">
                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <p className={`text-sm font-medium ${color}`}>{emptyText}</p>
                    <p className="text-xs text-muted-foreground mt-1">{emptySubtext}</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
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
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          )
        })}

        {/* Show collapsed empty sections summary */}
        {(() => {
          const emptySections = SECTION_CONFIG.filter(
            ({ key }) => board[key].length === 0 && key !== 'playing'
          )
          if (emptySections.length === 0) return null
          return (
            <div className="text-center py-4 text-xs text-muted-foreground">
              {emptySections.length} empty {emptySections.length === 1 ? 'section' : 'sections'} hidden:{' '}
              {emptySections.map(s => s.title).join(', ')}
            </div>
          )
        })()}
      </div>
      </div>
    </>
  )
}
