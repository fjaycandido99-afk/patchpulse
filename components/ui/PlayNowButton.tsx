'use client'

import { useState, useEffect } from 'react'
import { Play, ExternalLink, AlertCircle } from 'lucide-react'
import { SteamIcon, XboxIcon } from './StoreLinkButtons'

type PlayNowButtonProps = {
  gameName: string
  steamAppId?: number | string | null
  xboxProductId?: string | null  // Microsoft Store product ID (e.g., "9NBLGGH4R5PB")
  hasXbox?: boolean  // True if game is available on Xbox (for fallback search)
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'outline'
  showLabel?: boolean
  className?: string
}

export function PlayNowButton({
  gameName,
  steamAppId,
  xboxProductId,
  hasXbox = false,
  size = 'md',
  variant = 'primary',
  showLabel = true,
  className = '',
}: PlayNowButtonProps) {
  const [isDesktopBrowser, setIsDesktopBrowser] = useState(false)
  const [launched, setLaunched] = useState(false)
  const [showNotInstalledHint, setShowNotInstalledHint] = useState(false)

  // Check if we're in a desktop browser (not native app, not mobile)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const isNative = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()

    // Check if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 0 && window.innerWidth < 1024)

    setIsDesktopBrowser(!isNative && !isMobile)
  }, [])

  // Xbox is available if we have a product ID OR the game is marked as available on Xbox
  const xboxAvailable = !!xboxProductId || hasXbox

  // Don't render if no launch options or not on desktop browser
  // Steam/Xbox protocols only work on desktop, not mobile browsers
  if (!isDesktopBrowser || (!steamAppId && !xboxAvailable)) {
    return null
  }

  const handleLaunch = (platform: 'steam' | 'xbox') => {
    let launchUrl = ''

    if (platform === 'steam' && steamAppId) {
      // Steam protocol to launch game directly
      launchUrl = `steam://run/${steamAppId}`
    } else if (platform === 'xbox') {
      if (xboxProductId) {
        // Direct launch via Xbox Game Pass app (Windows 10/11)
        launchUrl = `ms-xboxgamepass://play/?productId=${xboxProductId}`
      } else {
        // Fallback: Open Microsoft Store search for the game
        const searchQuery = encodeURIComponent(gameName)
        launchUrl = `ms-windows-store://search/?query=${searchQuery}`
      }
    }

    if (launchUrl) {
      // Open the protocol URL
      window.location.href = launchUrl
      setLaunched(true)

      // Show hint after a short delay
      setTimeout(() => {
        setShowNotInstalledHint(true)
      }, 1500)

      // Reset states after a few seconds
      setTimeout(() => {
        setLaunched(false)
        setShowNotInstalledHint(false)
      }, 8000)
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
  const hasXboxOption = xboxAvailable
  const hasMultiple = hasSteam && hasXboxOption

  // Not installed hint message
  const NotInstalledHint = () => showNotInstalledHint ? (
    <div className="flex items-start gap-2 mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 animate-in fade-in slide-in-from-top-1 duration-200">
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <p className="text-xs">
        Game not launching? Make sure it&apos;s installed on {hasSteam ? 'Steam' : 'Xbox/Microsoft Store'}.
      </p>
    </div>
  ) : null

  if (hasMultiple) {
    return (
      <div className={className}>
        <div className="flex gap-2">
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
        <NotInstalledHint />
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
  const buttonTitle = hasSteam
    ? `Launch ${gameName} on Steam`
    : xboxProductId
      ? `Launch ${gameName} on Xbox`
      : `Find ${gameName} in Microsoft Store`

  return (
    <div className={className}>
      <button
        onClick={() => handleLaunch(platform)}
        className={`${baseStyles} ${sizeClasses[size]} ${
          variant === 'primary' ? platformColor + ' text-white' : variantStyles.outline
        }`}
        title={buttonTitle}
      >
        {launched ? (
          <>
            <Play className={`${iconSizes[size]} fill-current`} />
            {showLabel && <span>Launching...</span>}
          </>
        ) : (
          <>
            <PlatformIcon className={iconSizes[size]} />
            {showLabel && (
              <span>
                {hasSteam
                  ? 'Play on Steam'
                  : xboxProductId
                    ? 'Play on Xbox'
                    : 'Find on Xbox'}
              </span>
            )}
          </>
        )}
      </button>
      <NotInstalledHint />
    </div>
  )
}

// Compact version for lists/cards
export function PlayNowIcon({
  steamAppId,
  xboxProductId,
  hasXbox = false,
  gameName,
  className = '',
}: {
  steamAppId?: number | string | null
  xboxProductId?: string | null
  hasXbox?: boolean
  gameName: string
  className?: string
}) {
  const [isDesktopBrowser, setIsDesktopBrowser] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const isNative = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()

    // Check if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 0 && window.innerWidth < 1024)

    setIsDesktopBrowser(!isNative && !isMobile)
  }, [])

  const xboxAvailable = !!xboxProductId || hasXbox

  // Only show on desktop browsers
  if (!isDesktopBrowser || (!steamAppId && !xboxAvailable)) {
    return null
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (steamAppId) {
      window.location.href = `steam://run/${steamAppId}`
    } else if (xboxProductId) {
      window.location.href = `ms-xboxgamepass://play/?productId=${xboxProductId}`
    } else if (hasXbox) {
      // Fallback: Open Microsoft Store search
      const searchQuery = encodeURIComponent(gameName)
      window.location.href = `ms-windows-store://search/?query=${searchQuery}`
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
