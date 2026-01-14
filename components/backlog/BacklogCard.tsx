import Link from 'next/link'
import Image from 'next/image'
import { FileText, Sparkles, Play, Pause, Clock, Check, X, Gamepad2, Calendar } from 'lucide-react'

type LatestPatch = {
  id: string
  title: string
  published_at: string
  summary_tldr: string | null
}

type SteamStatsData = {
  playtime_minutes: number | null
  last_played_at: string | null
}

type BacklogStatus = 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped'

type BacklogCardProps = {
  href: string
  title: string
  nextNote?: string | null
  lastPlayedText?: string | null
  imageUrl?: string | null
  latestPatch?: LatestPatch | null
  patchCount?: number
  status?: BacklogStatus
  hasAISuggestion?: boolean
  steamAppId?: number | null
  steamStats?: SteamStatsData | null
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

function formatPlaytime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours < 100) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }
  return `${hours}h`
}

function formatLastPlayed(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function StatusPill({ status }: { status: BacklogStatus }) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm transition-all duration-200 ${config.bg} ${config.color}`}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </div>
  )
}

export function BacklogCard({
  href,
  title,
  nextNote,
  lastPlayedText,
  imageUrl,
  latestPatch,
  patchCount = 0,
  status,
  hasAISuggestion,
  steamAppId,
  steamStats,
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

  const hasSteamData = steamAppId && (steamStats?.playtime_minutes || steamStats?.last_played_at)

  return (
    <Link
      href={href}
      className={`group flex gap-3 sm:gap-4 rounded-2xl border border-white/10 p-3 sm:p-4 transition-all duration-300 h-[140px] sm:h-auto backdrop-blur-sm ${cardGradient} ${statusBorderColor} hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]`}
    >
      {/* Cover image - locked 3:4 ratio for consistency */}
      <div className="relative w-[88px] sm:w-24 flex-shrink-0 overflow-hidden rounded-lg shadow-lg aspect-[3/4]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="96px"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 via-muted to-background">
            <span className="text-lg font-bold text-primary/30 select-none">
              {getInitials(title)}
            </span>
          </div>
        )}
        {/* AI suggestion indicator */}
        {hasAISuggestion && (
          <div className="absolute top-1.5 right-1.5 p-1 rounded-md bg-violet-500/90 shadow-sm">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      {/* Right side - Steam library style layout */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 py-0.5">
        {/* Game title and status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm sm:text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          {status && <StatusPill status={status} />}
        </div>

        {/* Playtime & Last Played */}
        {hasSteamData && (
          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
            {steamStats?.playtime_minutes && steamStats.playtime_minutes > 0 && (
              <div className="flex items-center gap-1">
                <Gamepad2 className="h-3 w-3" />
                <span>{formatPlaytime(steamStats.playtime_minutes)}</span>
              </div>
            )}
            {steamStats?.last_played_at && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span suppressHydrationWarning>{formatLastPlayed(steamStats.last_played_at)}</span>
              </div>
            )}
          </div>
        )}

        {/* Metadata - fixed height footer */}
        <div className="mt-auto">
          {/* Fixed height metadata row - always renders to maintain height */}
          <div className="h-5 mt-1 flex items-center">
            {latestPatch ? (
              <div className="flex items-center gap-1.5 text-xs text-blue-400/80 truncate">
                <FileText className="h-3 w-3 flex-shrink-0" />
                <span className="font-medium" suppressHydrationWarning>{formatPatchDate(latestPatch.published_at)}</span>
                {patchCount > 1 && (
                  <span className="text-muted-foreground/60">+{patchCount - 1} more</span>
                )}
              </div>
            ) : hasAISuggestion ? (
              <div className="flex items-center gap-1.5 text-xs text-violet-400">
                <Sparkles className="h-3 w-3" />
                <span>Update available</span>
              </div>
            ) : nextNote ? (
              <p className="text-xs text-muted-foreground truncate">
                <span className="text-muted-foreground/60">Next:</span> {nextNote}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  )
}

export function BacklogCardCompact({
  href,
  title,
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
      className={`group flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-3 transition-all duration-200 backdrop-blur-sm ${cardGradient} ${statusBorderColor} hover:shadow-md hover:shadow-primary/5 active:scale-[0.98]`}
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

    </Link>
  )
}
