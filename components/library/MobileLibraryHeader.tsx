'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'

type MobileLibraryHeaderProps = {
  title: string
  subtitle?: string
  onSearchChange?: (query: string) => void
}

export function MobileLibraryHeader({ title, subtitle, onSearchChange }: MobileLibraryHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onSearchChange?.(value)
  }

  const closeSearch = () => {
    setIsSearchOpen(false)
    setSearchQuery('')
    onSearchChange?.('')
  }

  return (
    <div
      className={`md:hidden sticky top-0 z-40 transition-all duration-200 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm' : 'bg-transparent'
      }`}
    >
      {/* Search overlay */}
      {isSearchOpen && (
        <div className="absolute inset-x-0 top-0 bg-background border-b border-border p-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search your library..."
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button
              onClick={closeSearch}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main header */}
      <div className={`px-4 transition-all duration-200 ${isScrolled ? 'py-2' : 'py-4'}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className={`font-bold tracking-tight transition-all duration-200 ${
              isScrolled ? 'text-lg' : 'text-2xl'
            }`}>
              {title}
            </h1>
            {!isScrolled && subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5 animate-in fade-in duration-200">
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
