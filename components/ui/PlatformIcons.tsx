'use client'

import { useState } from 'react'
import {
  Monitor,
  Gamepad2,
  Smartphone,
  type LucideIcon,
} from 'lucide-react'

export type Platform = {
  id: string
  name: string
  icon_url?: string | null
  color?: string | null
}

type PlatformIconsProps = {
  platforms: Platform[]
  maxVisible?: number
  size?: 'sm' | 'md'
  className?: string
  showTooltip?: boolean
}

// Fallback icons when custom SVG not available
const FALLBACK_ICONS: Record<string, LucideIcon> = {
  pc: Monitor,
  steam: Monitor,
  epic: Monitor,
  ps5: Gamepad2,
  ps4: Gamepad2,
  xbox_series: Gamepad2,
  xbox_one: Gamepad2,
  switch: Gamepad2,
  mobile: Smartphone,
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
}

const containerSizes = {
  sm: 'gap-1',
  md: 'gap-1.5',
}

function PlatformIcon({
  platform,
  size = 'sm',
  showTooltip = true,
}: {
  platform: Platform
  size?: 'sm' | 'md'
  showTooltip?: boolean
}) {
  const [showLabel, setShowLabel] = useState(false)
  const FallbackIcon = FALLBACK_ICONS[platform.id] || Gamepad2

  return (
    <div
      className="relative"
      onMouseEnter={() => showTooltip && setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
    >
      {platform.icon_url ? (
        // Custom SVG icon
        <img
          src={platform.icon_url}
          alt={platform.name}
          className={`${sizeClasses[size]} opacity-60 hover:opacity-100 transition-opacity`}
          style={{ filter: 'brightness(0) invert(0.7)' }} // Monochrome gray
        />
      ) : (
        // Fallback Lucide icon
        <FallbackIcon
          className={`${sizeClasses[size]} text-zinc-500 hover:text-zinc-300 transition-colors`}
        />
      )}

      {/* Tooltip */}
      {showLabel && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-xs font-medium text-white bg-zinc-800 rounded shadow-lg whitespace-nowrap z-10">
          {platform.name}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
        </div>
      )}
    </div>
  )
}

export function PlatformIcons({
  platforms,
  maxVisible = 3,
  size = 'sm',
  className = '',
  showTooltip = true,
}: PlatformIconsProps) {
  if (!platforms || platforms.length === 0) {
    return null
  }

  const visiblePlatforms = platforms.slice(0, maxVisible)
  const remainingCount = platforms.length - maxVisible

  return (
    <div className={`flex items-center ${containerSizes[size]} ${className}`}>
      {visiblePlatforms.map((platform) => (
        <PlatformIcon
          key={platform.id}
          platform={platform}
          size={size}
          showTooltip={showTooltip}
        />
      ))}

      {remainingCount > 0 && (
        <span className="text-xs font-medium text-zinc-500 ml-0.5">
          +{remainingCount}
        </span>
      )}
    </div>
  )
}

// Inline version for meta rows
export function PlatformIconsInline({
  platforms,
  className = '',
}: {
  platforms: Platform[]
  className?: string
}) {
  if (!platforms || platforms.length === 0) {
    return null
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {platforms.slice(0, 4).map((platform) => {
        const FallbackIcon = FALLBACK_ICONS[platform.id] || Gamepad2
        return platform.icon_url ? (
          <img
            key={platform.id}
            src={platform.icon_url}
            alt={platform.name}
            className="w-3 h-3 opacity-50"
            style={{ filter: 'brightness(0) invert(0.5)' }}
          />
        ) : (
          <FallbackIcon
            key={platform.id}
            className="w-3 h-3 text-zinc-600"
          />
        )
      })}
    </span>
  )
}

// Platform badge for showing on cards
export function PlatformBadge({
  platforms,
  className = '',
}: {
  platforms: Platform[]
  className?: string
}) {
  if (!platforms || platforms.length === 0) {
    return null
  }

  const primary = platforms[0]
  const FallbackIcon = FALLBACK_ICONS[primary.id] || Gamepad2

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ${className}`}
    >
      {primary.icon_url ? (
        <img
          src={primary.icon_url}
          alt={primary.name}
          className="w-3 h-3 opacity-70"
          style={{ filter: 'brightness(0) invert(0.7)' }}
        />
      ) : (
        <FallbackIcon className="w-3 h-3 text-zinc-400" />
      )}
      <span className="text-[10px] font-medium text-zinc-400">
        {platforms.length > 1 ? `${primary.id.toUpperCase()} +${platforms.length - 1}` : primary.id.toUpperCase()}
      </span>
    </div>
  )
}
