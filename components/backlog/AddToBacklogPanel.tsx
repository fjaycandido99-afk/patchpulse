'use client'

import { useState, useTransition, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Star, Play, Pause, Check, Search, Gamepad2 } from 'lucide-react'
import { addToBacklog, searchGamesForBacklog, followAndAddToBacklog, addToBacklogWithStatus } from '@/app/(main)/backlog/actions'

type BacklogStatus = 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped'

type FollowedGame = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  inBacklog: boolean
  backlogStatus: BacklogStatus | null
}

type SearchResult = {
  id: string
  name: string
  slug: string
  cover_url: string | null
}

type AddToBacklogPanelProps = {
  games: FollowedGame[]
}

const STATUS_CONFIG: Record<BacklogStatus, { label: string; icon: typeof Play; color: string; bg: string }> = {
  playing: { label: 'Playing', icon: Play, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  paused: { label: 'Paused', icon: Pause, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  backlog: { label: 'Backlog', icon: Plus, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  finished: { label: 'Done', icon: Check, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  dropped: { label: 'Drop', icon: Check, color: 'text-zinc-400', bg: 'bg-zinc-500/10 border-zinc-500/30' },
}

type SearchMode = 'followed' | 'all'

function getInitials(text: string): string {
  return text
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function GameThumbnail({ url, name }: { url: string | null; name: string }) {
  return (
    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
      {url ? (
        <Image
          src={url}
          alt={name}
          fill
          className="object-cover"
          sizes="48px"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 via-muted to-background">
          <span className="text-xs font-bold text-primary/40 select-none">
            {getInitials(name)}
          </span>
        </div>
      )}
    </div>
  )
}

function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
  disabled = false,
  isActive = false,
}: {
  icon: typeof Play
  label: string
  onClick: () => void
  variant?: 'default' | 'primary' | 'success'
  disabled?: boolean
  isActive?: boolean
}) {
  const baseStyles = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
  const variants = {
    default: isActive
      ? 'bg-primary/20 text-primary border border-primary/30'
      : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground border border-transparent',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    success: 'bg-green-500/20 text-green-400 border border-green-500/30',
  }

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyles} ${variants[variant]}`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

export function AddToBacklogPanel({ games }: AddToBacklogPanelProps) {
  const [search, setSearch] = useState('')
  const [searchMode, setSearchMode] = useState<SearchMode>('followed')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [addedIds, setAddedIds] = useState<Map<string, BacklogStatus>>(new Map())
  const [isFocused, setIsFocused] = useState(false)

  // Debounced search for all games mode
  useEffect(() => {
    if (searchMode !== 'all') return
    if (search.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchGamesForBacklog(search)
        setSearchResults(results)
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search, searchMode])

  function handleModeChange(mode: SearchMode) {
    setSearchMode(mode)
    setSearch('')
    setSearchResults([])
    setMessage(null)
  }

  // Filter followed games locally
  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleAddWithStatus(gameId: string, gameName: string, status: BacklogStatus, isFromSearch = false) {
    setMessage(null)
    setPendingId(gameId)
    setPendingAction(status)

    startTransition(async () => {
      try {
        if (isFromSearch) {
          await followAndAddToBacklog(gameId)
        } else {
          await addToBacklogWithStatus(gameId, status)
        }
        setAddedIds((prev) => new Map(prev).set(gameId, status))
        const statusLabel = STATUS_CONFIG[status].label
        setMessage({ type: 'success', text: `${gameName} → ${statusLabel}` })
        if (isFromSearch) {
          setSearchResults((prev) => prev.filter((g) => g.id !== gameId))
        }
        setTimeout(() => setMessage(null), 2000)
      } catch {
        setMessage({ type: 'error', text: 'Failed to add' })
      } finally {
        setPendingId(null)
        setPendingAction(null)
      }
    })
  }

  const gamesNotInBacklog = filteredGames.filter(
    (g) => !g.inBacklog && !addedIds.has(g.id)
  )
  const gamesInBacklog = filteredGames.filter(
    (g) => g.inBacklog || addedIds.has(g.id)
  )

  // Filter out games already in backlog from search results
  const followedGameIds = new Set(games.map((g) => g.id))
  const filteredSearchResults = searchResults.filter(
    (g) => !followedGameIds.has(g.id) && !addedIds.has(g.id)
  )

  const showResults = search.length > 0 || isFocused

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base">Add to Library</h3>
            <p className="text-xs text-muted-foreground">Search and organize your games</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Mode toggle */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          <button
            onClick={() => handleModeChange('followed')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              searchMode === 'followed'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Gamepad2 className="h-4 w-4" />
            My Games
          </button>
          <button
            onClick={() => handleModeChange('all')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              searchMode === 'all'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Search className="h-4 w-4" />
            Discover
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={searchMode === 'followed' ? 'Filter your games...' : 'Search any game...'}
            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
          />
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            <Check className="h-4 w-4" />
            {message.text}
          </div>
        )}

        {/* Results */}
        {showResults && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {searchMode === 'followed' ? (
              <>
                {gamesNotInBacklog.length === 0 && gamesInBacklog.length === 0 ? (
                  <div className="text-center py-6">
                    <Gamepad2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {games.length === 0
                        ? 'No followed games yet. Try searching all games!'
                        : 'No games match your search.'}
                    </p>
                  </div>
                ) : (
                  <>
                    {gamesNotInBacklog.map((game) => (
                      <GameRow
                        key={game.id}
                        game={game}
                        pendingId={pendingId}
                        pendingAction={pendingAction}
                        isPending={isPending}
                        onAction={(status) => handleAddWithStatus(game.id, game.name, status)}
                      />
                    ))}

                    {gamesInBacklog.length > 0 && gamesNotInBacklog.length > 0 && (
                      <div className="border-t border-border my-3 pt-3">
                        <p className="text-xs text-muted-foreground mb-2">Already in library</p>
                      </div>
                    )}

                    {gamesInBacklog.map((game) => {
                      const status = addedIds.get(game.id) || game.backlogStatus
                      const config = status ? STATUS_CONFIG[status] : null
                      return (
                        <div
                          key={game.id}
                          className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 opacity-70"
                        >
                          <GameThumbnail url={game.cover_url} name={game.name} />
                          <span className="flex-1 text-sm truncate">{game.name}</span>
                          {config && (
                            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.color}`}>
                              {config.label}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </>
                )}
              </>
            ) : (
              <>
                {isSearching ? (
                  <div className="text-center py-6">
                    <div className="h-6 w-6 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-sm text-muted-foreground">Searching...</p>
                  </div>
                ) : search.length < 2 ? (
                  <div className="text-center py-6">
                    <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Type to search any game</p>
                  </div>
                ) : filteredSearchResults.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">No games found for "{search}"</p>
                  </div>
                ) : (
                  filteredSearchResults.map((game) => (
                    <GameRow
                      key={game.id}
                      game={game}
                      pendingId={pendingId}
                      pendingAction={pendingAction}
                      isPending={isPending}
                      onAction={(status) => handleAddWithStatus(game.id, game.name, status, true)}
                      isFromSearch
                    />
                  ))
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function GameRow({
  game,
  pendingId,
  pendingAction,
  isPending,
  onAction,
  isFromSearch = false,
}: {
  game: { id: string; name: string; cover_url: string | null }
  pendingId: string | null
  pendingAction: string | null
  isPending: boolean
  onAction: (status: BacklogStatus) => void
  isFromSearch?: boolean
}) {
  const isThisGamePending = pendingId === game.id

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 hover:border-primary/30 transition-colors">
      <GameThumbnail url={game.cover_url} name={game.name} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{game.name}</p>
        {isFromSearch && (
          <p className="text-xs text-muted-foreground">Will follow + add</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-1.5">
        <QuickActionButton
          icon={Play}
          label="Play"
          onClick={() => onAction('playing')}
          disabled={isPending}
          isActive={isThisGamePending && pendingAction === 'playing'}
          variant={isThisGamePending && pendingAction === 'playing' ? 'default' : 'default'}
        />
        <QuickActionButton
          icon={Plus}
          label="Backlog"
          onClick={() => onAction('backlog')}
          disabled={isPending}
          variant="primary"
        />
      </div>
    </div>
  )
}
