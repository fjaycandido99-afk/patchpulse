'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Search,
  X,
  Home,
  FileText,
  Newspaper,
  Gamepad2,
  Bookmark,
  Bell,
  User,
  Settings,
  Calendar,
  TrendingUp,
  Sparkles,
  Tag,
  ArrowRight,
  Command,
  CornerDownLeft,
} from 'lucide-react'

type CommandType = 'navigation' | 'action' | 'game'

type Command = {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  type: CommandType
  action: () => void
  keywords?: string[]
}

type GameSuggestion = {
  id: string
  name: string
  cover_url: string | null
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [games, setGames] = useState<GameSuggestion[]>([])
  const [isLoadingGames, setIsLoadingGames] = useState(false)
  const [isBrowser, setIsBrowser] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  // Check if we're in a browser (not Capacitor native app)
  useEffect(() => {
    const isNative = typeof window !== 'undefined' &&
      (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    setIsBrowser(!isNative)
  }, [])

  // Navigation commands
  const navigationCommands: Command[] = useMemo(() => [
    {
      id: 'home',
      label: 'Go to Home',
      description: 'Dashboard overview',
      icon: <Home className="w-4 h-4" />,
      type: 'navigation',
      action: () => router.push('/home'),
      keywords: ['dashboard', 'main'],
    },
    {
      id: 'patches',
      label: 'Go to Patches',
      description: 'Latest patch notes',
      icon: <FileText className="w-4 h-4" />,
      type: 'navigation',
      action: () => router.push('/patches'),
      keywords: ['updates', 'notes', 'changelog'],
    },
    {
      id: 'news',
      label: 'Go to News',
      description: 'Gaming news feed',
      icon: <Newspaper className="w-4 h-4" />,
      type: 'navigation',
      action: () => router.push('/news'),
      keywords: ['articles', 'stories'],
    },
    {
      id: 'backlog',
      label: 'Go to My Games',
      description: 'Your game library',
      icon: <Gamepad2 className="w-4 h-4" />,
      type: 'navigation',
      action: () => router.push('/backlog'),
      keywords: ['library', 'collection', 'followed'],
    },
    {
      id: 'bookmarks',
      label: 'Go to Bookmarks',
      description: 'Saved content',
      icon: <Bookmark className="w-4 h-4" />,
      type: 'navigation',
      action: () => router.push('/bookmarks'),
      keywords: ['saved', 'favorites'],
    },
    {
      id: 'notifications',
      label: 'Go to Notifications',
      description: 'Your alerts',
      icon: <Bell className="w-4 h-4" />,
      type: 'navigation',
      action: () => router.push('/notifications'),
      keywords: ['alerts', 'updates'],
    },
    {
      id: 'deals',
      label: 'Go to Deals',
      description: 'Game discounts',
      icon: <Tag className="w-4 h-4" />,
      type: 'navigation',
      action: () => router.push('/deals'),
      keywords: ['sales', 'discounts', 'prices'],
    },
    {
      id: 'releases',
      label: 'Go to New Releases',
      description: 'Recently released games',
      icon: <Sparkles className="w-4 h-4" />,
      type: 'navigation',
      action: () => router.push('/releases'),
      keywords: ['new', 'launched'],
    },
    {
      id: 'upcoming',
      label: 'Go to Upcoming',
      description: 'Games coming soon',
      icon: <Calendar className="w-4 h-4" />,
      type: 'navigation',
      action: () => router.push('/upcoming'),
      keywords: ['soon', 'future', 'calendar'],
    },
    {
      id: 'insights',
      label: 'Go to Insights',
      description: 'AI-powered analysis',
      icon: <TrendingUp className="w-4 h-4" />,
      type: 'navigation',
      action: () => router.push('/insights'),
      keywords: ['analytics', 'ai', 'trends'],
    },
    {
      id: 'profile',
      label: 'Go to Profile',
      description: 'Your account settings',
      icon: <User className="w-4 h-4" />,
      type: 'navigation',
      action: () => router.push('/profile'),
      keywords: ['account', 'settings', 'preferences'],
    },
  ], [router])

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query) return navigationCommands.slice(0, 6)

    const lowerQuery = query.toLowerCase()
    return navigationCommands.filter(cmd =>
      cmd.label.toLowerCase().includes(lowerQuery) ||
      cmd.description?.toLowerCase().includes(lowerQuery) ||
      cmd.keywords?.some(k => k.includes(lowerQuery))
    )
  }, [query, navigationCommands])

  // Convert games to commands
  const gameCommands: Command[] = useMemo(() =>
    games.map(game => ({
      id: `game-${game.id}`,
      label: game.name,
      icon: game.cover_url ? (
        <Image
          src={game.cover_url}
          alt={game.name}
          width={20}
          height={28}
          className="w-5 h-7 rounded object-cover"
          unoptimized
        />
      ) : (
        <Gamepad2 className="w-4 h-4" />
      ),
      type: 'game' as CommandType,
      action: () => router.push(`/backlog/${game.id}`),
    }))
  , [games, router])

  // All visible items
  const allItems = useMemo(() => {
    const items: Command[] = []
    if (filteredCommands.length > 0) {
      items.push(...filteredCommands)
    }
    if (gameCommands.length > 0) {
      items.push(...gameCommands)
    }
    return items
  }, [filteredCommands, gameCommands])

  // Fetch games when query changes
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.length < 2) {
      setGames([])
      setIsLoadingGames(false)
      return
    }

    setIsLoadingGames(true)

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setGames(data.suggestions || [])
      } catch {
        setGames([])
      } finally {
        setIsLoadingGames(false)
      }
    }, 150)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(0)
  }, [allItems.length])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && allItems.length > 0) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      selectedEl?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex, allItems.length])

  const executeCommand = useCallback((command: Command) => {
    setIsOpen(false)
    setQuery('')
    command.action()
  }, [])

  // Keyboard shortcut handler
  useEffect(() => {
    if (!isBrowser) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
        if (!isOpen) {
          setTimeout(() => inputRef.current?.focus(), 50)
        }
        return
      }

      if (!isOpen) return

      // Close with Escape
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsOpen(false)
        setQuery('')
        return
      }

      // Navigate with arrows
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, allItems.length - 1))
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
        return
      }

      // Execute with Enter
      if (e.key === 'Enter' && allItems[selectedIndex]) {
        e.preventDefault()
        executeCommand(allItems[selectedIndex])
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isBrowser, isOpen, allItems, selectedIndex, executeCommand])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Don't render on native apps
  if (!isBrowser) return null

  return (
    <>
      {/* Trigger hint - shown in desktop header */}
      <button
        onClick={() => {
          setIsOpen(true)
          setTimeout(() => inputRef.current?.focus(), 50)
        }}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-muted-foreground text-sm hover:bg-white/10 hover:border-white/20 transition-all"
      >
        <Command className="w-3.5 h-3.5" />
        <span>Command</span>
        <kbd className="ml-2 px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-medium">
          ⌘K
        </kbd>
      </button>

      {/* Command palette modal */}
      {isOpen && (
        <div className="command-palette-overlay">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setIsOpen(false)
              setQuery('')
            }}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-xl mx-auto mt-[15vh] bg-[#0a0f1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground outline-none"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              <button
                onClick={() => {
                  setIsOpen(false)
                  setQuery('')
                }}
                className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
              {/* Navigation section */}
              {filteredCommands.length > 0 && (
                <div className="mb-2">
                  <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {query ? 'Pages' : 'Quick Navigation'}
                  </div>
                  {filteredCommands.map((cmd, index) => (
                    <button
                      key={cmd.id}
                      data-index={index}
                      onClick={() => executeCommand(cmd)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        selectedIndex === index
                          ? 'bg-primary/20 text-foreground'
                          : 'text-foreground/80 hover:bg-white/5'
                      }`}
                    >
                      <span className={`flex-shrink-0 ${selectedIndex === index ? 'text-primary' : 'text-muted-foreground'}`}>
                        {cmd.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-xs text-muted-foreground truncate">{cmd.description}</div>
                        )}
                      </div>
                      {selectedIndex === index && (
                        <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Games section */}
              {query.length >= 2 && (
                <div>
                  <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Games
                  </div>
                  {isLoadingGames ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  ) : gameCommands.length > 0 ? (
                    gameCommands.map((cmd, i) => {
                      const index = filteredCommands.length + i
                      return (
                        <button
                          key={cmd.id}
                          data-index={index}
                          onClick={() => executeCommand(cmd)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                            selectedIndex === index
                              ? 'bg-primary/20 text-foreground'
                              : 'text-foreground/80 hover:bg-white/5'
                          }`}
                        >
                          <span className="flex-shrink-0">
                            {cmd.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{cmd.label}</div>
                          </div>
                          {selectedIndex === index && (
                            <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                        </button>
                      )
                    })
                  ) : (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      No games found for &quot;{query}&quot;
                    </div>
                  )}
                </div>
              )}

              {/* Empty state */}
              {filteredCommands.length === 0 && query.length < 2 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No commands found
                </div>
              )}
            </div>

            {/* Footer with hints */}
            <div className="flex items-center justify-between gap-4 px-4 py-2.5 border-t border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px]">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px]">↵</kbd>
                  select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px]">esc</kbd>
                  close
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground/60">
                Browser only
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
