'use client'

import { Plus } from 'lucide-react'

type FloatingActionButtonProps = {
  onClick: () => void
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <div className="md:hidden fixed bottom-20 right-4 z-50">
      <button
        onClick={onClick}
        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center bg-primary hover:bg-primary/90 transition-colors"
        aria-label="Add game"
      >
        <Plus className="h-6 w-6 text-primary-foreground" />
      </button>
    </div>
  )
}
