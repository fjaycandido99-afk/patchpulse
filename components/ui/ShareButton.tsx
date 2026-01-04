'use client'

import { useState, useEffect } from 'react'
import { Link2, Check, Share2 } from 'lucide-react'

type ShareButtonProps = {
  url?: string  // If not provided, uses current URL
  title?: string
  className?: string
  size?: 'sm' | 'md'
  variant?: 'icon' | 'button'
}

export function ShareButton({
  url,
  title,
  className = '',
  size = 'md',
  variant = 'icon',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [isBrowser, setIsBrowser] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')

  // Check if we're in a browser (not Capacitor native app)
  useEffect(() => {
    const isNative = typeof window !== 'undefined' &&
      (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    setIsBrowser(!isNative)
    setCurrentUrl(window.location.href)
  }, [])

  const shareUrl = url || currentUrl

  const handleShare = async () => {
    // Try native share first (mobile browsers)
    if (navigator.share && title) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        })
        return
      } catch {
        // Fall through to clipboard copy
      }
    }

    // Fallback to clipboard copy
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Don't render on native apps
  if (!isBrowser) return null

  const sizeClasses = {
    sm: variant === 'icon' ? 'p-1.5' : 'px-2.5 py-1.5 text-xs',
    md: variant === 'icon' ? 'p-2' : 'px-3 py-2 text-sm',
  }

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        title={copied ? 'Link copied!' : 'Copy link'}
        className={`rounded-lg border transition-all ${
          copied
            ? 'border-green-500/30 bg-green-500/10 text-green-400'
            : 'border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground hover:border-white/20'
        } ${sizeClasses[size]} ${className}`}
      >
        {copied ? (
          <Check className={iconSize} />
        ) : (
          <Link2 className={iconSize} />
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-1.5 rounded-lg border font-medium transition-all ${
        copied
          ? 'border-green-500/30 bg-green-500/10 text-green-400'
          : 'border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground hover:border-white/20'
      } ${sizeClasses[size]} ${className}`}
    >
      {copied ? (
        <>
          <Check className={iconSize} />
          Copied!
        </>
      ) : (
        <>
          <Share2 className={iconSize} />
          Share
        </>
      )}
    </button>
  )
}
