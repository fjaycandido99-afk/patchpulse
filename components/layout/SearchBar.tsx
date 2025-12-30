'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Clock, TrendingUp, Gamepad2, FileText, Newspaper } from 'lucide-react'
import { useRouter } from 'next/navigation'

const RECENT_SEARCHES_KEY = 'patchpulse_recent_searches'
const MAX_RECENT_SEARCHES = 5

type SearchCategory = 'all' | 'games' | 'patches' | 'news'

type SearchBarProps = {
  placeholder?: string
  className?: string
}

export function SearchBar({ placeholder = 'Search games, patches, news...', className = '' }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (saved) {
        setRecentSearches(JSON.parse(saved))
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [])

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

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

  const saveRecentSearch = useCallback((search: string) => {
    const trimmed = search.trim()
    if (!trimmed) return

    const updated = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(0, MAX_RECENT_SEARCHES)
    setRecentSearches(updated)

    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [recentSearches])

  const handleSearch = useCallback((searchQuery: string) => {
    const trimmed = searchQuery.trim()
    if (!trimmed) return

    saveRecentSearch(trimmed)
    setIsOpen(false)
    setQuery('')

    const categoryParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''
    router.push(`/search?q=${encodeURIComponent(trimmed)}${categoryParam}`)
  }, [saveRecentSearch, selectedCategory, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY)
    } catch (e) {
      // Ignore
    }
  }

  const closeSearch = () => {
    setIsOpen(false)
    setQuery('')
  }

  const categories: { id: SearchCategory; label: string; icon: typeof Gamepad2 }[] = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'patches', label: 'Patches', icon: FileText },
    { id: 'news', label: 'News', icon: Newspaper },
  ]

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => {
          setIsOpen(true)
          setTimeout(() => inputRef.current?.focus(), 100)
        }}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-foreground/80 text-sm hover:bg-white/15 hover:border-white/25 transition-all duration-200 ${className}`}
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">{placeholder}</span>
        <span className="sm:hidden">Search</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/10 text-xs text-muted-foreground ml-2">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </button>

      {/* Search overlay - single fixed container */}
      {isOpen && (
        <div className="search-overlay">
          {/* Backdrop for closing */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeSearch}
          />

          {/* Search container - normal flow inside */}
          <div className="relative z-10 w-full max-w-2xl mx-auto bg-[#0b1220] border-x border-b border-white/10 rounded-b-2xl shadow-2xl">

            {/* Search bar */}
            <div className="search-bar">
              <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <form onSubmit={handleSubmit} className="flex-1 mx-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-transparent text-lg text-foreground placeholder:text-muted-foreground outline-none"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </form>
              {/* Keyboard hint */}
              <span className="hidden sm:block text-xs text-muted-foreground/60 mr-3">
                esc to close
              </span>
              <button
                onClick={closeSearch}
                className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters row */}
            <div className="search-filters">
              {categories.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                )
              })}
            </div>

            {/* Results panel */}
            <div className="search-results">
              {query.length === 0 ? (
                <>
                  {/* Recent searches */}
                  {recentSearches.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Recent Searches
                        </h3>
                        <button
                          onClick={clearRecentSearches}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="space-y-1">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearch(search)}
                            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 text-left transition-colors"
                          >
                            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm text-foreground">{search}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending */}
                  <div>
                    <h3 className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Trending
                    </h3>
                    <div className="space-y-1">
                      {['Valorant patch', 'Fortnite update', 'Apex Legends', 'League of Legends'].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSearch(suggestion)}
                          className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 text-left transition-colors"
                        >
                          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-foreground">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    Press Enter to search for &quot;{query}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
