'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { GameSpotlightPanel, type SpotlightGame } from './GameSpotlightPanel'

type SpotlightContextType = {
  openSpotlight: (game: SpotlightGame, type: 'upcoming' | 'new') => void
  closeSpotlight: () => void
}

const SpotlightContext = createContext<SpotlightContextType | null>(null)

export function useSpotlight() {
  const context = useContext(SpotlightContext)
  if (!context) {
    throw new Error('useSpotlight must be used within SpotlightProvider')
  }
  return context
}

export function SpotlightProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [game, setGame] = useState<SpotlightGame | null>(null)
  const [type, setType] = useState<'upcoming' | 'new'>('upcoming')

  const openSpotlight = useCallback((game: SpotlightGame, type: 'upcoming' | 'new') => {
    setGame(game)
    setType(type)
    setIsOpen(true)
    // Prevent body scroll when panel is open
    document.body.style.overflow = 'hidden'
  }, [])

  const closeSpotlight = useCallback(() => {
    setIsOpen(false)
    document.body.style.overflow = ''
  }, [])

  return (
    <SpotlightContext.Provider value={{ openSpotlight, closeSpotlight }}>
      {children}
      {game && (
        <GameSpotlightPanel
          game={game}
          isOpen={isOpen}
          onClose={closeSpotlight}
          type={type}
        />
      )}
    </SpotlightContext.Provider>
  )
}
