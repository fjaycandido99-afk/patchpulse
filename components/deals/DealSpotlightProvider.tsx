'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { DealSpotlightPanel, type SpotlightDeal } from './DealSpotlightPanel'

type DealSpotlightContextType = {
  openDealSpotlight: (deal: SpotlightDeal, isPro?: boolean) => void
  closeDealSpotlight: () => void
}

const DealSpotlightContext = createContext<DealSpotlightContextType | null>(null)

export function useDealSpotlight() {
  const context = useContext(DealSpotlightContext)
  if (!context) {
    throw new Error('useDealSpotlight must be used within DealSpotlightProvider')
  }
  return context
}

export function DealSpotlightProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [deal, setDeal] = useState<SpotlightDeal | null>(null)
  const [isPro, setIsPro] = useState(false)

  const openDealSpotlight = useCallback((deal: SpotlightDeal, isPro = false) => {
    setDeal(deal)
    setIsPro(isPro)
    setIsOpen(true)
    // Prevent body scroll when panel is open
    document.body.style.overflow = 'hidden'
  }, [])

  const closeDealSpotlight = useCallback(() => {
    setIsOpen(false)
    document.body.style.overflow = ''
  }, [])

  return (
    <DealSpotlightContext.Provider value={{ openDealSpotlight, closeDealSpotlight }}>
      {children}
      {deal && (
        <DealSpotlightPanel
          deal={deal}
          isOpen={isOpen}
          onClose={closeDealSpotlight}
          isPro={isPro}
        />
      )}
    </DealSpotlightContext.Provider>
  )
}
