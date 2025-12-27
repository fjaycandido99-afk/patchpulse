'use client'

import Link from 'next/link'
import { Crown } from 'lucide-react'

type ProBadgeProps = {
  variant?: 'default' | 'small' | 'large'
  className?: string
}

/**
 * Clickable Pro badge that links to the subscription section
 * Use this for all Pro indicators throughout the app
 */
export function ProBadge({ variant = 'default', className = '' }: ProBadgeProps) {
  const sizeClasses = {
    small: 'px-1.5 py-0.5 text-[10px] gap-0.5',
    default: 'px-2 py-0.5 text-xs gap-1',
    large: 'px-3 py-1 text-sm gap-1.5',
  }

  const iconSizes = {
    small: 'w-2.5 h-2.5',
    default: 'w-3 h-3',
    large: 'w-4 h-4',
  }

  return (
    <Link
      href="/pricing"
      className={`
        inline-flex items-center rounded-full font-medium
        bg-gradient-to-r from-primary/20 to-violet-500/20
        border border-primary/30
        text-primary
        hover:from-primary/30 hover:to-violet-500/30
        hover:border-primary/50
        active:scale-95
        transition-all duration-200
        ${sizeClasses[variant]}
        ${className}
      `}
      title="View Pro subscription options"
    >
      <Crown className={iconSizes[variant]} />
      <span>Pro</span>
    </Link>
  )
}

/**
 * Non-link version for contexts where a link doesn't make sense
 * (e.g., already on the subscription page)
 */
export function ProBadgeStatic({ variant = 'default', className = '' }: ProBadgeProps) {
  const sizeClasses = {
    small: 'px-1.5 py-0.5 text-[10px] gap-0.5',
    default: 'px-2 py-0.5 text-xs gap-1',
    large: 'px-3 py-1 text-sm gap-1.5',
  }

  const iconSizes = {
    small: 'w-2.5 h-2.5',
    default: 'w-3 h-3',
    large: 'w-4 h-4',
  }

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        bg-gradient-to-r from-primary/20 to-violet-500/20
        border border-primary/30
        text-primary
        ${sizeClasses[variant]}
        ${className}
      `}
    >
      <Crown className={iconSizes[variant]} />
      <span>Pro</span>
    </span>
  )
}
