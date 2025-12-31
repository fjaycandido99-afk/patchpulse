'use client'

import Image from 'next/image'
import { Gamepad2, Calendar } from 'lucide-react'
import { useSpotlight } from './SpotlightProvider'
import { Badge } from '@/components/ui/badge'
import type { SpotlightGame } from './GameSpotlightPanel'

type SpotlightGameCardProps = {
  game: SpotlightGame
  type: 'upcoming' | 'new'
  variant?: 'default' | 'compact' | 'featured'
}

export function SpotlightGameCard({ game, type, variant = 'default' }: SpotlightGameCardProps) {
  const { openSpotlight } = useSpotlight()

  const isUpcoming = type === 'upcoming'

  // Format relative date
  const getRelativeDate = () => {
    if (isUpcoming && game.days_until !== undefined) {
      if (game.days_until === 0) return 'Today'
      if (game.days_until === 1) return 'Tomorrow'
      if (game.days_until <= 7) return `In ${game.days_until}d`
      if (game.days_until <= 30) return `In ${Math.ceil(game.days_until / 7)}w`
      return `${game.days_until}d`
    }
    if (!isUpcoming && game.days_since !== undefined) {
      if (game.days_since === 0) return 'Today'
      if (game.days_since === 1) return 'Yesterday'
      if (game.days_since <= 7) return `${game.days_since}d ago`
      return `${Math.ceil(game.days_since / 7)}w ago`
    }
    if (game.release_date) {
      return new Date(game.release_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    }
    return 'TBA'
  }

  // Countdown badge
  const getBadge = () => {
    if (isUpcoming && game.days_until !== undefined) {
      const urgent = game.days_until <= 7
      return (
        <span className={`absolute top-2 right-2 z-10 rounded-full px-2 py-0.5 text-xs font-bold ${
          urgent
            ? 'bg-violet-500 text-white animate-pulse'
            : 'bg-white/20 text-white backdrop-blur-sm'
        }`}>
          {game.days_until}d
        </span>
      )
    }
    if (!isUpcoming && game.days_since !== undefined && game.days_since <= 7) {
      return (
        <span className="absolute top-2 right-2 z-10 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
          New!
        </span>
      )
    }
    return null
  }

  const handleClick = () => {
    openSpotlight(game, type)
  }

  // Compact variant for mobile grids
  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className="group text-left active:scale-[0.97] transition-transform w-full"
      >
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-zinc-900">
          {game.cover_url ? (
            <Image
              src={game.cover_url}
              alt={game.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="25vw"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
              <Gamepad2 className="h-4 w-4 text-zinc-700" />
            </div>
          )}
          {/* Countdown badge */}
          <span className={`absolute top-1 left-1 text-[8px] px-1.5 py-0.5 rounded-full backdrop-blur-sm font-medium ${
            isUpcoming ? 'bg-indigo-500/80 text-white' : 'bg-emerald-500/80 text-white'
          }`}>
            {isUpcoming ? (game.days_until !== undefined ? `${game.days_until}d` : 'TBA') : `${game.days_since}d`}
          </span>
        </div>
        {/* Title - 2 lines max, fixed height */}
        <h3 className="font-medium leading-tight line-clamp-2 text-zinc-200 text-[10px] mt-1 h-7">
          {game.name}
        </h3>
      </button>
    )
  }

  // Featured variant for hero sections
  if (variant === 'featured') {
    const imageUrl = game.hero_url || game.cover_url
    return (
      <button
        onClick={handleClick}
        className="group relative text-left w-full overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-xl active:scale-[0.99]"
      >
        <div className="relative aspect-[16/9] sm:aspect-[2/1] overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={game.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <Gamepad2 className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Badge */}
          <div className="absolute top-4 right-4">
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${
              isUpcoming
                ? game.days_until !== undefined && game.days_until <= 7
                  ? 'bg-violet-500 text-white animate-pulse'
                  : 'bg-white/20 text-white backdrop-blur-sm'
                : 'bg-emerald-500/90 text-white'
            }`}>
              {isUpcoming ? (game.days_until !== undefined ? `${game.days_until}d` : 'TBA') : 'New!'}
            </span>
          </div>

          {/* Content overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
            <h3 className="text-xl font-bold text-white sm:text-2xl lg:text-3xl line-clamp-2 drop-shadow-lg">
              {game.name}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="flex items-center gap-1.5 text-sm text-white/80">
                <Calendar className="h-4 w-4" />
                {getRelativeDate()}
              </span>
              {game.genre && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                  {game.genre}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    )
  }

  // Default variant
  return (
    <button
      onClick={handleClick}
      className="group relative text-left w-full flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg active:scale-[0.98]"
    >
      {/* Cover Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        {game.cover_url ? (
          <Image
            src={game.cover_url}
            alt={game.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Gamepad2 className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {getBadge()}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">
          {game.name}
        </h3>
        <div className="mt-auto flex flex-col gap-1.5">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {getRelativeDate()}
          </p>
          <div className="flex flex-wrap gap-1">
            {game.genre && (
              <Badge variant="secondary" size="sm">{game.genre}</Badge>
            )}
            {game.is_live_service && (
              <Badge variant="patch" size="sm">Live Service</Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
