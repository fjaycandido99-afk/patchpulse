'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Newspaper, Zap } from 'lucide-react'
import { MediaCard } from '@/components/media/MediaCard'
import { Badge } from '@/components/ui/badge'
import { MetaRow } from '@/components/ui/MetaRow'
import { formatDate, relativeDaysText } from '@/lib/dates'
import { markNewsAsVisited } from './actions'

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

// Get the best available image for a news item
function getNewsImage(item: NewsItem): string | null {
  if (item.image_url) return item.image_url
  if (item.game?.hero_url) return item.game.hero_url
  if (item.game?.cover_url) return item.game.cover_url
  return null
}

export function NewsFeed({ news, topStories, includeRumors }: NewsFeedProps) {
  useEffect(() => {
    markNewsAsVisited()
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

      {/* Filter toggle */}
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

      {/* News list */}
      <div className="space-y-3">
        {filteredNews.map((item, index) => (
          <div
            key={item.id}
            className="animate-soft-entry"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <MediaCard
              href={`/news/${item.id}`}
              title={item.title}
              summary={item.summary}
              whyItMatters={item.why_it_matters}
              imageUrl={getNewsImage(item)}
              variant="horizontal"
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
