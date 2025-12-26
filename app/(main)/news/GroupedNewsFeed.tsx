'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, ChevronRight, ExternalLink, Sparkles, Calendar, Clock } from 'lucide-react'
import { formatDate, relativeDaysText } from '@/lib/dates'
import { markNewsAsVisited } from './actions'
import type { GameNewsGroup, GroupedNewsItem, UpcomingRelease } from './queries'

type Game = {
  id: string
  name: string
  slug: string
}

type GroupedNewsFeedProps = {
  groups: GameNewsGroup[]
  lastVisit: string | null
  newItemsCount: number
  includeRumors: boolean
  followedGames: Game[]
  upcomingReleases: UpcomingRelease[]
}

// Topic colors
const TOPIC_COLORS: Record<string, string> = {
  Studio: 'text-blue-400',
  DLC: 'text-purple-400',
  Delay: 'text-amber-400',
  Launch: 'text-green-400',
  Patch: 'text-cyan-400',
  Esports: 'text-red-400',
  Beta: 'text-indigo-400',
  Platform: 'text-slate-400',
  Pricing: 'text-emerald-400',
}

function getTopicColor(topic: string): string {
  return TOPIC_COLORS[topic] || 'text-zinc-400'
}

// Row-based news item component
function NewsRow({ item, isLast }: { item: GroupedNewsItem; isLast: boolean }) {
  return (
    <Link
      href={`/news/${item.id}`}
      className={`group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/5 ${
        !isLast ? 'border-b border-white/5' : ''
      }`}
    >
      {/* Type badge */}
      <div className="flex-shrink-0 pt-0.5">
        {item.is_rumor ? (
          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            RUMOR
          </span>
        ) : (
          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            NEWS
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start gap-2">
          <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          {item.is_new && (
            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
          )}
        </div>

        {/* Summary - one line */}
        {(item.why_it_matters || item.summary) && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {item.why_it_matters || item.summary}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{relativeDaysText(item.published_at)}</span>
          {item.source_name && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span>{item.source_name}</span>
            </>
          )}
          {item.topics.length > 0 && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className={getTopicColor(item.topics[0])}>{item.topics[0]}</span>
            </>
          )}
          {item.source_url && (
            <ExternalLink className="w-3 h-3 opacity-50" />
          )}
        </div>
      </div>
    </Link>
  )
}

// Helper to get badge style based on count
function getNewBadgeStyle(count: number): { bg: string; text: string; animate: boolean } {
  if (count >= 10) {
    return { bg: 'bg-primary/30 border-primary/50', text: 'text-primary', animate: true }
  }
  if (count >= 4) {
    return { bg: 'bg-blue-500/20 border-blue-500/40', text: 'text-blue-400', animate: false }
  }
  return { bg: 'bg-primary/15 border-primary/30', text: 'text-primary/80', animate: false }
}

// Helper to determine if there's high-impact content
function hasHighImpactContent(items: GroupedNewsItem[]): boolean {
  return items.some(item =>
    item.topics.some(t => ['Launch', 'DLC', 'Beta'].includes(t))
  )
}

// Priority badge types for AI summaries (future-proof)
type PriorityType = 'major' | 'meta' | 'balance' | null

function getPriorityType(items: GroupedNewsItem[]): PriorityType {
  // Major: Launch, DLC, Beta, Delay
  if (items.some(item => item.topics.some(t => ['Launch', 'DLC', 'Beta', 'Delay'].includes(t)))) {
    return 'major'
  }
  // Meta Shift: Esports, significant gameplay changes (future: AI will detect)
  if (items.some(item => item.topics.some(t => ['Esports'].includes(t)))) {
    return 'meta'
  }
  // Balance: Patch notes only
  if (items.every(item => item.topics.includes('Patch'))) {
    return 'balance'
  }
  return null
}

const PRIORITY_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  major: { label: 'Major Update', bg: 'bg-red-500/20 border-red-500/40', text: 'text-red-400' },
  meta: { label: 'Meta Shift', bg: 'bg-amber-500/20 border-amber-500/40', text: 'text-amber-400' },
  balance: { label: 'Balance', bg: 'bg-zinc-500/20 border-zinc-500/40', text: 'text-zinc-400' },
}

// Game section with collapsible items
function GameSection({
  group,
  isExpanded,
  onToggle,
  showNewDivider,
  lastVisit,
}: {
  group: GameNewsGroup
  isExpanded: boolean
  onToggle: () => void
  showNewDivider: boolean
  lastVisit: string | null
}) {
  const { game, items, unreadCount } = group
  const brandColor = game.brand_color || '#3b82f6'

  // Split items into new and old
  const newItems = items.filter((i) => i.is_new)
  const oldItems = items.filter((i) => !i.is_new)

  // Get most recent item date
  const latestItem = items[0]
  const latestDate = latestItem ? relativeDaysText(latestItem.published_at) : null

  // Check for high-impact content
  const hasImpact = hasHighImpactContent(newItems)

  // Get badge styling based on count
  const badgeStyle = getNewBadgeStyle(unreadCount)

  // Get priority type for badge
  const priorityType = getPriorityType(newItems)
  const priorityStyle = priorityType ? PRIORITY_STYLES[priorityType] : null

  return (
    <div
      className="rounded-xl border overflow-hidden transition-colors"
      style={{
        borderColor: unreadCount > 0 ? `${brandColor}30` : 'rgba(255,255,255,0.1)',
        background: `linear-gradient(to right, ${brandColor}05, transparent)`,
      }}
    >
      {/* Game header with subtle branding */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
      >
        {/* Game logo/icon */}
        <div
          className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
          style={{ backgroundColor: `${brandColor}20` }}
        >
          {game.logo_url ? (
            <Image
              src={game.logo_url}
              alt={game.name}
              fill
              className="object-contain p-1"
              sizes="40px"
            />
          ) : game.cover_url ? (
            <Image
              src={game.cover_url}
              alt={game.name}
              fill
              className="object-cover"
              sizes="40px"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: brandColor }}
            >
              {game.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Game name and count */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-base">{game.name}</h2>
            {unreadCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.animate ? 'animate-pulse' : ''}`}>
                {unreadCount} new
              </span>
            )}
            {/* Priority badge - shows update importance */}
            {priorityStyle && unreadCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${priorityStyle.bg} ${priorityStyle.text}`}>
                {priorityStyle.label}
              </span>
            )}
          </div>
          {/* Secondary metadata */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
            {latestDate && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span>Updated {latestDate}</span>
              </>
            )}
          </div>
        </div>

        {/* Expand/collapse icon */}
        <div className="text-muted-foreground">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </div>
      </button>

      {/* Collapsible content */}
      {isExpanded && (
        <div className="border-t border-white/5">
          {/* New items section */}
          {newItems.length > 0 && (
            <>
              {showNewDivider && lastVisit && (
                <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 border-b border-primary/10">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    New since {formatDate(lastVisit)}
                  </span>
                </div>
              )}
              {newItems.map((item, idx) => (
                <NewsRow
                  key={item.id}
                  item={item}
                  isLast={idx === newItems.length - 1 && oldItems.length === 0}
                />
              ))}
            </>
          )}

          {/* Divider between new and old */}
          {newItems.length > 0 && oldItems.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/50 border-y border-white/5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Earlier
              </span>
            </div>
          )}

          {/* Old items */}
          {oldItems.map((item, idx) => (
            <NewsRow
              key={item.id}
              item={item}
              isLast={idx === oldItems.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Release type badges
const RELEASE_TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  game: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  dlc: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  expansion: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  update: { bg: 'bg-green-500/20', text: 'text-green-400' },
  season: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
}

// Upcoming Releases Section (AI-discovered)
function UpcomingReleasesSection({ releases }: { releases: UpcomingRelease[] }) {
  // Always show the section - with empty state if no releases
  return (
    <div className="rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-500/5 to-transparent overflow-hidden">
      {/* Header - compact on mobile */}
      <div className="flex items-center gap-2.5 p-3 sm:p-4 border-b border-violet-500/10">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm sm:text-base">Upcoming Games</h2>
          <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
            Releases appearing 14–30 days before launch
          </p>
        </div>
        {releases.length > 0 && (
          <span className="px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-violet-500/20 text-violet-400 border border-violet-500/30 flex-shrink-0">
            {releases.length}
          </span>
        )}
      </div>

      {/* Empty state - compact */}
      {releases.length === 0 ? (
        <div className="px-4 py-5 sm:p-6 text-center">
          <p className="text-xs text-muted-foreground">
            Upcoming releases will appear here 14–30 days before launch
          </p>
        </div>
      ) : null}

      {/* Releases list */}
      {releases.length > 0 && (
        <div className="divide-y divide-white/5">
          {releases.map((item) => {
            const typeStyle = RELEASE_TYPE_STYLES[item.release_type] || RELEASE_TYPE_STYLES.game
            const releaseDate = item.release_date ? new Date(item.release_date) : null

            return (
              <Link
                key={item.id}
                href={`/games/${item.game.slug}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
              >
                {/* Game cover */}
                <div className="relative w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                  {item.game.cover_url ? (
                    <Image
                      src={item.game.cover_url}
                      alt={item.game.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <Calendar className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Release info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm truncate">{item.title}</h3>
                    {!item.is_confirmed && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-500/20 text-amber-400">
                        Rumor
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                      {item.release_type.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.game.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {releaseDate ? formatDate(releaseDate) : item.release_window || 'TBA'}
                  </p>
                </div>

                {/* Countdown badge */}
                {item.days_until !== null ? (
                  <div className="flex-shrink-0">
                    {item.days_until <= 0 ? (
                      <span className="px-2 py-1 rounded-md text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                        Out Now!
                      </span>
                    ) : item.days_until <= 7 ? (
                      <span className="px-2 py-1 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {item.days_until}d
                      </span>
                    ) : item.days_until <= 30 ? (
                      <span className="px-2 py-1 rounded-md text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {item.days_until}d
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-zinc-500/20 text-zinc-400">
                        {Math.ceil(item.days_until / 7)}w
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="px-2 py-1 rounded-md text-xs font-medium bg-zinc-500/20 text-zinc-400">
                    TBA
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function GroupedNewsFeed({
  groups,
  lastVisit,
  newItemsCount,
  includeRumors,
  followedGames,
  upcomingReleases,
}: GroupedNewsFeedProps) {
  // Track expanded state with localStorage persistence
  const [expandedGames, setExpandedGames] = useState<Set<string>>(() => {
    // Start with all games expanded
    return new Set(groups.map((g) => g.game.id))
  })

  // Load persisted state
  useEffect(() => {
    const saved = localStorage.getItem('news-collapsed-games')
    if (saved) {
      try {
        const collapsed = JSON.parse(saved) as string[]
        const allGameIds = groups.map((g) => g.game.id)
        const expanded = allGameIds.filter((id) => !collapsed.includes(id))
        setExpandedGames(new Set(expanded))
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }, [groups])

  // Mark as visited on mount
  useEffect(() => {
    markNewsAsVisited()
  }, [])

  const toggleGame = (gameId: string) => {
    setExpandedGames((prev) => {
      const next = new Set(prev)
      if (next.has(gameId)) {
        next.delete(gameId)
      } else {
        next.add(gameId)
      }

      // Persist collapsed games
      const allGameIds = groups.map((g) => g.game.id)
      const collapsed = allGameIds.filter((id) => !next.has(id))
      localStorage.setItem('news-collapsed-games', JSON.stringify(collapsed))

      return next
    })
  }

  const expandAll = () => {
    setExpandedGames(new Set(groups.map((g) => g.game.id)))
    localStorage.removeItem('news-collapsed-games')
  }

  const collapseAll = () => {
    setExpandedGames(new Set())
    localStorage.setItem(
      'news-collapsed-games',
      JSON.stringify(groups.map((g) => g.game.id))
    )
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No news found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Follow some games to see their news here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Toggle filters */}
          <Link
            href={includeRumors ? '/news?rumors=false' : '/news'}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !includeRumors
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-white/5 text-muted-foreground hover:text-foreground border border-white/10'
            }`}
          >
            Hide Rumors
          </Link>
        </div>

        {/* Expand/Collapse all */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={expandAll}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Expand all
          </button>
          <span className="text-muted-foreground/40">·</span>
          <button
            onClick={collapseAll}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* New items summary */}
      {newItemsCount > 0 && lastVisit && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary/10 border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            {newItemsCount} new item{newItemsCount !== 1 ? 's' : ''} since your last visit
          </span>
        </div>
      )}

      {/* Upcoming Games - always visible with empty state */}
      <UpcomingReleasesSection releases={upcomingReleases} />

      {/* Section divider - enhanced visibility */}
      <div className="flex items-center gap-3 py-3 mt-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <span className="text-xs font-semibold text-foreground/80 uppercase tracking-widest">
          Your Games
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Game groups */}
      <div className="space-y-3">
        {groups.map((group, idx) => (
          <GameSection
            key={group.game.id}
            group={group}
            isExpanded={expandedGames.has(group.game.id)}
            onToggle={() => toggleGame(group.game.id)}
            showNewDivider={idx === 0} // Only show divider on first group
            lastVisit={lastVisit}
          />
        ))}
      </div>
    </div>
  )
}
