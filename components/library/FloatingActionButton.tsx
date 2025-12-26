'use client'

import { useState } from 'react'
import { Plus, X, Search, Gamepad2 } from 'lucide-react'

type FloatingActionButtonProps = {
  onSearchClick: () => void
  onDiscoverClick: () => void
}

export function FloatingActionButton({ onSearchClick, onDiscoverClick }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden fixed bottom-20 right-4 z-50 flex flex-col-reverse items-center gap-3">
      {/* Sub-actions */}
      {isOpen && (
        <>
          <button
            onClick={() => {
              setIsOpen(false)
              onSearchClick()
            }}
            className="flex items-center gap-2 pl-4 pr-5 py-3 rounded-full bg-card border border-border shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-200"
          >
            <Search className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Search</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false)
              onDiscoverClick()
            }}
            className="flex items-center gap-2 pl-4 pr-5 py-3 rounded-full bg-card border border-border shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-150"
          >
            <Gamepad2 className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium">Discover</span>
          </button>
        </>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          isOpen
            ? 'bg-muted rotate-45'
            : 'bg-primary hover:bg-primary/90'
        }`}
        aria-label={isOpen ? 'Close menu' : 'Add game'}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-foreground" />
        ) : (
          <Plus className="h-6 w-6 text-primary-foreground" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm -z-10 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
