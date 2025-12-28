'use client'

import { useState, useRef, useEffect } from 'react'
import { Star, Gamepad2, ChevronDown, Plus, Search, X, Play, Pause, Check, Library, Eye, FileText, Clock } from 'lucide-react'
import { MobileLibraryHeader } from './MobileLibraryHeader'
import { SegmentedControl } from './SegmentedControl'
import { FloatingActionButton } from './FloatingActionButton'
import { MobileGameCard } from './MobileGameCard'
import Image from 'next/image'
import Link from 'next/link'
import { addToBacklogWithStatus, searchGamesForBacklog, followAndAddToBacklog } from '@/app/(main)/backlog/actions'
import { updateFavoriteGames } from '@/app/(main)/profile/actions'
import { relativeDaysText } from '@/lib/dates'

type BacklogStatus = 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped'

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
  }
  latestPatch?: {
    title: string
    published_at: string
  } | null
  recentPatches: Array<{ id: string }>
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
  latestPatch: {
    id: string
    title: string
    published_at: string
  } | null
  patchCount: number
  inBacklog: boolean
}

type MobileLibraryViewProps = {
  board: Record<BacklogStatus, BacklogItem[]>
  followedGames: GameData[]
  followedGamesWithActivity: FollowedGameWithActivity[]
  backlogGames: GameData[]
  favoriteGames: GameData[]
  favoriteGameIds: string[]
  followedGamesForPicker: FollowedGame[]
  allGames: GameData[]
}

const SECTION_CONFIG = [
  { key: 'playing' as BacklogStatus, title: 'Currently Playing', icon: '▶', color: 'text-green-400' },
  { key: 'paused' as BacklogStatus, title: 'On Hold', icon: '⏸', color: 'text-amber-400' },
  { key: 'backlog' as BacklogStatus, title: 'Up Next', icon: '📦', color: 'text-blue-400' },
  { key: 'finished' as BacklogStatus, title: 'Completed', icon: '✓', color: 'text-purple-400' },
  { key: 'dropped' as BacklogStatus, title: 'Dropped', icon: '✗', color: 'text-zinc-400' },
]

export function MobileLibraryView({
  board,
  followedGames,
  followedGamesWithActivity,
  backlogGames,
  favoriteGames,
  favoriteGameIds,
  followedGamesForPicker,
  allGames,
}: MobileLibraryViewProps) {
  const [mode, setMode] = useState<'my-games' | 'discover'>('my-games')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    // Default: expand sections with items
    const expanded = new Set<string>()
    // Expand favorites if there are any
    if (favoriteGames.length > 0) expanded.add('favorites')
    // Expand followed if there are followed games not in backlog
    const followedOnly = followedGames.filter(g => !backlogGames.some(bg => bg.id === g.id))
    if (followedOnly.length > 0) expanded.add('followed')
    // Expand backlog sections with items
    SECTION_CONFIG.forEach(({ key }) => {
      if (board[key].length > 0) expanded.add(key)
    })
    return expanded
  })

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const handleFABSearch = () => {
    setMode('my-games')
    setShowAddModal(true)
  }

  const handleFABDiscover = () => {
    setMode('discover')
    setShowAddModal(true)
  }

  // Filter games based on search
  const filterGames = (items: BacklogItem[]) => {
    if (!searchQuery) return items
    return items.filter(item =>
      item.game.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  return (
    <div className="md:hidden pb-24">
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
            { id: 'discover', label: 'Discover', icon: <Search className="h-4 w-4" /> },
          ]}
          value={mode}
          onChange={(v) => setMode(v as 'my-games' | 'discover')}
        />
      </div>

      {mode === 'my-games' ? (
        <div className="px-4 space-y-4">
          {/* Favorites Section - Showcase Style */}
          <CollapsibleMobileSection
            title="Favorites"
            icon={<Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
            count={favoriteGames.length}
            isOpen={expandedSections.has('favorites')}
            onToggle={() => toggleSection('favorites')}
            isEmpty={favoriteGames.length === 0}
            emptyText="Pin up to 5 games"
          >
            <MobileShowcaseGrid
              favoriteGames={favoriteGames}
              allGames={allGames}
              favoriteGameIds={favoriteGameIds}
            />
          </CollapsibleMobileSection>

          {/* Watchlist Section - Activity-focused */}
          <CollapsibleMobileSection
            title="Watchlist"
            icon={<Eye className="h-4 w-4 text-blue-400" />}
            count={followedGamesWithActivity.filter(g => !g.inBacklog).length}
            isOpen={expandedSections.has('followed')}
            onToggle={() => toggleSection('followed')}
            isEmpty={followedGamesWithActivity.filter(g => !g.inBacklog).length === 0}
            emptyText="Follow games to track updates"
          >
            <MobileWatchlistGrid games={followedGamesWithActivity.filter(g => !g.inBacklog)} />
          </CollapsibleMobileSection>

          {/* Backlog Sections */}
          {SECTION_CONFIG.map(({ key, title, icon, color }) => {
            const items = filterGames(board[key])
            const isExpanded = expandedSections.has(key)
            const totalCount = board[key].length

            return (
              <CollapsibleMobileSection
                key={key}
                title={title}
                icon={<span className={`text-sm ${color}`}>{icon}</span>}
                count={totalCount}
                isOpen={isExpanded}
                onToggle={() => toggleSection(key)}
                isEmpty={totalCount === 0}
                emptyText={key === 'playing' ? 'Start playing a game' : undefined}
              >
                <div className="space-y-2">
                  {items.map(item => (
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
                      isFavorite={favoriteGameIds.includes(item.game_id)}
                    />
                  ))}
                </div>
              </CollapsibleMobileSection>
            )
          })}
        </div>
      ) : (
        <DiscoverMode
          followedGamesForPicker={followedGamesForPicker}
          onClose={() => setMode('my-games')}
        />
      )}

      {/* Floating Action Button */}
      <FloatingActionButton
        onSearchClick={handleFABSearch}
        onDiscoverClick={handleFABDiscover}
      />

      {/* Add Game Modal */}
      {showAddModal && (
        <AddGameModal
          mode={mode}
          followedGamesForPicker={followedGamesForPicker}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}

// Collapsible section for mobile
function CollapsibleMobileSection({
  title,
  icon,
  count,
  isOpen,
  onToggle,
  isEmpty,
  emptyText,
  children,
}: {
  title: string
  icon: React.ReactNode
  count: number
  isOpen: boolean
  onToggle: () => void
  isEmpty?: boolean
  emptyText?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm">{title}</span>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {count}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="p-3 pt-0 animate-in slide-in-from-top-2 duration-200">
          {isEmpty && emptyText ? (
            <p className="text-sm text-muted-foreground text-center py-4">{emptyText}</p>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  )
}

// Mini game card for horizontal scroll
function MiniGameCard({
  title,
  imageUrl,
  href,
}: {
  title: string
  imageUrl: string | null
  href: string
}) {
  return (
    <a
      href={href}
      className="flex-shrink-0 w-20 group"
    >
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-1.5">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill className="object-cover" sizes="80px" />
        ) : (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <Gamepad2 className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>
      <p className="text-xs font-medium truncate text-center">{title}</p>
    </a>
  )
}

// Suggested games for empty favorites
function SuggestedGames({
  games,
  onAdd,
}: {
  games: GameData[]
  onAdd: (id: string) => void
}) {
  if (games.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Suggested for you</p>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {games.map(game => (
          <button
            key={game.id}
            onClick={() => onAdd(game.id)}
            className="flex-shrink-0 w-20 group text-left"
          >
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-1.5 ring-2 ring-transparent group-hover:ring-primary transition-all">
              {game.cover_url ? (
                <Image src={game.cover_url} alt={game.name} fill className="object-cover" sizes="80px" />
              ) : (
                <div className="absolute inset-0 bg-muted" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Star className="h-6 w-6 text-amber-400" />
              </div>
            </div>
            <p className="text-xs font-medium truncate text-center">{game.name}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

// Discover mode content
function DiscoverMode({
  followedGamesForPicker,
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
                  <Image src={game.cover_url} alt={game.name} fill className="object-cover" sizes="48px" />
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

// Add game modal
function AddGameModal({
  mode,
  followedGamesForPicker,
  onClose,
}: {
  mode: 'my-games' | 'discover'
  followedGamesForPicker: FollowedGame[]
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center animate-in fade-in duration-150">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-h-[80vh] bg-card border-t border-border rounded-t-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">Add Game</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {mode === 'discover' ? (
            <DiscoverMode followedGamesForPicker={followedGamesForPicker} onClose={onClose} />
          ) : (
            <div className="space-y-2">
              {followedGamesForPicker
                .filter(g => !g.inBacklog)
                .map(game => (
                  <div
                    key={game.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border"
                  >
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
                      {game.cover_url ? (
                        <Image src={game.cover_url} alt={game.name} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="absolute inset-0 bg-muted" />
                      )}
                    </div>
                    <span className="flex-1 text-sm font-medium truncate">{game.name}</span>
                    <button
                      onClick={async () => {
                        await addToBacklogWithStatus(game.id, 'backlog')
                        onClose()
                      }}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                    >
                      Add
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Mobile Showcase Grid for Favorites
function MobileShowcaseGrid({
  favoriteGames,
  allGames,
  favoriteGameIds,
}: {
  favoriteGames: GameData[]
  allGames: GameData[]
  favoriteGameIds: string[]
}) {
  const [showPicker, setShowPicker] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>(favoriteGameIds)
  const [isSaving, setIsSaving] = useState(false)

  if (favoriteGames.length === 0 && !showPicker) {
    return (
      <div className="text-center py-4">
        <button
          onClick={() => setShowPicker(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-sm font-medium border border-amber-500/20 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Favorites
        </button>
      </div>
    )
  }

  const handleToggleGame = (gameId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(gameId)) {
        return prev.filter(id => id !== gameId)
      }
      if (prev.length >= 5) return prev
      return [...prev, gameId]
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    await updateFavoriteGames(selectedIds)
    setIsSaving(false)
    setShowPicker(false)
  }

  if (showPicker) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{selectedIds.length}/5 selected</span>
          <button onClick={() => setShowPicker(false)} className="text-xs text-muted-foreground">
            Cancel
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedIds.map(id => {
              const game = allGames.find(g => g.id === id) || favoriteGames.find(g => g.id === id)
              if (!game) return null
              return (
                <button
                  key={id}
                  onClick={() => handleToggleGame(id)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 text-xs"
                >
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  <span className="truncate max-w-20">{game.name}</span>
                  <X className="h-3 w-3" />
                </button>
              )
            })}
          </div>
        )}

        <div className="max-h-32 overflow-y-auto space-y-1">
          {allGames.filter(g => !selectedIds.includes(g.id)).map(game => (
            <button
              key={game.id}
              onClick={() => handleToggleGame(game.id)}
              disabled={selectedIds.length >= 5}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 text-left"
            >
              <div className="relative h-8 w-6 rounded overflow-hidden flex-shrink-0">
                {game.cover_url ? (
                  <Image src={game.cover_url} alt="" fill className="object-cover" sizes="24px" />
                ) : (
                  <div className="absolute inset-0 bg-muted" />
                )}
              </div>
              <span className="flex-1 text-xs truncate">{game.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-2 rounded-lg bg-amber-500 text-white text-sm font-medium disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Favorites'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Showcase grid */}
      <div className="grid grid-cols-3 gap-3">
        {favoriteGames.map((game, index) => (
          <Link key={game.id} href={`/backlog/${game.id}`} className="group">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted ring-2 ring-amber-500/30">
              {game.cover_url ? (
                <Image src={game.cover_url} alt={game.name} fill className="object-cover" sizes="100px" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Gamepad2 className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-1.5 left-1.5 h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{index + 1}</span>
              </div>
              <div className="absolute top-1.5 right-1.5">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 drop-shadow" />
              </div>
            </div>
            <p className="mt-1.5 text-xs font-medium text-center truncate">{game.name}</p>
          </Link>
        ))}

        {/* Add slot if less than 5 */}
        {favoriteGames.length < 5 && (
          <button
            onClick={() => setShowPicker(true)}
            className="aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-amber-500/50 flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <Plus className="h-5 w-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Add</span>
          </button>
        )}
      </div>

      {/* Edit button */}
      {favoriteGames.length > 0 && (
        <button
          onClick={() => setShowPicker(true)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Edit favorites
        </button>
      )}
    </div>
  )
}

// Mobile Watchlist Grid with Activity
function MobileWatchlistGrid({ games }: { games: FollowedGameWithActivity[] }) {
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
          <div className="space-y-2">
            {withActivity.map(game => (
              <MobileWatchlistCard key={game.id} game={game} />
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
          <div className="space-y-2">
            {quiet.map(game => (
              <MobileWatchlistCard key={game.id} game={game} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Individual watchlist card
function MobileWatchlistCard({ game }: { game: FollowedGameWithActivity }) {
  const hasActivity = game.latestPatch !== null

  return (
    <Link
      href={`/backlog/${game.id}`}
      className="relative flex gap-3 p-3 rounded-xl border border-border bg-card/50 hover:bg-card transition-colors"
    >
      {/* Cover */}
      <div className="relative h-14 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
        {game.cover_url ? (
          <Image src={game.cover_url} alt={game.name} fill className="object-cover" sizes="40px" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="text-sm font-medium truncate">{game.name}</h3>

        {hasActivity ? (
          <div className="mt-1 flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
              <FileText className="h-2.5 w-2.5" />
              {game.patchCount} update{game.patchCount !== 1 ? 's' : ''}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {relativeDaysText(game.latestPatch!.published_at)}
            </span>
          </div>
        ) : (
          <p className="mt-1 text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            No recent updates
          </p>
        )}
      </div>

      {/* Activity dot */}
      {hasActivity && (
        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-400" />
      )}
    </Link>
  )
}
