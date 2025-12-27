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

type BadgeSize = 'sm' | 'md'

type BadgeProps = {
  children: ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'text-zinc-200',
  secondary: 'text-zinc-400',
  patch: 'text-blue-300/90',
  news: 'text-emerald-300/90',
  major: 'text-red-300/90',
  medium: 'text-amber-300/90',
  minor: 'text-green-300/90',
  rumor: 'text-orange-300/90',
  upcoming: 'text-violet-300/90',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border border-white/10 bg-white/5 font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
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
        <span className="ml-1 opacity-60">
          {score}
          <span className="opacity-50">/10</span>
        </span>
      )}
    </Badge>
  )
}

type StatusBadgeProps = {
  status: 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped'
  size?: BadgeSize
  className?: string
}

const statusStyles: Record<StatusBadgeProps['status'], string> = {
  playing: 'text-green-300/90',
  paused: 'text-amber-300/90',
  backlog: 'text-blue-300/90',
  finished: 'text-violet-300/90',
  dropped: 'text-zinc-400',
}

const statusLabels: Record<StatusBadgeProps['status'], string> = {
  playing: 'Playing',
  paused: 'Paused',
  backlog: 'Backlog',
  finished: 'Finished',
  dropped: 'Dropped',
}

export function StatusBadge({
  status,
  size = 'sm',
  className = '',
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border border-white/10 bg-white/5 font-medium ${statusStyles[status]} ${sizeStyles[size]} ${className}`}
    >
      {statusLabels[status]}
    </span>
  )
}
