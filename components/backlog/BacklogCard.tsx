import Link from 'next/link'
import Image from 'next/image'
import { FileText, Sparkles, Play, Pause, Clock, Check, X } from 'lucide-react'

type LatestPatch = {
  id: string
  title: string
  published_at: string
  summary_tldr: string | null
}

type BacklogStatus = 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped'

type BacklogCardProps = {
  href: string
  title: string
  progress: number
  nextNote?: string | null
  lastPlayedText?: string | null
  imageUrl?: string | null
  latestPatch?: LatestPatch | null
  patchCount?: number
  status?: BacklogStatus
  hasAISuggestion?: boolean
}

const STATUS_CONFIG: Record<BacklogStatus, {
  icon: typeof Play
  color: string
  bg: string
  label: string
  cardGradient: string
}> = {
  playing: { icon: Play, color: 'text-green-400', bg: 'bg-green-500/15 border-green-500/30', label: 'Playing', cardGradient: 'from-green-500/8 via-green-500/3 to-transparent' },
  paused: { icon: Pause, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', label: 'Paused', cardGradient: 'from-amber-500/8 via-amber-500/3 to-transparent' },
  backlog: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30', label: 'Backlog', cardGradient: 'from-blue-500/6 via-transparent to-transparent' },
  finished: { icon: Check, color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30', label: 'Done', cardGradient: 'from-purple-500/8 via-purple-500/3 to-transparent' },
  dropped: { icon: X, color: 'text-zinc-400', bg: 'bg-zinc-500/15 border-zinc-500/30', label: 'Dropped', cardGradient: 'from-zinc-500/5 via-transparent to-transparent' },
}

function getInitials(text: string): string {
  return text
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function ProgressBar({ value, thick = false, status }: { value: number; thick?: boolean; status?: BacklogStatus }) {
  const progressColor = status === 'playing'
    ? 'bg-green-500'
    : status === 'finished'
      ? 'bg-purple-500'
      : 'bg-primary'

  return (
    <div className={`w-full rounded-full bg-muted ${thick ? 'h-2.5' : 'h-1.5'}`}>
      <div
        className={`rounded-full transition-all ${thick ? 'h-2.5' : 'h-1.5'} ${progressColor}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

function formatPatchDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return `${Math.floor(diffDays / 30)}mo ago`
}

function StatusPill({ status }: { status: BacklogStatus }) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.color}`}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </div>
  )
}

export function BacklogCard({
  href,
  title,
  progress,
  nextNote,
  lastPlayedText,
  imageUrl,
  latestPatch,
  patchCount = 0,
  status,
  hasAISuggestion,
}: BacklogCardProps) {
  const statusConfig = status ? STATUS_CONFIG[status] : null
  const statusBorderColor = status === 'playing'
    ? 'hover:border-green-500/50'
    : status === 'paused'
      ? 'hover:border-amber-500/50'
      : status === 'finished'
        ? 'hover:border-purple-500/50'
        : 'hover:border-primary/50'
  const cardGradient = statusConfig ? `bg-gradient-to-r ${statusConfig.cardGradient}` : 'bg-card'

  return (
    <Link
      href={href}
      className={`group flex gap-3 rounded-xl border border-border p-3 transition-all ${cardGradient} ${statusBorderColor} active:bg-muted/50 active:scale-[0.99]`}
    >
      {/* Cover image with status gradient overlay */}
      <div className="relative w-16 h-20 sm:w-14 sm:h-16 flex-shrink-0 overflow-hidden rounded-lg">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="64px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 via-muted to-background">
            <span className="text-sm font-bold text-primary/30 select-none">
              {getInitials(title)}
            </span>
          </div>
        )}
        {/* AI suggestion indicator */}
        {hasAISuggestion && (
          <div className="absolute top-1 right-1 p-1 rounded bg-violet-500/90">
            <Sparkles className="h-2.5 w-2.5 text-white" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between overflow-hidden min-w-0 py-0.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium leading-tight truncate group-hover:text-primary transition-colors">
              {title}
            </h3>
            {/* Status pill */}
            {status && <StatusPill status={status} />}
          </div>

          {/* Progress bar with status color */}
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ProgressBar value={progress} thick status={status} />
              </div>
              <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                {progress}%
              </span>
            </div>
          </div>
        </div>

        {/* Meta info */}
        <div className="mt-1.5 space-y-1">
          {nextNote && (
            <p className="text-xs text-muted-foreground truncate">
              <span className="text-muted-foreground/60">Next:</span> {nextNote}
            </p>
          )}
          {lastPlayedText && !nextNote && (
            <p className="text-xs text-muted-foreground/70">{lastPlayedText}</p>
          )}

          {/* Contextual line - patch info */}
          {latestPatch && (
            <div className="flex items-center gap-1.5 text-xs text-blue-400/80">
              <FileText className="h-3 w-3 flex-shrink-0" />
              <span className="font-medium">{formatPatchDate(latestPatch.published_at)}</span>
              <span className="text-muted-foreground/50">·</span>
              <span className="truncate text-muted-foreground/80">{latestPatch.title}</span>
              {patchCount > 1 && (
                <span className="text-muted-foreground/60">+{patchCount - 1}</span>
              )}
            </div>
          )}

          {/* AI suggestion hint */}
          {hasAISuggestion && !latestPatch && (
            <div className="flex items-center gap-1.5 text-xs text-violet-400">
              <Sparkles className="h-3 w-3" />
              <span>Relevant update available</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export function BacklogCardCompact({
  href,
  title,
  progress,
  lastPlayedText,
  status,
  hasAISuggestion,
}: Omit<BacklogCardProps, 'imageUrl' | 'nextNote' | 'latestPatch' | 'patchCount'>) {
  const statusConfig = status ? STATUS_CONFIG[status] : null
  const statusBorderColor = status === 'playing'
    ? 'hover:border-green-500/50'
    : status === 'paused'
      ? 'hover:border-amber-500/50'
      : status === 'finished'
        ? 'hover:border-purple-500/50'
        : 'hover:border-primary/50'
  const cardGradient = statusConfig ? `bg-gradient-to-r ${statusConfig.cardGradient}` : 'bg-card'

  return (
    <Link
      href={href}
      className={`group flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-3 transition-all ${cardGradient} ${statusBorderColor} active:bg-muted/50`}
    >
      <div className="flex items-center gap-2 flex-1 overflow-hidden min-w-0">
        {/* Status pill */}
        {status && <StatusPill status={status} />}
        <div className="flex-1 overflow-hidden min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-medium leading-tight truncate group-hover:text-primary transition-colors">
              {title}
            </h3>
            {hasAISuggestion && (
              <Sparkles className="h-3 w-3 text-violet-400 flex-shrink-0" />
            )}
          </div>
          {lastPlayedText && (
            <p className="mt-0.5 text-xs text-muted-foreground/70 truncate">
              {lastPlayedText}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-16 hidden sm:block">
          <ProgressBar value={progress} status={status} />
        </div>
        <span className="text-xs font-medium text-muted-foreground w-8 text-right">
          {progress}%
        </span>
      </div>
    </Link>
  )
}
