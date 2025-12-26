import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type SectionHeaderProps = {
  title: string
  href?: string
  actionLabel?: string
  badge?: string | number
  glowLine?: boolean
}

export function SectionHeader({
  title,
  href,
  actionLabel = 'View all',
  badge,
  glowLine = false,
}: SectionHeaderProps) {
  return (
    <div className="space-y-3">
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
      {glowLine && <GlowDivider />}
    </div>
  )
}

function GlowDivider() {
  return (
    <div className="relative h-px w-full overflow-hidden">
      {/* Base line */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-sm" />
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
