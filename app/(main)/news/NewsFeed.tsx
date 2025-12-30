'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Newspaper } from 'lucide-react'
import { MediaCard } from '@/components/media/MediaCard'
import { Badge } from '@/components/ui/badge'
import { MetaRow } from '@/components/ui/MetaRow'
import { formatDate } from '@/lib/dates'
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
  } | null
}

type NewsFeedProps = {
  news: NewsItem[]
  includeRumors: boolean
}

// Get the best available image for a news item
function getNewsImage(item: NewsItem): string | null {
  if (item.image_url) return item.image_url
  if (item.game?.hero_url) return item.game.hero_url
  if (item.game?.cover_url) return item.game.cover_url
  return null
}

export function NewsFeed({ news, includeRumors }: NewsFeedProps) {
  useEffect(() => {
    markNewsAsVisited()
  }, [])

  if (news.length === 0) {
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
    <div className="space-y-4">
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
        {news.map((item, index) => (
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
