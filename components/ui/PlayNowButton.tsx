'use client'

import { useState, useEffect } from 'react'
import { Play, ExternalLink } from 'lucide-react'
import { SteamIcon, XboxIcon } from './StoreLinkButtons'

type PlayNowButtonProps = {
  gameName: string
  steamAppId?: number | string | null
  xboxTitleId?: string | null  // For future Xbox Game Pass support
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'outline'
  showLabel?: boolean
  className?: string
}

export function PlayNowButton({
  gameName,
  steamAppId,
  xboxTitleId,
  size = 'md',
  variant = 'primary',
  showLabel = true,
  className = '',
}: PlayNowButtonProps) {
  const [isBrowser, setIsBrowser] = useState(false)
  const [launched, setLaunched] = useState(false)

  // Check if we're in a browser (not Capacitor native app)
  useEffect(() => {
    const isNative = typeof window !== 'undefined' &&
      (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    setIsBrowser(!isNative)
  }, [])

  // Don't render if no launch IDs or on native app
  if (!isBrowser || (!steamAppId && !xboxTitleId)) {
    return null
  }

  const handleLaunch = (platform: 'steam' | 'xbox') => {
    let launchUrl = ''

    if (platform === 'steam' && steamAppId) {
      // Steam protocol to launch game directly
      launchUrl = `steam://run/${steamAppId}`
    } else if (platform === 'xbox' && xboxTitleId) {
      // Xbox Game Pass protocol (Windows 10/11)
      launchUrl = `ms-xboxgamepass://play/${xboxTitleId}`
    }

    if (launchUrl) {
      // Open the protocol URL
      window.location.href = launchUrl
      setLaunched(true)
      // Reset after a few seconds
      setTimeout(() => setLaunched(false), 3000)
    }
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2',
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const baseStyles = 'inline-flex items-center font-medium rounded-lg transition-all active:scale-95'

  const variantStyles = {
    primary: 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/20',
    outline: 'border border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20',
  }

  // If both Steam and Xbox are available, show both options
  const hasSteam = !!steamAppId
  const hasXbox = !!xboxTitleId
  const hasMultiple = hasSteam && hasXbox

  if (hasMultiple) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <button
          onClick={() => handleLaunch('steam')}
          className={`${baseStyles} ${sizeClasses[size]} bg-[#1b2838] hover:bg-[#2a475e] text-white`}
          title={`Launch ${gameName} on Steam`}
        >
          <SteamIcon className={iconSizes[size]} />
          {showLabel && <span>Play on Steam</span>}
        </button>
        <button
          onClick={() => handleLaunch('xbox')}
          className={`${baseStyles} ${sizeClasses[size]} bg-[#107c10] hover:bg-[#0e6b0e] text-white`}
          title={`Launch ${gameName} on Xbox`}
        >
          <XboxIcon className={iconSizes[size]} />
          {showLabel && <span>Play on Xbox</span>}
        </button>
      </div>
    )
  }

  // Single platform
  const platform = hasSteam ? 'steam' : 'xbox'
  const platformLabel = hasSteam ? 'Steam' : 'Xbox'
  const PlatformIcon = hasSteam ? SteamIcon : XboxIcon
  const platformColor = hasSteam
    ? 'bg-[#1b2838] hover:bg-[#2a475e]'
    : 'bg-[#107c10] hover:bg-[#0e6b0e]'

  return (
    <button
      onClick={() => handleLaunch(platform)}
      className={`${baseStyles} ${sizeClasses[size]} ${
        variant === 'primary' ? platformColor + ' text-white' : variantStyles.outline
      } ${className}`}
      title={`Launch ${gameName} on ${platformLabel}`}
    >
      {launched ? (
        <>
          <Play className={`${iconSizes[size]} fill-current`} />
          {showLabel && <span>Launching...</span>}
        </>
      ) : (
        <>
          <PlatformIcon className={iconSizes[size]} />
          {showLabel && <span>Play on {platformLabel}</span>}
        </>
      )}
    </button>
  )
}

// Compact version for lists/cards
export function PlayNowIcon({
  steamAppId,
  xboxTitleId,
  gameName,
  className = '',
}: {
  steamAppId?: number | string | null
  xboxTitleId?: string | null
  gameName: string
  className?: string
}) {
  const [isBrowser, setIsBrowser] = useState(false)

  useEffect(() => {
    const isNative = typeof window !== 'undefined' &&
      (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    setIsBrowser(!isNative)
  }, [])

  if (!isBrowser || (!steamAppId && !xboxTitleId)) {
    return null
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (steamAppId) {
      window.location.href = `steam://run/${steamAppId}`
    } else if (xboxTitleId) {
      window.location.href = `ms-xboxgamepass://play/${xboxTitleId}`
    }
  }

  const Icon = steamAppId ? SteamIcon : XboxIcon
  const label = steamAppId ? 'Launch on Steam' : 'Launch on Xbox'

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors ${className}`}
      title={label}
    >
      <Play className="w-4 h-4 fill-current" />
    </button>
  )
}
