'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, ChevronRight, ChevronLeft, ExternalLink, Sparkles, Calendar, Clock, Gamepad2, Trophy, Brain, Cpu, Zap } from 'lucide-react'
import { formatDate, relativeDaysText } from '@/lib/dates'
import { markNewsAsVisited } from './actions'
import type { GameNewsGroup, GroupedNewsItem, UpcomingRelease, TopStory } from './queries'

// Safe image component that falls back to placeholder on error
function SafeImage({
  src,
  alt,
  fill,
  className,
  sizes,
  priority,
  fallbackIcon: FallbackIcon = Gamepad2
}: {
  src: string
  alt: string
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
  fallbackIcon?: typeof Gamepad2
}) {
  const [error, setError] = useState(false)

  const handleError = useCallback(() => setError(true), [])

  if (error || !src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
        <FallbackIcon className="w-8 h-8 text-zinc-600" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={handleError}
      unoptimized
    />
  )
}

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
  topStories: TopStory[]
}

// Topic colors and icons
const TOPIC_CONFIG: Record<string, { color: string; bg: string; icon: typeof Trophy }> = {
  Studio: { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Cpu },
  DLC: { color: 'text-purple-400', bg: 'bg-purple-500/20', icon: Sparkles },
  Delay: { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: Clock },
  Launch: { color: 'text-green-400', bg: 'bg-green-500/20', icon: Zap },
  Patch: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', icon: Gamepad2 },
  Esports: { color: 'text-red-400', bg: 'bg-red-500/20', icon: Trophy },
  Beta: { color: 'text-indigo-400', bg: 'bg-indigo-500/20', icon: Gamepad2 },
  Platform: { color: 'text-slate-400', bg: 'bg-slate-500/20', icon: Cpu },
  Update: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: Zap },
  Season: { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: Calendar },
  Industry: { color: 'text-zinc-400', bg: 'bg-zinc-500/20', icon: Brain },
}

function getTopicConfig(topic: string) {
  return TOPIC_CONFIG[topic] || { color: 'text-zinc-400', bg: 'bg-zinc-500/20', icon: Gamepad2 }
}

// Importance level based on topics
function getImportanceLevel(topics: string[]): 'major' | 'medium' | 'minor' {
  const majorTopics = ['Launch', 'DLC', 'Beta', 'Season']
  const mediumTopics = ['Update', 'Patch', 'Esports', 'Delay']

  if (topics.some(t => majorTopics.includes(t))) return 'major'
  if (topics.some(t => mediumTopics.includes(t))) return 'medium'
  return 'minor'
}

const IMPORTANCE_STYLES = {
  major: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', label: 'Major' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', label: 'Medium' },
  minor: { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', label: 'Minor' },
}

// Section divider
function SectionDivider({ title, icon: Icon }: { title: string; icon?: typeof Trophy }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80 uppercase tracking-widest">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {title}
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  )
}

// Top Story Hero Card
function TopStoryCard({ story, isPrimary = false }: { story: TopStory; isPrimary?: boolean }) {
  const heroImage = story.image_url || story.game?.hero_url || story.game?.cover_url
  const brandColor = story.game?.brand_color || '#6366f1'
  const importance = getImportanceLevel(story.topics)
  const importanceStyle = IMPORTANCE_STYLES[importance]

  return (
    <Link
      href={`/news/${story.id}`}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 block"
    >
      <div className={`relative ${isPrimary ? 'aspect-[16/9] sm:aspect-[21/9]' : 'aspect-[16/9]'}`}>
        {heroImage ? (
          <SafeImage
            src={heroImage}
            alt={story.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes={isPrimary ? '100vw' : '50vw'}
            priority={isPrimary}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${brandColor}60 0%, ${brandColor}20 50%, #09090b 100%)`
            }}
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          {/* Game + Meta */}
          <div className="flex items-center gap-2 mb-2">
            {story.game?.logo_url && (
              <div className="relative w-5 h-5 rounded overflow-hidden bg-white/10">
                <Image src={story.game.logo_url} alt="" fill className="object-contain" sizes="20px" />
              </div>
            )}
            <span className="text-xs text-white/80">{story.game?.name || 'Gaming'}</span>
            <span className="text-white/40">·</span>
            <span className="text-xs text-white/60">{relativeDaysText(story.published_at)}</span>
          </div>

          {/* Title */}
          <h3 className={`font-bold text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors ${isPrimary ? 'text-lg sm:text-xl' : 'text-base'}`}>
            {story.title}
          </h3>

          {/* Summary on primary */}
          {isPrimary && story.summary && (
            <p className="text-sm text-white/70 mt-2 line-clamp-2 hidden sm:block">
              {story.summary}
            </p>
          )}
        </div>

        {/* Importance badge */}
        <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-semibold border backdrop-blur-sm ${importanceStyle.bg} ${importanceStyle.color} ${importanceStyle.border}`}>
          {importanceStyle.label}
        </span>

        {/* Source badge */}
        {story.source_name && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/50 text-white/80 backdrop-blur-sm">
            {story.source_name}
          </span>
        )}
      </div>
    </Link>
  )
}

// Upcoming Games Image Strip (horizontal scroll)
function UpcomingGamesStrip({ releases }: { releases: UpcomingRelease[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (releases.length === 0) {
    return (
      <div className="rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-500/5 to-transparent p-6 text-center">
        <Calendar className="w-8 h-8 text-violet-400/50 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Upcoming releases will appear here 14–30 days before launch
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Scroll buttons */}
      {releases.length > 3 && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/80 border border-white/20 flex items-center justify-center hover:bg-black transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/80 border border-white/20 flex items-center justify-center hover:bg-black transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {releases.map((release) => {
          const daysText = release.days_until !== null
            ? release.days_until <= 0 ? 'Out Now!' : `${release.days_until}d`
            : 'TBA'

          return (
            <Link
              key={release.id}
              href={`/games/${release.game.slug}`}
              className="flex-shrink-0 w-32 group"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Cover image */}
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 bg-zinc-900 mb-2">
                {release.game.cover_url ? (
                  <Image
                    src={release.game.cover_url}
                    alt={release.game.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="128px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-zinc-700" />
                  </div>
                )}

                {/* Countdown badge */}
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  release.days_until !== null && release.days_until <= 7
                    ? 'bg-amber-500/90 text-black animate-pulse'
                    : release.days_until !== null && release.days_until <= 0
                      ? 'bg-green-500/90 text-black'
                      : 'bg-black/70 text-white'
                }`}>
                  {daysText}
                </div>

                {/* Type badge */}
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-violet-500/80 text-white uppercase">
                  {release.release_type}
                </div>
              </div>

              {/* Title */}
              <p className="text-xs font-medium text-center line-clamp-2 group-hover:text-primary transition-colors">
                {release.title}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// News item with thumbnail
function NewsMediaCard({ item, showGameName = false }: { item: GroupedNewsItem; showGameName?: boolean }) {
  const thumbnail = item.image_url || item.game_hero_url || item.game_cover_url
  const importance = getImportanceLevel(item.topics)
  const importanceStyle = IMPORTANCE_STYLES[importance]
  const topicConfig = item.topics[0] ? getTopicConfig(item.topics[0]) : null

  return (
    <Link
      href={`/news/${item.id}`}
      className="group flex gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900">
        {thumbnail ? (
          <SafeImage
            src={thumbnail}
            alt=""
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <Gamepad2 className="w-6 h-6 text-zinc-700" />
          </div>
        )}

        {/* New indicator */}
        {item.is_new && (
          <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-primary" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        {/* Title */}
        <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type badge with icon */}
          {item.is_rumor ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              RUMOR
            </span>
          ) : topicConfig ? (
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${topicConfig.bg} ${topicConfig.color}`}>
              <topicConfig.icon className="w-2.5 h-2.5" />
              {item.topics[0]}
            </span>
          ) : (
            <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-400">
              NEWS
            </span>
          )}

          {/* Importance dot */}
          <span className={`w-1.5 h-1.5 rounded-full ${importanceStyle.bg}`} title={importanceStyle.label} />

          <span className="text-[11px] text-muted-foreground">{relativeDaysText(item.published_at)}</span>

          {item.source_name && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-[11px] text-muted-foreground truncate">{item.source_name}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

// Game section with collapsible items
function GameSection({
  group,
  isExpanded,
  onToggle,
  lastVisit,
}: {
  group: GameNewsGroup
  isExpanded: boolean
  onToggle: () => void
  lastVisit: string | null
}) {
  const { game, items, unreadCount } = group
  const brandColor = game.brand_color || '#3b82f6'

  return (
    <div
      className="rounded-xl border overflow-hidden transition-colors"
      style={{
        borderColor: unreadCount > 0 ? `${brandColor}30` : 'rgba(255,255,255,0.1)',
        background: `linear-gradient(to right, ${brandColor}05, transparent)`,
      }}
    >
      {/* Game header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 sm:p-4 hover:bg-white/5 transition-colors"
      >
        {/* Game logo/icon */}
        <div
          className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
          style={{ backgroundColor: `${brandColor}20` }}
        >
          {game.logo_url ? (
            <Image src={game.logo_url} alt={game.name} fill className="object-contain p-1" sizes="40px" />
          ) : game.cover_url ? (
            <Image src={game.cover_url} alt={game.name} fill className="object-cover" sizes="40px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: brandColor }}>
              {game.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Game name and count */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-sm sm:text-base truncate">{game.name}</h2>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Expand/collapse */}
        <div className="text-muted-foreground">
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>
      </button>

      {/* Collapsible content */}
      {isExpanded && (
        <div className="border-t border-white/5 p-3 space-y-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="animate-soft-entry"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <NewsMediaCard item={item} />
            </div>
          ))}
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
  topStories,
}: GroupedNewsFeedProps) {
  const [expandedGames, setExpandedGames] = useState<Set<string>>(() => {
    return new Set(groups.map((g) => g.game.id))
  })

  useEffect(() => {
    const saved = localStorage.getItem('news-collapsed-games')
    if (saved) {
      try {
        const collapsed = JSON.parse(saved) as string[]
        const allGameIds = groups.map((g) => g.game.id)
        const expanded = allGameIds.filter((id) => !collapsed.includes(id))
        setExpandedGames(new Set(expanded))
      } catch {
        // Invalid JSON
      }
    }
  }, [groups])

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
    localStorage.setItem('news-collapsed-games', JSON.stringify(groups.map((g) => g.game.id)))
  }

  if (groups.length === 0 && topStories.length === 0) {
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
    <div className="space-y-6">
      {/* 1. TOP STORIES HERO SECTION */}
      {topStories.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="font-semibold text-sm uppercase tracking-wide">Top Stories</h2>
          </div>

          {topStories.length === 1 ? (
            <div className="animate-soft-entry">
              <TopStoryCard story={topStories[0]} isPrimary />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="animate-soft-entry">
                <TopStoryCard story={topStories[0]} isPrimary />
              </div>
              {topStories[1] && (
                <div className="animate-soft-entry" style={{ animationDelay: '50ms' }}>
                  <TopStoryCard story={topStories[1]} />
                </div>
              )}
            </div>
          )}
        </section>
      )}

      <SectionDivider title="Your Games" icon={Gamepad2} />

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
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

        <div className="flex items-center gap-2 text-xs">
          <button onClick={expandAll} className="text-muted-foreground hover:text-foreground transition-colors">
            Expand all
          </button>
          <span className="text-muted-foreground/40">·</span>
          <button onClick={collapseAll} className="text-muted-foreground hover:text-foreground transition-colors">
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

      {/* 3. GAME GROUPS WITH MEDIA CARDS */}
      <div className="space-y-3">
        {groups.map((group) => (
          <GameSection
            key={group.game.id}
            group={group}
            isExpanded={expandedGames.has(group.game.id)}
            onToggle={() => toggleGame(group.game.id)}
            lastVisit={lastVisit}
          />
        ))}
      </div>
    </div>
  )
}
