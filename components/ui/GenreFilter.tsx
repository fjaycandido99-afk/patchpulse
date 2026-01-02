'use client'

import { useState, useRef, useEffect } from 'react'
import { Menu, Check, ChevronDown } from 'lucide-react'

// Main genres that appear in the database
const GENRES = [
  'All',
  'Action',
  'RPG',
  'Adventure',
  'FPS',
  'Strategy',
  'Simulation',
  'Horror',
  'Survival',
  'Puzzle',
  'Racing',
  'Sports',
  'Platformer',
  'Roguelike',
  'MMORPG',
  'MOBA',
  'Fighting',
  'Sandbox',
  'Battle Royale',
] as const

type GenreFilterProps = {
  selected: string
  onChange: (genre: string) => void
  className?: string
}

export function GenreFilter({ selected, onChange, className = '' }: GenreFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (genre: string) => {
    onChange(genre === 'All' ? '' : genre)
    setIsOpen(false)
  }

  const displayLabel = selected || 'All Genres'

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm"
      >
        <Menu className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium">{displayLabel}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 max-h-80 overflow-y-auto rounded-lg border border-border bg-card shadow-lg z-50">
          <div className="py-1">
            {GENRES.map((genre) => {
              const isSelected = (genre === 'All' && selected === '') || selected === genre
              return (
                <button
                  key={genre}
                  onClick={() => handleSelect(genre)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <span>{genre}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
