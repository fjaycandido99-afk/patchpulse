'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Eye,
  Bell,
  BellOff,
  Plus,
  FileText,
  Newspaper,
  Calendar,
  TrendingUp,
  Gamepad2,
  ChevronRight,
  Loader2,
  Clock,
  Zap,
  Users,
  User,
} from 'lucide-react'
import { followGame } from '@/app/(main)/actions/games'
import { addToBacklogWithStatus } from '@/app/(main)/backlog/actions'
import { formatDate, relativeDaysText } from '@/lib/dates'

type GameTimelineEvent = {
  id: string
  type: 'patch' | 'news'
  title: string
  date: string
  summary?: string | null
  impactScore?: number | null
}

type FollowedGameData = {
  game: {
    id: string
    name: string
    slug: string
    cover_url: string | null
    logo_url: string | null
    brand_color: string | null
    release_date: string | null
    is_live_service: boolean
    platforms: string[]
    genre: string | null
    developer: string | null
  }
  isFollowed: boolean
  isInBacklog: boolean
  recentPatches: {
    id: string
    title: string
    published_at: string
    summary_tldr: string | null
    impact_score: number
  }[]
  recentNews: {
    id: string
    title: string
    published_at: string
    summary: string | null
    is_rumor: boolean
  }[]
  timeline: GameTimelineEvent[]
  impactSummary: {
    avgImpact: number
    competitiveImpact: 'high' | 'medium' | 'low' | 'none'
    casualImpact: 'high' | 'medium' | 'low' | 'none'
    updateFrequency: 'frequent' | 'moderate' | 'sparse' | 'none'
  }
}

type Props = {
  data: FollowedGameData
  bannerUrl: string | null
  logoUrl: string | null
  brandColor: string | null
}

function ImpactBadge({ level }: { level: 'high' | 'medium' | 'low' | 'none' }) {
  const config = {
    high: { label: 'High', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
    medium: { label: 'Medium', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    low: { label: 'Low', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
    none: { label: 'N/A', className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
  }
  const { label, className } = config[level]
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${className}`}>
      {label}
    </span>
  )
}

function getWhyFollowReasons(data: FollowedGameData): string[] {
  const reasons: string[] = []
  const { game, impactSummary, recentPatches, recentNews } = data

  // Live service games
  if (game.is_live_service) {
    reasons.push('Live service game with ongoing content updates')
  }

  // Unreleased games
  if (game.release_date) {
    const releaseDate = new Date(game.release_date)
    const now = new Date()
    if (releaseDate > now) {
      reasons.push('Upcoming release — follow for launch updates')
    }
  }

  // Active update cycle
  if (impactSummary.updateFrequency === 'frequent') {
    reasons.push('Frequent updates and patches')
  } else if (impactSummary.updateFrequency === 'moderate') {
    reasons.push('Regular update cycle')
  }

  // High impact changes
  if (impactSummary.competitiveImpact === 'high') {
    reasons.push('Significant competitive meta changes')
  }

  // Developer reputation
  if (game.developer) {
    reasons.push(`From ${game.developer}`)
  }

  // Fallback
  if (reasons.length === 0) {
    if (recentPatches.length > 0 || recentNews.length > 0) {
      reasons.push('Active game with recent updates')
    } else {
      reasons.push('Stay informed about future updates')
    }
  }

  return reasons.slice(0, 3)
}

export function FollowedGameInfoView({ data, bannerUrl, logoUrl, brandColor }: Props) {
  const { game, isFollowed, isInBacklog, recentPatches, recentNews, timeline, impactSummary } = data
  const [following, setFollowing] = useState(isFollowed)
  const [notifyEnabled, setNotifyEnabled] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [addingToBacklog, setAddingToBacklog] = useState(false)

  const glowColor = brandColor || '#6366f1'
  const hasUpdates = recentPatches.length > 0 || recentNews.length > 0
  const whyFollowReasons = getWhyFollowReasons(data)

  const handleUnfollow = () => {
    startTransition(async () => {
      const result = await followGame(game.id)
      if (!result.error) {
        setFollowing(result.following ?? false)
      }
    })
  }

  const handleAddToBacklog = async () => {
    setAddingToBacklog(true)
    await addToBacklogWithStatus(game.id, 'backlog')
    setAddingToBacklog(false)
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      {/* Header - Editorial style */}
      <div className="relative">
        {/* Banner */}
        <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 h-32 sm:h-40 lg:h-48 overflow-hidden">
          {bannerUrl ? (
            <>
              <Image
                src={bannerUrl}
                alt=""
                fill
                className="object-cover object-center"
                sizes="100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-background" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
          )}
        </div>

        {/* Game info overlay */}
        <div className="relative -mt-16 sm:-mt-20 px-4 sm:px-6 lg:px-8">
          <div className="flex items-end gap-4">
            {/* Game icon */}
            <div
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 ring-4 ring-background"
              style={{ boxShadow: `0 0 30px ${glowColor}40` }}
            >
              {logoUrl || game.cover_url ? (
                <Image
                  src={logoUrl || game.cover_url!}
                  alt={game.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  <Gamepad2 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pb-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
                {game.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                  <Eye className="h-3 w-3" />
                  Followed for updates
                </span>
                {game.platforms.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {game.platforms.slice(0, 2).join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What Changed Recently - MOST IMPORTANT */}
      <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-amber-400" />
          <h2 className="font-semibold">What Changed Recently</h2>
        </div>

        {hasUpdates ? (
          <div className="space-y-4">
            {/* Show top 2-3 most important updates */}
            {[...recentPatches.slice(0, 2), ...recentNews.slice(0, 1)].map((item, idx) => {
              const isPatch = 'impact_score' in item
              return (
                <Link
                  key={item.id}
                  href={isPatch ? `/patches/${item.id}` : `/news/${item.id}`}
                  className={`block group ${idx > 0 ? 'border-t border-border/50 pt-4' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isPatch ? 'bg-blue-500/10' : 'bg-violet-500/10'}`}>
                      {isPatch ? (
                        <FileText className="h-4 w-4 text-blue-400" />
                      ) : (
                        <Newspaper className="h-4 w-4 text-violet-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        {isPatch && 'impact_score' in item && item.impact_score >= 7 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-medium">
                            Major
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {relativeDaysText(item.published_at)}
                      </p>
                      {'summary_tldr' in item && item.summary_tldr && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {item.summary_tldr}
                        </p>
                      )}
                      {'summary' in item && item.summary && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {item.summary}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              )
            })}

            {(recentPatches.length > 2 || recentNews.length > 1) && (
              <Link
                href={`/patches?game=${game.id}`}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
              >
                View all updates
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No major updates recently.</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              You&apos;ll be notified when something important changes.
            </p>
          </div>
        )}
      </section>

      {/* Impact Summary */}
      {hasUpdates && (
        <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <h2 className="font-semibold">Recent Impact</h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">Competitive</p>
              <ImpactBadge level={impactSummary.competitiveImpact} />
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">Casual</p>
              <ImpactBadge level={impactSummary.casualImpact} />
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">Updates</p>
              <span className="px-2 py-0.5 text-xs font-medium rounded border bg-zinc-500/10 text-zinc-300 border-zinc-500/20">
                {impactSummary.updateFrequency === 'none' ? 'None' :
                  impactSummary.updateFrequency === 'sparse' ? 'Sparse' :
                    impactSummary.updateFrequency === 'moderate' ? 'Regular' : 'Frequent'}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Why Follow This Game */}
      <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="h-5 w-5 text-blue-400" />
          <h2 className="font-semibold">Why Follow This Game</h2>
        </div>
        <ul className="space-y-2">
          {whyFollowReasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              {reason}
            </li>
          ))}
        </ul>
      </section>

      {/* Timeline */}
      {timeline.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-violet-400" />
            <h2 className="font-semibold">Timeline</h2>
          </div>

          <div className="space-y-3">
            {timeline.slice(0, 8).map((event) => (
              <Link
                key={event.id}
                href={event.type === 'patch' ? `/patches/${event.id}` : `/news/${event.id}`}
                className="flex items-start gap-3 group"
              >
                <div className="w-20 flex-shrink-0 text-right">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(event.date)}
                  </span>
                </div>
                <div className="flex-shrink-0 mt-1.5">
                  <div className={`w-2 h-2 rounded-full ${event.type === 'patch' ? 'bg-blue-400' : 'bg-violet-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {event.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {event.type === 'patch' ? 'Patch' : 'News'}
                    {event.impactScore && event.impactScore >= 7 && ' • Major update'}
                  </p>
                </div>
              </Link>
            ))}

            {timeline.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No events yet. Check back after launch.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Actions */}
      <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="space-y-3">
          {/* Primary actions */}
          <div className="flex gap-3">
            <button
              onClick={handleUnfollow}
              disabled={isPending}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${following
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20'
                : 'bg-primary text-primary-foreground'
                }`}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {following ? 'Following' : 'Follow'}
            </button>

            <button
              onClick={() => setNotifyEnabled(!notifyEnabled)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${notifyEnabled
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'border border-border bg-card hover:bg-muted'
                }`}
            >
              {notifyEnabled ? (
                <Bell className="h-4 w-4 fill-current" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Secondary action */}
          {!isInBacklog && (
            <button
              onClick={handleAddToBacklog}
              disabled={addingToBacklog}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground border border-border/50 hover:border-border transition-colors"
            >
              {addingToBacklog ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add to Backlog
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
