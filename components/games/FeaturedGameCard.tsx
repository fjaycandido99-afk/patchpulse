'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Gamepad2, Calendar, Plus } from 'lucide-react'

type FeaturedGameCardProps = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  hero_url?: string | null
  release_date: string | null
  days_since?: number
  days_until?: number
  genre?: string | null
  is_live_service?: boolean
  platforms?: string[]
}

export function FeaturedGameCard({
  id,
  name,
  slug,
  cover_url,
  hero_url,
  release_date,
  days_since,
  days_until,
  genre,
  is_live_service,
}: FeaturedGameCardProps) {
  const isUpcoming = days_until !== undefined && days_until > 0
  const isReleased = days_since !== undefined

  // Use hero image if available, otherwise cover
  const imageUrl = hero_url || cover_url

  // Format relative date
  const getRelativeDate = () => {
    if (isUpcoming) {
      if (days_until === 0) return 'Releases today'
      if (days_until === 1) return 'Releases tomorrow'
      if (days_until <= 7) return `In ${days_until} days`
      if (days_until <= 30) return `In ${Math.ceil(days_until / 7)} weeks`
      return new Date(release_date!).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    }
    if (isReleased) {
      if (days_since === 0) return 'Released today'
      if (days_since === 1) return 'Released yesterday'
      if (days_since <= 7) return `Released ${days_since} days ago`
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

  // Badge content
  const getBadge = () => {
    if (isUpcoming && days_until <= 7) {
      return (
        <span className="rounded-full bg-violet-500 px-3 py-1 text-sm font-bold text-white animate-pulse">
          {days_until === 0 ? 'Today!' : `${days_until}d`}
        </span>
      )
    }
    if (isUpcoming) {
      return (
        <span className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-sm font-medium text-white">
          {days_until}d
        </span>
      )
    }
    if (isReleased && days_since !== undefined && days_since <= 7) {
      return (
        <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-sm font-bold text-white">
          New!
        </span>
      )
    }
    return null
  }

  return (
    <Link
      href={`/games/${slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted sm:aspect-[2/1]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Gamepad2 className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Badge */}
        <div className="absolute top-4 right-4">{getBadge()}</div>

        {/* Content overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
          <h3 className="text-xl font-bold text-white sm:text-2xl lg:text-3xl line-clamp-2 drop-shadow-lg">
            {name}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Release date */}
            <span className="flex items-center gap-1.5 text-sm text-white/80">
              <Calendar className="h-4 w-4" />
              {getRelativeDate()}
            </span>

            {/* Tags */}
            {genre && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                {genre}
              </span>
            )}
            {is_live_service && (
              <span className="rounded-full bg-blue-500/80 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                Live Service
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action button on hover */}
      <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100 sm:bottom-6 sm:right-6">
        <span className="flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg">
          <Plus className="h-4 w-4" />
          Add to Backlog
        </span>
      </div>
    </Link>
  )
}
