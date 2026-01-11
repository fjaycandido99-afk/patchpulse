'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Newspaper, Zap, SlidersHorizontal, X, Check } from 'lucide-react'
import { MediaCard } from '@/components/media/MediaCard'
import { Badge } from '@/components/ui/badge'
import { MetaRow } from '@/components/ui/MetaRow'
import { formatDate, relativeDaysText } from '@/lib/dates'
import { markNewsAsVisited } from './actions'

const SCROLL_KEY = 'news-scroll-position'

type NewsItem = {
  id: string
  title: string
  published_at: string
  summary: string | null
  why_it_matters: string | null
  topics: string[]
  is_rumor: boolean
  source_name: string | null
  image_url: string | null
  game: {
    id: string
    name: string
    slug: string
    cover_url: string | null
    hero_url: string | null
    logo_url: string | null
    brand_color?: string | null
  } | null
}

type TopStory = {
  id: string
  title: string
  published_at: string
  summary: string | null
  topics: string[]
  is_rumor: boolean
  source_name: string | null
  image_url: string | null
  game: {
    id: string
    name: string
    slug: string
    cover_url: string | null
    hero_url: string | null
    logo_url: string | null
    brand_color: string | null
  } | null
}

type NewsFeedProps = {
  news: NewsItem[]
  topStories: TopStory[]
  includeRumors: boolean
  sources: string[]
  selectedSource: string | null
}

// Safe image component with error handling
function SafeImage({
  src,
  alt,
  fill,
  className,
  sizes,
  priority,
}: {
  src: string
  alt: string
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
}) {
  const [error, setError] = useState(false)
  const handleError = useCallback(() => setError(true), [])

  if (error || !src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
        <Newspaper className="w-8 h-8 text-zinc-600" />
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

// Mobile News Card - edge-to-edge with larger text
function MobileNewsCard({ item, getNewsImage }: { item: NewsItem; getNewsImage: (item: NewsItem) => string | null }) {
  const imageUrl = getNewsImage(item)
  const displaySummary = item.why_it_matters || item.summary

  return (
    <Link href={`/news/${item.id}`} className="block group">
      {/* Edge-to-edge image container */}
      <div className="relative -mx-4 w-[calc(100%+2rem)] overflow-hidden bg-zinc-900">
        <div className="relative aspect-[16/10]">
          {imageUrl ? (
            <SafeImage
              src={imageUrl}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-active:scale-[0.98]"
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 flex items-center justify-center">
              <Newspaper className="w-12 h-12 text-zinc-600" />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <Badge variant="news">News</Badge>
            {item.is_rumor && <Badge variant="rumor">Rumor</Badge>}
          </div>
        </div>
      </div>

      {/* Content - with padding */}
      <div className="pt-3 pb-2">
        {/* Game name */}
        {item.game && (
          <span className="text-xs font-medium text-primary/80 mb-1 block">
            {item.game.name}
          </span>
        )}

        {/* Title - larger on mobile */}
        <h3 className="text-base font-semibold leading-snug line-clamp-2 text-white group-hover:text-primary transition-colors">
          {item.title}
        </h3>

        {/* Summary */}
        {displaySummary && (
          <p className="mt-1.5 text-sm text-zinc-400 line-clamp-2 leading-relaxed">
            {displaySummary}
          </p>
        )}

        {/* Meta row */}
        <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
          {item.source_name && <span>{item.source_name}</span>}
          {item.source_name && <span>·</span>}
          <span>{formatDate(item.published_at)}</span>
        </div>
      </div>
    </Link>
  )
}

// Top Story Hero Card - with mobile bleed
function TopStoryCard({ story, isPrimary = false }: { story: TopStory; isPrimary?: boolean }) {
  const heroImage = story.image_url || story.game?.hero_url || story.game?.cover_url
  const brandColor = story.game?.brand_color || '#6366f1'
  const importance = getImportanceLevel(story.topics)
  const importanceStyle = IMPORTANCE_STYLES[importance]

  return (
    <Link
      href={`/news/${story.id}`}
      className="group block"
    >
      {/* Thumbnail - edge-to-edge on mobile */}
      <div
        className="relative overflow-hidden bg-zinc-900 md:rounded-xl"
      >
        <div className={`relative ${isPrimary ? 'aspect-[16/9]' : 'aspect-video'}`}>
          {heroImage ? (
            <SafeImage
              src={heroImage}
              alt={story.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="100vw"
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

          {/* Importance badge - top right */}
          <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border backdrop-blur-sm ${importanceStyle.bg} ${importanceStyle.color} ${importanceStyle.border}`}>
            {importanceStyle.label}
          </span>

          {/* Source badge - top left */}
          {story.source_name && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/50 text-white/80 backdrop-blur-sm">
              {story.source_name}
            </span>
          )}
        </div>
      </div>

      {/* Content below image */}
      <div className="mt-2 px-1">
        {/* Game + Meta */}
        <div className="flex items-center gap-2 mb-1">
          {story.game?.logo_url && (
            <div className="relative w-4 h-4 rounded overflow-hidden bg-white/10">
              <Image src={story.game.logo_url} alt="" fill className="object-contain" sizes="16px" />
            </div>
          )}
          <span className="text-xs text-white/80">{story.game?.name || 'Gaming'}</span>
          <span className="text-white/40">·</span>
          <span className="text-xs text-white/60">{relativeDaysText(story.published_at)}</span>
        </div>

        {/* Title */}
        <h3 className={`font-medium text-white leading-snug line-clamp-2 group-hover:text-primary transition-colors ${isPrimary ? 'text-sm sm:text-base' : 'text-sm'}`}>
          {story.title}
        </h3>

        {/* Summary */}
        {story.summary && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {story.summary}
          </p>
        )}
      </div>
    </Link>
  )
}

// Get the best available image for a news item
function getNewsImage(item: NewsItem): string | null {
  if (item.image_url) return item.image_url
  if (item.game?.hero_url) return item.game.hero_url
  if (item.game?.cover_url) return item.game.cover_url
  return null
}

export function NewsFeed({ news, topStories, includeRumors, sources, selectedSource }: NewsFeedProps) {
  const hasRestoredScroll = useRef(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    markNewsAsVisited()
  }, [])

  // Restore scroll position on mount
  useEffect(() => {
    if (hasRestoredScroll.current) return

    const savedPosition = sessionStorage.getItem(SCROLL_KEY)
    if (savedPosition) {
      const pos = parseInt(savedPosition, 10)
      // Small delay to ensure content is rendered
      setTimeout(() => {
        window.scrollTo(0, pos)
      }, 50)
      hasRestoredScroll.current = true
    }
  }, [])

  // Save scroll position before navigating away
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(SCROLL_KEY, window.scrollY.toString())
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Filter out top story IDs from the main news list to avoid duplicates
  const topStoryIds = new Set(topStories.map(s => s.id))
  const filteredNews = news.filter(item => !topStoryIds.has(item.id))

  if (news.length === 0 && topStories.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Newspaper className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No news found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Check back later for the latest gaming news
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Stories Section */}
      {topStories.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="font-semibold text-sm uppercase tracking-wide">Top Stories</h2>
          </div>

          {/* Stack vertically on mobile for bleed, grid on desktop */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topStories.map((story, index) => (
              <div
                key={story.id}
                className="animate-soft-entry"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TopStoryCard story={story} isPrimary={topStories.length === 1} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filter Button */}
      <div className="relative">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
            selectedSource || !includeRumors
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'bg-white/5 text-muted-foreground hover:text-foreground border border-white/10'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {(selectedSource || !includeRumors) && (
            <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
              {(selectedSource ? 1 : 0) + (!includeRumors ? 1 : 0)}
            </span>
          )}
        </button>

        {/* Filter Dropdown */}
        {isFilterOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsFilterOpen(false)}
            />

            {/* Dropdown Panel */}
            <div className="absolute top-full left-0 mt-2 w-72 rounded-xl border border-white/10 bg-[#0b1220] shadow-xl z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-white/10">
                <span className="font-semibold text-sm">Filters</span>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sources Section */}
              {sources.length > 0 && (
                <div className="p-3 border-b border-white/10">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Source
                  </p>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        const params = new URLSearchParams()
                        if (!includeRumors) params.set('rumors', 'false')
                        router.push(`/news${params.toString() ? `?${params.toString()}` : ''}`)
                        setIsFilterOpen(false)
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                        !selectedSource
                          ? 'bg-primary/20 text-primary'
                          : 'hover:bg-white/5 text-foreground'
                      }`}
                    >
                      All Sources
                      {!selectedSource && <Check className="w-4 h-4" />}
                    </button>
                    {sources.map((source) => (
                      <button
                        key={source}
                        onClick={() => {
                          const params = new URLSearchParams()
                          params.set('source', source)
                          if (!includeRumors) params.set('rumors', 'false')
                          router.push(`/news?${params.toString()}`)
                          setIsFilterOpen(false)
                        }}
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedSource === source
                            ? 'bg-primary/20 text-primary'
                            : 'hover:bg-white/5 text-foreground'
                        }`}
                      >
                        {source}
                        {selectedSource === source && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rumors Section */}
              <div className="p-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Content
                </p>
                <button
                  onClick={() => {
                    const params = new URLSearchParams()
                    if (selectedSource) params.set('source', selectedSource)
                    if (includeRumors) params.set('rumors', 'false')
                    router.push(`/news${params.toString() ? `?${params.toString()}` : ''}`)
                    setIsFilterOpen(false)
                  }}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                    !includeRumors
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'hover:bg-white/5 text-foreground'
                  }`}
                >
                  Hide Rumors
                  {!includeRumors && <Check className="w-4 h-4" />}
                </button>
              </div>

              {/* Clear All */}
              {(selectedSource || !includeRumors) && (
                <div className="p-3 border-t border-white/10">
                  <button
                    onClick={() => {
                      router.push('/news')
                      setIsFilterOpen(false)
                    }}
                    className="w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Mobile: Single column with edge-to-edge cards */}
      <div className="sm:hidden space-y-6">
        {filteredNews.map((item, index) => (
          <div
            key={item.id}
            data-keyboard-nav
            className="animate-soft-entry"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <MobileNewsCard item={item} getNewsImage={getNewsImage} />
          </div>
        ))}
      </div>

      {/* Tablet+: Grid layout */}
      <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-fr">
        {filteredNews.map((item, index) => (
          <div
            key={item.id}
            data-keyboard-nav
            className="animate-soft-entry h-full"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <MediaCard
              href={`/news/${item.id}`}
              title={item.title}
              summary={item.summary}
              whyItMatters={item.why_it_matters}
              imageUrl={getNewsImage(item)}
              variant="vertical-large"
              game={
                item.game
                  ? {
                      name: item.game.name,
                      logoUrl: item.game.logo_url,
                    }
                  : undefined
              }
              badges={
                <>
                  <Badge variant="news">News</Badge>
                  {item.is_rumor && <Badge variant="rumor">Rumor</Badge>}
                </>
              }
              metaText={
                <MetaRow
                  items={[
                    item.game?.name || 'Gaming',
                    item.source_name,
                    formatDate(item.published_at),
                  ]}
                  size="xs"
                />
              }
            />
          </div>
        ))}
      </div>
    </div>
  )
}
