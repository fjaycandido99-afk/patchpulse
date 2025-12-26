'use client'

import { useEffect, useRef, useState } from 'react'

type Segment = {
  id: string
  label: string
  icon?: React.ReactNode
}

type SegmentedControlProps = {
  segments: Segment[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SegmentedControl({ segments, value, onChange, className = '' }: SegmentedControlProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const activeIndex = segments.findIndex(s => s.id === value)
    const buttons = container.querySelectorAll('button')
    const activeButton = buttons[activeIndex]

    if (activeButton) {
      setIndicatorStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      })
    }
  }, [value, segments])

  return (
    <div
      ref={containerRef}
      className={`relative flex p-1 rounded-xl bg-muted ${className}`}
    >
      {/* Sliding indicator */}
      <div
        className="absolute top-1 bottom-1 rounded-lg bg-background shadow-sm transition-all duration-200 ease-out"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
      />

      {/* Segments */}
      {segments.map((segment) => (
        <button
          key={segment.id}
          onClick={() => onChange(segment.id)}
          className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors z-10 ${
            value === segment.id
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground/80'
          }`}
        >
          {segment.icon}
          <span>{segment.label}</span>
        </button>
      ))}
    </div>
  )
}
