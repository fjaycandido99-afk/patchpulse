'use client'

import { useState, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'

type CopyButtonProps = {
  text: string
  label?: string
  className?: string
  size?: 'sm' | 'md'
  variant?: 'icon' | 'button'
}

export function CopyButton({
  text,
  label = 'Copy',
  className = '',
  size = 'md',
  variant = 'icon',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const [isBrowser, setIsBrowser] = useState(false)

  // Check if we're in a browser (not Capacitor native app)
  useEffect(() => {
    const isNative = typeof window !== 'undefined' &&
      (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    setIsBrowser(!isNative)
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
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
        onClick={handleCopy}
        title={copied ? 'Copied!' : label}
        className={`rounded-lg border transition-all ${
          copied
            ? 'border-green-500/30 bg-green-500/10 text-green-400'
            : 'border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground hover:border-white/20'
        } ${sizeClasses[size]} ${className}`}
      >
        {copied ? (
          <Check className={iconSize} />
        ) : (
          <Copy className={iconSize} />
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleCopy}
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
          <Copy className={iconSize} />
          {label}
        </>
      )}
    </button>
  )
}

// Copy section with header and copy button
type CopySectionProps = {
  title: string
  text: string
  children: React.ReactNode
  icon?: React.ReactNode
}

export function CopySection({ title, text, children, icon }: CopySectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <CopyButton text={text} label="Copy" size="sm" variant="button" />
      </div>
      {children}
    </div>
  )
}
