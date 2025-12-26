'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

type CollapsibleSectionProps = {
  id: string
  title: string
  icon: React.ReactNode
  count?: number
  defaultOpen?: boolean
  children: React.ReactNode
}

export function CollapsibleSection({
  id,
  title,
  icon,
  count,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // Persist state in localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`library_section_${id}`)
    if (stored !== null) {
      setIsOpen(stored === 'true')
    }
  }, [id])

  const toggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    localStorage.setItem(`library_section_${id}`, String(newState))
  }

  return (
    <section className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-base font-semibold">{title}</h3>
          {count !== undefined && (
            <span className="text-sm text-muted-foreground">({count})</span>
          )}
        </div>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-200 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 pt-0">{children}</div>
        </div>
      </div>
    </section>
  )
}
