'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Clock, TrendingUp, Gamepad2, FileText, Newspaper, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const RECENT_SEARCHES_KEY = 'patchpulse_recent_searches'
const MAX_RECENT_SEARCHES = 5

type SearchCategory = 'all' | 'games' | 'patches' | 'news'

type Suggestion = {
  id: string
  name: string
  cover_url: string | null
  type: 'game'
}

type SearchBarProps = {
  placeholder?: string
  className?: string
}

export function SearchBar({ placeholder = 'Search games, patches, news...', className = '' }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
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

  // Keyboard shortcut: Escape to close (Cmd+K now handled by CommandPalette on desktop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  // Fetch suggestions with debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.length < 2) {
      setSuggestions([])
      setIsLoadingSuggestions(false)
      return
    }

    setIsLoadingSuggestions(true)

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setSuggestions(data.suggestions || [])
      } catch {
        setSuggestions([])
      } finally {
        setIsLoadingSuggestions(false)
      }
    }, 200) // 200ms debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

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
    setSuggestions([])
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    saveRecentSearch(suggestion.name)
    setIsOpen(false)
    setQuery('')
    setSuggestions([])
    router.push(`/backlog/${suggestion.id}`)
  }

  const categories: { id: SearchCategory; label: string; icon: typeof Gamepad2 }[] = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'patches', label: 'Patches', icon: FileText },
    { id: 'news', label: 'News', icon: Newspaper },
  ]

  return (
    <>
      {/* Search trigger button - Desktop polished */}
      <button
        onClick={() => {
          setIsOpen(true)
          setTimeout(() => inputRef.current?.focus(), 100)
        }}
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-foreground/70 text-sm hover:bg-white/10 hover:border-white/40 hover:text-foreground transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
      >
        <Search className="w-4 h-4 text-muted-foreground" />
        <span className="hidden sm:inline text-muted-foreground">{placeholder}</span>
        <span className="sm:hidden">Search</span>
        {/* Keyboard shortcut hint for desktop */}
        <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/60 bg-white/5 border border-white/10 rounded ml-2">
          <span className="text-xs">⌘</span>K
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
                <div>
                  {/* Loading state */}
                  {isLoadingSuggestions && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  {/* Suggestions */}
                  {!isLoadingSuggestions && suggestions.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Games
                      </h3>
                      <div className="space-y-1">
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 text-left transition-colors"
                          >
                            {suggestion.cover_url ? (
                              <Image
                                src={suggestion.cover_url}
                                alt={suggestion.name}
                                width={40}
                                height={54}
                                className="w-10 h-14 rounded-md object-cover flex-shrink-0"
                                unoptimized
                              />
                            ) : (
                              <div className="w-10 h-14 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                                <Gamepad2 className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            <span className="text-sm font-medium text-foreground">{suggestion.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No suggestions found */}
                  {!isLoadingSuggestions && suggestions.length === 0 && query.length >= 2 && (
                    <div className="text-center py-6">
                      <Gamepad2 className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No games found for &quot;{query}&quot;
                      </p>
                    </div>
                  )}

                  {/* Search all button */}
                  <button
                    onClick={() => handleSearch(query)}
                    className="flex items-center justify-center gap-2 w-full p-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium text-sm transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    Search all for &quot;{query}&quot;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
