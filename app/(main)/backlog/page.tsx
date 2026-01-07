import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Eye, Gamepad2, UserPlus, LogIn } from 'lucide-react'
import { isGuestModeFromCookies } from '@/lib/guest'
import { getBacklogBoard, getFollowedGamesForBacklogPicker, getFollowedGamesWithActivity } from './queries'
import { getFollowedGames, getBacklogGames } from '../profile/actions'
import { AddToBacklogPanel } from '@/components/backlog/AddToBacklogPanel'
import { WatchlistSection } from '@/components/library/WatchlistSection'
import { MobileLibraryView } from '@/components/library/MobileLibraryView'
import { MarkAllReadButton } from '@/components/library/MarkAllReadButton'
import { MyGamesGrid } from '@/components/library/MyGamesGrid'

export default async function LibraryPage() {
  const cookieStore = await cookies()
  const hasGuestCookie = isGuestModeFromCookies(cookieStore)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // User is only a guest if they have the cookie AND are not logged in
  const isGuest = !user && hasGuestCookie

  // Redirect to login if not logged in and not a guest
  if (!user && !isGuest) {
    redirect('/login')
  }

  // Show empty state for guests
  if (isGuest) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Library</h1>
          <p className="mt-1 text-muted-foreground">
            Your games collection and progress tracker
          </p>
        </div>

        {/* Empty state for guests */}
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Gamepad2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your Library is Empty</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create an account to follow games, track your backlog, and get personalized updates.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Create Account
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          </div>
        </div>

        {/* Explore suggestion */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Want to explore? Check out the{' '}
            <Link href="/patches" className="text-primary hover:underline">latest patches</Link>
            {' '}or{' '}
            <Link href="/news" className="text-primary hover:underline">gaming news</Link>.
          </p>
        </div>
      </div>
    )
  }

  // supabase and user already fetched above for guest check

  const [board, followedGamesForPicker, followedGames, followedGamesWithActivity, backlogGames] = await Promise.all([
    getBacklogBoard(),
    getFollowedGamesForBacklogPicker(),
    getFollowedGames(),
    getFollowedGamesWithActivity(),
    getBacklogGames(),
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
          {/* Glow divider */}
          <div className="relative h-0.5 w-full overflow-visible mt-4">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />
            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-md" />
          </div>
        </div>

        {/* Add to Backlog */}
        <AddToBacklogPanel games={followedGamesForPicker} />

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
            <MyGamesGrid items={allBacklogItems} />
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
            <WatchlistSection games={watchlistGames} showGenreFilter />
          </div>
        </section>
      </div>
    </>
  )
}
