import { createClient } from '@/lib/supabase/server'
import { Star, Gamepad2 } from 'lucide-react'
import { getBacklogBoard, getFollowedGamesForBacklogPicker } from './queries'
import { getFollowedGames, getBacklogGames, getFavoriteGames } from '../profile/actions'
import { AddToBacklogPanel } from '@/components/backlog/AddToBacklogPanel'
import { BacklogCard } from '@/components/backlog/BacklogCard'
import { CollapsibleSection } from '@/components/library/CollapsibleSection'
import { FavoriteGamesContent } from '@/components/library/FavoriteGamesContent'
import { FollowedGamesContent } from '@/components/library/FollowedGamesContent'
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

  const [board, followedGamesForPicker, followedGames, backlogGames] = await Promise.all([
    getBacklogBoard(),
    getFollowedGamesForBacklogPicker(),
    getFollowedGames(),
    getBacklogGames(),
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
      <MobileLibraryView
        board={board}
        followedGames={followedGames}
        backlogGames={backlogGames}
        favoriteGames={favoriteGames}
        favoriteGameIds={favoriteGameIds}
        followedGamesForPicker={followedGamesForPicker}
      />

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

      {/* Collapsible: Favorite Games */}
      <CollapsibleSection
        id="favorites"
        title="Favorite Games"
        icon={<Star className="h-5 w-5 text-amber-400 fill-amber-400" />}
        count={favoriteGames.length}
        defaultOpen={false}
      >
        <FavoriteGamesContent
          favoriteGames={favoriteGames}
          allGames={allGames}
          maxFavorites={5}
        />
      </CollapsibleSection>

      {/* Collapsible: Followed Games */}
      <CollapsibleSection
        id="followed"
        title="Followed Games"
        icon={<Gamepad2 className="h-5 w-5 text-blue-400" />}
        count={followedGames.filter(g => !backlogGames.some(bg => bg.id === g.id)).length}
        defaultOpen={false}
      >
        <FollowedGamesContent
          followedGames={followedGames}
          backlogGames={backlogGames}
          favoriteGameIds={favoriteGameIds}
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
