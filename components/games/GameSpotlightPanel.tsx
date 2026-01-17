'use client'

import { useState, useTransition, useEffect } from 'react'
import Image from 'next/image'
import { X, Calendar, Gamepad2, Bell, Plus, Sparkles, Info, Clock, Loader2, Check } from 'lucide-react'
import { followGame, isFollowingGame } from '@/app/(main)/actions/games'
import { toggleGameReminder } from '@/app/(main)/actions/reminders'
import { StoreLinkButtons } from '@/components/ui/StoreLinkButtons'

export type SpotlightGame = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  hero_url?: string | null
  release_date: string | null
  days_until?: number
  days_since?: number
  genre?: string | null
  is_live_service?: boolean
  platforms?: string[]
  // Optional enhanced data
  description?: string
  developer?: string
  why_play?: string[]
  whats_new?: string[]
}

type GameSpotlightPanelProps = {
  game: SpotlightGame
  isOpen: boolean
  onClose: () => void
  type: 'upcoming' | 'new'
  initialHasReminder?: boolean
}


export function GameSpotlightPanel({ game, isOpen, onClose, type, initialHasReminder = false }: GameSpotlightPanelProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoadingFollowStatus, setIsLoadingFollowStatus] = useState(true)
  const [hasReminder, setHasReminder] = useState(initialHasReminder)
  const [isPending, startTransition] = useTransition()
  const [isReminderPending, startReminderTransition] = useTransition()

  // Fetch actual follow status when panel opens
  useEffect(() => {
    if (isOpen && game?.id) {
      setIsLoadingFollowStatus(true)
      isFollowingGame(game.id)
        .then((following) => {
          setIsFollowing(following)
        })
        .catch(() => {
          setIsFollowing(false)
        })
        .finally(() => {
          setIsLoadingFollowStatus(false)
        })
    }
  }, [isOpen, game?.id])

  if (!isOpen) return null

  const isUpcoming = type === 'upcoming'
  const imageUrl = game.hero_url || game.cover_url

  // Format release info
  const getReleaseLabel = () => {
    if (isUpcoming && game.days_until !== undefined) {
      if (game.days_until === 0) return 'RELEASES TODAY'
      if (game.days_until === 1) return 'RELEASES TOMORROW'
      return `COMING IN ${game.days_until} DAYS`
    }
    if (!isUpcoming && game.days_since !== undefined) {
      if (game.days_since === 0) return 'RELEASED TODAY'
      if (game.days_since === 1) return 'RELEASED YESTERDAY'
      if (game.days_since <= 7) return `NEW RELEASE • ${game.days_since}d AGO`
      return 'NEW RELEASE'
    }
    if (game.release_date) {
      return new Date(game.release_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }
    return 'TBA'
  }

  // Get release window for At a Glance
  const getReleaseWindow = () => {
    if (game.release_date) {
      const date = new Date(game.release_date)
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }
    return 'TBA'
  }

  // Micro-signal based on game data
  const getMicroSignal = () => {
    if (game.is_live_service) {
      return { icon: '🔄', text: 'Live service with ongoing content' }
    }
    if (isUpcoming && game.days_until !== undefined && game.days_until <= 30) {
      return { icon: '🔥', text: 'Launching soon' }
    }
    if (!isUpcoming && game.days_since !== undefined && game.days_since <= 7) {
      return { icon: '✨', text: 'Just launched' }
    }
    if (game.genre?.toLowerCase().includes('rpg')) {
      return { icon: '⚔️', text: 'Deep RPG experience' }
    }
    if (game.genre?.toLowerCase().includes('action')) {
      return { icon: '💥', text: 'Action-packed gameplay' }
    }
    return null
  }

  // Game-focused "Why Play" bullets (not app features)
  const getWhyPlay = () => {
    if (game.why_play && game.why_play.length > 0) return game.why_play

    const bullets: string[] = []

    // Genre-based hooks
    if (game.genre) {
      const genreLower = game.genre.toLowerCase()
      if (genreLower.includes('rpg')) {
        bullets.push('Deep character progression and storytelling')
      } else if (genreLower.includes('action')) {
        bullets.push('Fast-paced combat and intense gameplay')
      } else if (genreLower.includes('adventure')) {
        bullets.push('Immersive world to explore')
      } else if (genreLower.includes('shooter') || genreLower.includes('fps')) {
        bullets.push('Competitive or tactical shooting experience')
      } else if (genreLower.includes('strategy')) {
        bullets.push('Strategic depth and decision-making')
      } else if (genreLower.includes('simulation') || genreLower.includes('sim')) {
        bullets.push('Realistic simulation experience')
      } else if (genreLower.includes('sports') || genreLower.includes('racing')) {
        bullets.push('Competitive sports or racing action')
      } else {
        bullets.push(`${game.genre} gaming experience`)
      }
    }

    // Developer info if available
    if (game.developer) {
      bullets.push(`From ${game.developer}`)
    }

    // Live service value prop
    if (game.is_live_service) {
      bullets.push('Regular updates, seasons, and new content')
    }

    // Platform exclusivity or breadth
    if (game.platforms && game.platforms.length === 1) {
      bullets.push(`${game.platforms[0]} exclusive`)
    } else if (game.platforms && game.platforms.length > 2) {
      bullets.push('Available across multiple platforms')
    }

    // Fallback
    if (bullets.length === 0) {
      bullets.push('New gaming experience worth checking out')
    }

    return bullets
  }

  // Improved "What's Coming/New" copy
  const getWhatsNew = () => {
    if (game.whats_new && game.whats_new.length > 0) return game.whats_new

    if (isUpcoming) {
      const items = ['Full launch content at release']
      if (game.is_live_service) {
        items.push('Post-launch seasons and updates expected')
      } else {
        items.push('Day-one patches likely')
      }
      items.push('Follow for launch patch notes')
      return items
    }

    // New release
    const items = ['Launch version now available']
    if (game.is_live_service) {
      items.push('Live updates being tracked')
    } else {
      items.push('Early hotfixes and balance changes tracked')
    }
    return items
  }

  // Game type for At a Glance
  const getGameType = () => {
    if (game.is_live_service) return 'Live Service'
    return 'Standard Release'
  }

  const handleFollow = () => {
    const previousState = isFollowing
    setIsFollowing(!isFollowing)

    startTransition(async () => {
      const result = await followGame(game.id)

      if (result.error) {
        // Revert on error
        setIsFollowing(previousState)
      } else if (result.following !== undefined) {
        setIsFollowing(result.following)
      }
    })
  }

  const handleReminder = () => {
    const previousState = hasReminder
    setHasReminder(!hasReminder)

    startReminderTransition(async () => {
      const result = await toggleGameReminder(game.id, game.release_date)

      if (result.error) {
        // Revert on error
        setHasReminder(previousState)
      } else if (result.hasReminder !== undefined) {
        setHasReminder(result.hasReminder)
      }
    })
  }

  const microSignal = getMicroSignal()

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel - Bottom sheet on mobile, side panel on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-y-0 md:left-auto md:right-0 md:w-[480px]">
        <div className="flex h-[85vh] md:h-full flex-col rounded-t-3xl md:rounded-none bg-background border-t md:border-l border-border overflow-hidden animate-in slide-in-from-bottom md:slide-in-from-right duration-300">

          {/* Drag handle - mobile only */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Hero Section - smaller on mobile */}
          <div className="relative h-40 sm:h-48 md:h-64 flex-shrink-0">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={game.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 480px"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                <Gamepad2 className="h-16 w-16 text-zinc-600" />
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Release badge */}
            <div className="absolute bottom-4 left-4">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                isUpcoming
                  ? 'bg-violet-500/90 text-white'
                  : 'bg-emerald-500/90 text-white'
              }`}>
                <Calendar className="h-3.5 w-3.5" />
                {getReleaseLabel()}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-5">

              {/* Title & Micro-signal */}
              <div>
                <h2 className="text-2xl font-bold text-foreground">{game.name}</h2>
                {microSignal && (
                  <p className="mt-1.5 text-sm text-muted-foreground flex items-center gap-1.5">
                    <span>{microSignal.icon}</span>
                    {microSignal.text}
                  </p>
                )}
              </div>

              {/* Why Play This */}
              <section className="rounded-xl border border-border bg-card/50 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  Why Play This?
                </h3>
                <ul className="space-y-2">
                  {getWhyPlay().map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </section>

              {/* At a Glance - always show key info */}
              <section className="rounded-xl border border-border bg-card/50 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                  <Info className="h-4 w-4 text-blue-400" />
                  At a Glance
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Genre</p>
                    <p className="text-sm font-medium text-foreground">{game.genre || 'TBA'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Platforms</p>
                    <p className="text-sm font-medium text-foreground">
                      {game.platforms && game.platforms.length > 0 ? game.platforms.join(', ') : 'TBA'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="text-sm font-medium text-foreground">{getGameType()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{isUpcoming ? 'Release' : 'Released'}</p>
                    <p className="text-sm font-medium text-foreground">{getReleaseWindow()}</p>
                  </div>
                  {game.developer && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Developer</p>
                      <p className="text-sm font-medium text-foreground">{game.developer}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* What's New / Coming */}
              <section className="rounded-xl border border-border bg-card/50 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                  <Clock className="h-4 w-4 text-green-400" />
                  {isUpcoming ? "What's Coming" : "What's New"}
                </h3>
                <ul className="space-y-2">
                  {getWhatsNew().map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

            </div>
          </div>

          {/* Actions - Sticky footer with increased padding */}
          <div className="flex-shrink-0 border-t border-border bg-background p-4 pb-6 sm:pb-4">
            {/* Main actions */}
            <div className="flex gap-3">
              <button
                onClick={handleFollow}
                disabled={isPending || isLoadingFollowStatus}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors disabled:opacity-50 ${
                  isFollowing
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                {isPending || isLoadingFollowStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className={`h-4 w-4 ${isFollowing ? 'rotate-45' : ''} transition-transform`} />
                )}
                {isLoadingFollowStatus ? 'Loading...' : isFollowing ? 'Following' : 'Follow for Updates'}
              </button>

              {isUpcoming && (
                <button
                  onClick={handleReminder}
                  disabled={isReminderPending}
                  className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50 ${
                    hasReminder
                      ? 'bg-violet-500 text-white'
                      : 'border border-border bg-card hover:bg-muted'
                  }`}
                  title={hasReminder ? 'Remove reminder' : 'Remind me on release day'}
                >
                  {isReminderPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : hasReminder ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>

            {/* Store links */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground">Wishlist or Buy:</span>
              <StoreLinkButtons
                gameName={game.name}
                platforms={game.platforms || []}
                size="sm"
              />
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
