import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type SectionHeaderProps = {
  title: string
  href?: string
  actionLabel?: string
  badge?: string | number
  glowLine?: boolean
  divider?: boolean
}

export function SectionHeader({
  title,
  href,
  actionLabel = 'View all',
  badge,
  glowLine = true,
  divider = true,
}: SectionHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight text-white">
            {title}
          </h2>
          {badge !== undefined && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/10 text-zinc-400">
              {badge}
            </span>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="group flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <span>{actionLabel}</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      {divider && (glowLine ? <GlowDivider /> : <SimpleDivider />)}
    </div>
  )
}

function SimpleDivider() {
  return (
    <div className="h-px w-full bg-white/10" />
  )
}

function GlowDivider() {
  return (
    <div className="relative h-0.5 w-full overflow-visible">
      {/* Base line - stronger */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
      {/* Inner glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />
      {/* Outer glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-md" />
    </div>
  )
}

// Standalone divider for use between sections
export function SectionDivider() {
  return (
    <div className="relative h-px w-full overflow-hidden my-8">
      {/* Base line */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/15 to-transparent blur-sm" />
    </div>
  )
}
