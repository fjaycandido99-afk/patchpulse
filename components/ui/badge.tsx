import { ReactNode } from 'react'

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'patch'
  | 'news'
  | 'major'
  | 'medium'
  | 'minor'
  | 'rumor'
  | 'upcoming'
  | 'live'

type BadgeSize = 'xs' | 'sm' | 'md'

type BadgeProps = {
  children: ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  pulse?: boolean
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'text-zinc-100 bg-zinc-800/80 border-zinc-700/50',
  secondary: 'text-zinc-400 bg-zinc-800/50 border-zinc-700/30',
  patch: 'text-blue-300 bg-blue-500/15 border-blue-500/30',
  news: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
  major: 'text-red-300 bg-red-500/20 border-red-500/40',
  medium: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
  minor: 'text-green-300 bg-green-500/15 border-green-500/30',
  rumor: 'text-orange-300 bg-orange-500/15 border-orange-500/30',
  upcoming: 'text-violet-300 bg-violet-500/15 border-violet-500/30',
  live: 'text-rose-300 bg-rose-500/20 border-rose-500/40',
}

const sizeStyles: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  pulse = false,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border font-medium backdrop-blur-sm transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {children}
    </span>
  )
}

type ImpactBadgeProps = {
  score: number
  showScore?: boolean
  size?: BadgeSize
  className?: string
}

export function ImpactBadge({
  score,
  showScore = true,
  size = 'sm',
  className = '',
}: ImpactBadgeProps) {
  const variant: BadgeVariant =
    score >= 8 ? 'major' : score >= 5 ? 'medium' : 'minor'
  const label = score >= 8 ? 'Major' : score >= 5 ? 'Medium' : 'Minor'

  return (
    <Badge variant={variant} size={size} className={className}>
      {label}
      {showScore && (
        <span className="ml-0.5 opacity-70">
          {score}
          <span className="opacity-60">/10</span>
        </span>
      )}
    </Badge>
  )
}

type StatusBadgeProps = {
  status: 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped'
  size?: BadgeSize
  showDot?: boolean
  className?: string
}

const statusConfig: Record<StatusBadgeProps['status'], { color: string; label: string; dotColor: string }> = {
  playing: { color: 'text-green-300 bg-green-500/15 border-green-500/30', label: 'Playing', dotColor: 'bg-green-400' },
  paused: { color: 'text-amber-300 bg-amber-500/15 border-amber-500/30', label: 'Paused', dotColor: 'bg-amber-400' },
  backlog: { color: 'text-blue-300 bg-blue-500/15 border-blue-500/30', label: 'Backlog', dotColor: 'bg-blue-400' },
  finished: { color: 'text-violet-300 bg-violet-500/15 border-violet-500/30', label: 'Finished', dotColor: 'bg-violet-400' },
  dropped: { color: 'text-zinc-400 bg-zinc-500/15 border-zinc-500/30', label: 'Dropped', dotColor: 'bg-zinc-400' },
}

export function StatusBadge({
  status,
  size = 'sm',
  showDot = false,
  className = '',
}: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-medium backdrop-blur-sm ${config.color} ${sizeStyles[size]} ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      )}
      {config.label}
    </span>
  )
}

type CountBadgeProps = {
  count: number
  max?: number
  variant?: 'default' | 'primary' | 'danger'
  className?: string
}

const countVariantStyles: Record<NonNullable<CountBadgeProps['variant']>, string> = {
  default: 'text-zinc-300 bg-zinc-700/80',
  primary: 'text-primary bg-primary/20',
  danger: 'text-red-300 bg-red-500/20',
}

export function CountBadge({
  count,
  max = 99,
  variant = 'default',
  className = '',
}: CountBadgeProps) {
  const displayCount = count > max ? `${max}+` : count

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] font-bold rounded-full ${countVariantStyles[variant]} ${className}`}
    >
      {displayCount}
    </span>
  )
}
