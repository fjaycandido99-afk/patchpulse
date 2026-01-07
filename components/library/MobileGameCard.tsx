'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Gamepad2, Play, Pause, Check, X, Clock, Users } from 'lucide-react'

type BacklogStatus = 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped'

type SteamStatsData = {
  playtime_minutes: number | null
  last_played_at: string | null
}

type MobileGameCardProps = {
  id: string
  href: string
  title: string
  imageUrl: string | null
  progress?: number
  status?: BacklogStatus
  hasNewPatch?: boolean
  patchCount?: number
  lastPlayedText?: string | null
  steamStats?: SteamStatsData | null
  playerCount?: string | null
}

const STATUS_ICON: Record<BacklogStatus, { icon: typeof Play; color: string }> = {
  playing: { icon: Play, color: 'bg-green-500' },
  paused: { icon: Pause, color: 'bg-amber-500' },
  backlog: { icon: Clock, color: 'bg-blue-500' },
  finished: { icon: Check, color: 'bg-purple-500' },
  dropped: { icon: X, color: 'bg-zinc-500' },
}

export function MobileGameCard({
  href,
  title,
  imageUrl,
  progress = 0,
  status,
  hasNewPatch,
  steamStats,
  playerCount,
}: MobileGameCardProps) {
  const statusConfig = status ? STATUS_ICON[status] : null
  const StatusIcon = statusConfig?.icon

  return (
    <Link href={href} className="relative group">
      {/* Cover image */}
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill className="object-cover" sizes="120px" unoptimized />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Gamepad2 className="h-6 w-6 text-muted-foreground" />
          </div>
        )}

        {/* Status badge - top left */}
        {statusConfig && StatusIcon && (
          <div className={`absolute top-1.5 left-1.5 w-5 h-5 rounded-full ${statusConfig.color} flex items-center justify-center`}>
            <StatusIcon className="h-3 w-3 text-white" />
          </div>
        )}

        {/* New patch indicator - top right */}
        {hasNewPatch && (
          <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        )}

        {/* Player count badge - bottom right */}
        {playerCount && (
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm">
            <Users className="h-2.5 w-2.5 text-emerald-400" />
            <span className="text-[9px] text-emerald-400 font-medium">{playerCount}</span>
          </div>
        )}

        {/* Progress bar - bottom */}
        {progress > 0 && !playerCount && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
            <div
              className="h-full bg-primary"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        )}
      </div>

      {/* Title */}
      <p className="mt-1 text-xs font-medium line-clamp-2 text-center leading-tight h-8">{title}</p>
    </Link>
  )
}
