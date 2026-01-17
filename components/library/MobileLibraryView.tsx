'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Gamepad2, Plus, Search, X, Eye, FileText, Clock, Users, Crown } from 'lucide-react'
import { MobileLibraryHeader } from './MobileLibraryHeader'
import { SegmentedControl } from './SegmentedControl'
import { FloatingActionButton } from './FloatingActionButton'
import { MobileGameCard } from './MobileGameCard'
import { useSteamPlayerCounts } from './SteamStats'
import Image from 'next/image'
import Link from 'next/link'
import { searchGamesForBacklog, followAndAddToBacklog } from '@/app/(main)/backlog/actions'
import { relativeDaysText } from '@/lib/dates'

type BacklogStatus = 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped'

type SteamStatsData = {
  playtime_minutes: number | null
  last_played_at: string | null
}

type BacklogItem = {
  id: string
  game_id: string
  status: BacklogStatus
  progress: number
  next_note: string | null
  last_played_at: string | null
  game: {
    name: string
    slug: string
    cover_url: string | null
    steam_app_id?: number | null
  }
  latestPatch?: {
    title: string
    published_at: string
  } | null
  recentPatches: Array<{ id: string }>
  steamStats?: SteamStatsData | null
}

type FollowedGame = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  inBacklog: boolean
  backlogStatus: BacklogStatus | null
}

type GameData = {
  id: string
  name: string
  slug: string
  cover_url: string | null
}

type FollowedGameWithActivity = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  steam_app_id?: number | null
  latestPatch: {
    id: string
    title: string
    published_at: string
  } | null
  patchCount: number
  inBacklog: boolean
  unreadPatchCount?: number
  unreadNewsCount?: number
  steamStats?: SteamStatsData | null
}

type SubscriptionInfo = {
  plan: 'free' | 'pro'
  usage: {
    backlog: { used: number; limit: number }
    followed: { used: number; limit: number }
  }
}

type MobileLibraryViewProps = {
  board: Record<BacklogStatus, BacklogItem[]>
  followedGames: GameData[]
  followedGamesWithActivity: FollowedGameWithActivity[]
  backlogGames: GameData[]
  followedGamesForPicker: FollowedGame[]
  subscriptionInfo?: SubscriptionInfo
}

export function MobileLibraryView({
  board,
  followedGamesWithActivity,
  followedGamesForPicker,
  subscriptionInfo,
}: MobileLibraryViewProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get tab from URL, default to 'my-games'
  const tabParam = searchParams.get('tab')
  const mode = tabParam === 'watchlist' ? 'watchlist' : 'my-games'

  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  // Update URL when tab changes (without full page reload)
  const setMode = (newMode: 'my-games' | 'watchlist') => {
    const params = new URLSearchParams(searchParams.toString())
    if (newMode === 'watchlist') {
      params.set('tab', 'watchlist')
    } else {
      params.delete('tab')
    }
    router.replace(`/backlog?${params.toString()}`, { scroll: false })
  }

  // Combine all backlog items into a flat list
  const allBacklogItems = [
    ...board.playing,
    ...board.paused,
    ...board.backlog,
    ...board.finished,
    ...board.dropped,
  ]

  // Watchlist = followed games NOT in backlog
  const watchlistGames = followedGamesWithActivity.filter(g => !g.inBacklog)
  const watchlistOnlyCount = watchlistGames.length

  // Check if user is at limits (backlog and watchlist are separate limits)
  const isFollowedAtLimit = subscriptionInfo?.plan === 'free' &&
    watchlistOnlyCount >= (subscriptionInfo?.usage.followed.limit || 5)
  const isBacklogAtLimit = subscriptionInfo?.plan === 'free' &&
    allBacklogItems.length >= (subscriptionInfo?.usage.backlog.limit || 5)

  // Collect all Steam app IDs for player count fetching
  const allSteamAppIds = [
    ...allBacklogItems.map(item => item.game.steam_app_id).filter((id): id is number => !!id),
    ...followedGamesWithActivity.map(g => g.steam_app_id).filter((id): id is number => !!id),
  ]
  const uniqueSteamAppIds = [...new Set(allSteamAppIds)]
  const { counts: playerCounts } = useSteamPlayerCounts(uniqueSteamAppIds)

  // Filter games based on search
  const filteredItems = searchQuery
    ? allBacklogItems.filter(item =>
        item.game.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allBacklogItems

  const handleFABAdd = () => {
    setShowAddModal(true)
  }

  return (
    <div className="md:hidden pb-20">
      {/* Mobile Header */}
      <MobileLibraryHeader
        title="Library"
        subtitle="Your games collection"
        onSearchChange={setSearchQuery}
      />

      {/* Segmented Control */}
      <div className="px-4 py-3">
        <SegmentedControl
          segments={[
            { id: 'my-games', label: 'My Games', icon: <Gamepad2 className="h-4 w-4" /> },
            { id: 'watchlist', label: 'Watchlist', icon: <Eye className="h-4 w-4" /> },
          ]}
          value={mode}
          onChange={(v) => setMode(v as 'my-games' | 'watchlist')}
        />
      </div>

      {mode === 'my-games' ? (
        <div className="px-4">
          {/* Backlog limit indicator for free users */}
          {subscriptionInfo?.plan === 'free' && (
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-medium ${
                isBacklogAtLimit ? 'text-amber-400' : 'text-muted-foreground'
              }`}>
                {allBacklogItems.length}/{subscriptionInfo.usage.backlog.limit} games
              </span>
              {isBacklogAtLimit && (
                <Link
                  href="/pricing"
                  className="flex items-center gap-1 text-xs text-primary font-medium"
                >
                  <Crown className="h-3 w-3" />
                  Upgrade
                </Link>
              )}
            </div>
          )}
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm font-medium text-muted-foreground">No games in your library</p>
              <p className="text-xs text-muted-foreground mt-1">Add games to start tracking</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filteredItems.map(item => (
                <MobileGameCard
                  key={item.id}
                  id={item.game_id}
                  href={`/backlog/${item.game_id}`}
                  title={item.game.name}
                  imageUrl={item.game.cover_url}
                  progress={item.progress}
                  status={item.status}
                  hasNewPatch={!!item.latestPatch}
                  patchCount={item.recentPatches.length}
                  lastPlayedText={item.last_played_at ? `Last played recently` : null}
                  steamStats={item.steamStats}
                  playerCount={item.game.steam_app_id ? playerCounts[item.game.steam_app_id.toString()] : null}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="px-4">
          {/* Watchlist limit indicator for free users */}
          {subscriptionInfo?.plan === 'free' && (
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-medium ${
                isFollowedAtLimit ? 'text-amber-400' : 'text-muted-foreground'
              }`}>
                {watchlistOnlyCount}/{subscriptionInfo.usage.followed.limit} watchlist
              </span>
              {isFollowedAtLimit && (
                <Link
                  href="/pricing"
                  className="flex items-center gap-1 text-xs text-primary font-medium"
                >
                  <Crown className="h-3 w-3" />
                  Upgrade for unlimited
                </Link>
              )}
            </div>
          )}
          <MobileWatchlistGrid games={watchlistGames} playerCounts={playerCounts} />
        </div>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleFABAdd} />

      {/* Add Game Modal */}
      {showAddModal && (
        <AddGameModal
          followedGamesForPicker={followedGamesForPicker}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}

// Discover mode content
function DiscoverMode({
  onClose,
}: {
  followedGamesForPicker: FollowedGame[]
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<GameData[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (search.length < 2) {
      setResults([])
      return
    }

    setIsSearching(true)
    const timeout = setTimeout(async () => {
      try {
        const data = await searchGamesForBacklog(search)
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [search])

  const handleAdd = async (gameId: string) => {
    await followAndAddToBacklog(gameId)
    setResults(prev => prev.filter(g => g.id !== gameId))
  }

  return (
    <div className="px-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search any game..."
          autoFocus
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {isSearching ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-2">
          {results.map(game => (
            <div
              key={game.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
            >
              <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
                {game.cover_url ? (
                  <Image src={game.cover_url} alt={game.name} fill className="object-cover" sizes="48px" unoptimized />
                ) : (
                  <div className="absolute inset-0 bg-muted" />
                )}
              </div>
              <span className="flex-1 text-sm font-medium truncate">{game.name}</span>
              <button
                onClick={() => handleAdd(game.id)}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : search.length >= 2 ? (
        <p className="text-center text-muted-foreground py-8">No games found</p>
      ) : (
        <p className="text-center text-muted-foreground py-8">Type to search any game</p>
      )}
    </div>
  )
}

// Add game modal with keyboard-aware positioning
function AddGameModal({
  followedGamesForPicker,
  onClose,
}: {
  followedGamesForPicker: FollowedGame[]
  onClose: () => void
}) {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    // Handle iOS keyboard by detecting viewport changes
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.visualViewport) {
        const viewportHeight = window.visualViewport.height
        const windowHeight = window.innerHeight
        const keyboardH = windowHeight - viewportHeight
        setKeyboardHeight(keyboardH > 0 ? keyboardH : 0)
      }
    }

    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      handleResize() // Initial check
    }

    return () => {
      if (typeof window !== 'undefined' && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center animate-in fade-in duration-150">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full bg-card border-t border-border rounded-t-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
        style={{
          maxHeight: keyboardHeight > 0 ? `calc(100vh - ${keyboardHeight}px)` : '80vh',
          marginBottom: keyboardHeight > 0 ? keyboardHeight : 0,
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">Add Game</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto" style={{ maxHeight: keyboardHeight > 0 ? `calc(100vh - ${keyboardHeight + 80}px)` : '60vh' }}>
          <DiscoverMode followedGamesForPicker={followedGamesForPicker} onClose={onClose} />
        </div>
      </div>
    </div>
  )
}

// Mobile Watchlist Grid with Activity
function MobileWatchlistGrid({ games, playerCounts }: { games: FollowedGameWithActivity[]; playerCounts: Record<string, string> }) {
  if (games.length === 0) {
    return (
      <div className="text-center py-4">
        <Link
          href="/releases"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-sm font-medium border border-blue-500/20 transition-colors"
        >
          Browse New Releases
        </Link>
      </div>
    )
  }

  const withActivity = games.filter(g => g.latestPatch !== null)
  const quiet = games.filter(g => g.latestPatch === null)

  return (
    <div className="space-y-3">
      {/* Games with activity */}
      {withActivity.length > 0 && (
        <>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <FileText className="h-3 w-3" />
            <span>{withActivity.length} with recent updates</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {withActivity.map(game => (
              <MobileWatchlistCard key={game.id} game={game} playerCount={game.steam_app_id ? playerCounts[game.steam_app_id.toString()] : undefined} />
            ))}
          </div>
        </>
      )}

      {/* Quiet games */}
      {quiet.length > 0 && (
        <>
          {withActivity.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
              <Clock className="h-3 w-3" />
              <span>{quiet.length} quiet</span>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            {quiet.map(game => (
              <MobileWatchlistCard key={game.id} game={game} playerCount={game.steam_app_id ? playerCounts[game.steam_app_id.toString()] : undefined} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Individual watchlist card - compact grid style
function MobileWatchlistCard({ game, playerCount }: { game: FollowedGameWithActivity; playerCount?: string }) {
  const hasActivity = game.latestPatch !== null

  return (
    <Link
      href={`/backlog/${game.id}`}
      className="relative group"
    >
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
        {game.cover_url ? (
          <Image src={game.cover_url} alt={game.name} fill className="object-cover" sizes="120px" unoptimized />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Gamepad2 className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        {/* Activity dot */}
        {hasActivity && (
          <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-400" />
        )}
        {/* Player count badge - bottom right */}
        {playerCount && (
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm">
            <Users className="h-2.5 w-2.5 text-emerald-400" />
            <span className="text-[9px] text-emerald-400 font-medium">{playerCount}</span>
          </div>
        )}
      </div>
      <p className="mt-1 text-xs font-medium line-clamp-2 text-center h-8">{game.name}</p>
    </Link>
  )
}
