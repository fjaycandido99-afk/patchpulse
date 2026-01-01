'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Gamepad2, Calendar, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type GameCardProps = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  release_date: string | null
  days_since?: number
  days_until?: number
  genre?: string | null
  is_live_service?: boolean
  platforms?: string[]
  variant?: 'default' | 'compact'
}

export function GameCard({
  id,
  name,
  slug,
  cover_url,
  release_date,
  days_since,
  days_until,
  genre,
  is_live_service,
  variant = 'default',
}: GameCardProps) {
  const isUpcoming = days_until !== undefined && days_until > 0
  const isReleased = days_since !== undefined

  // Format relative date
  const getRelativeDate = () => {
    if (isUpcoming) {
      if (days_until === 0) return 'Releases today'
      if (days_until === 1) return 'Releases tomorrow'
      if (days_until <= 7) return `In ${days_until} days`
      if (days_until <= 30) return `In ${Math.ceil(days_until / 7)} weeks`
      return `In ${Math.ceil(days_until / 30)} months`
    }
    if (isReleased) {
      if (days_since === 0) return 'Released today'
      if (days_since === 1) return 'Released yesterday'
      if (days_since <= 7) return `Released ${days_since} days ago`
      if (days_since <= 14) return 'Released last week'
      return `Released ${Math.ceil(days_since / 7)} weeks ago`
    }
    if (release_date) {
      return new Date(release_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }
    return 'TBA'
  }

  // Countdown badge for upcoming games
  const getCountdownBadge = () => {
    if (!isUpcoming) return null
    if (days_until <= 7) {
      return (
        <span className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-violet-500/90 px-2 py-0.5 text-xs font-bold text-white animate-pulse">
          {days_until}d
        </span>
      )
    }
    return (
      <span className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-2 py-0.5 text-xs font-medium text-white">
        {days_until}d
      </span>
    )
  }

  if (variant === 'compact') {
    return (
      <Link
        href={`/games/${slug}`}
        className="group flex items-center gap-3 rounded-lg border border-border bg-card p-2 transition-colors hover:border-primary/50 hover:bg-card/80"
      >
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
          {cover_url ? (
            <Image
              src={cover_url}
              alt={name}
              fill
              className="object-cover"
              sizes="48px"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Gamepad2 className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-foreground group-hover:text-primary">
            {name}
          </h3>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {getRelativeDate()}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/games/${slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        {cover_url ? (
          <Image
            src={cover_url}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Gamepad2 className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {getCountdownBadge()}
        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">
          {name}
        </h3>

        <div className="mt-auto flex flex-col gap-1.5">
          {/* Release date */}
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {getRelativeDate()}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {genre && (
              <Badge variant="secondary" size="sm">
                {genre}
              </Badge>
            )}
            {is_live_service && (
              <Badge variant="patch" size="sm">
                Live Service
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
