'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { enableGuestMode, disableGuestMode, GUEST_LIMITS } from '@/lib/guest'

type GuestContextType = {
  isGuest: boolean
  enterGuestMode: () => void
  exitGuestMode: () => void
  limits: typeof GUEST_LIMITS
}

const GuestContext = createContext<GuestContextType | null>(null)

export function GuestProvider({ children, initialIsGuest = false }: { children: ReactNode; initialIsGuest?: boolean }) {
  // Trust the server's determination of guest status
  // The server checks both the cookie AND whether the user is logged in
  // We don't override this on the client since the server has the authoritative session info
  const [isGuest, setIsGuest] = useState(initialIsGuest)

  const enterGuestMode = useCallback(() => {
    enableGuestMode()
    setIsGuest(true)
  }, [])

  const exitGuestMode = useCallback(() => {
    disableGuestMode()
    setIsGuest(false)
  }, [])

  return (
    <GuestContext.Provider value={{ isGuest, enterGuestMode, exitGuestMode, limits: GUEST_LIMITS }}>
      {children}
    </GuestContext.Provider>
  )
}

export function useGuest() {
  const context = useContext(GuestContext)
  if (!context) {
    // Return safe defaults when not wrapped in provider
    return {
      isGuest: false,
      enterGuestMode: () => {},
      exitGuestMode: () => {},
      limits: GUEST_LIMITS,
    }
  }
  return context
}
