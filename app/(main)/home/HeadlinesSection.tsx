'use client'

import { MediaCard } from '@/components/media/MediaCard'
import { Badge } from '@/components/ui/badge'
import { MetaRow } from '@/components/ui/MetaRow'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { formatDate } from '@/lib/dates'
import type { SeasonalImage } from '@/lib/images/seasonal'
import type { Platform } from './queries'

type NewsItem = {
  id: string
  game_id: string | null
  title: string
  published_at: string
  source_name: string | null
  source_url: string | null
  summary: string | null
  why_it_matters: string | null
  topics: string[]
  is_rumor: boolean
  games: {
    name: string
    slug: string
    cover_url: string | null
    logo_url?: string | null
    brand_color?: string | null
  } | null
}

type HeadlinesSectionProps = {
  news: NewsItem[]
  seasonalImages: Map<string, SeasonalImage>
  gamePlatforms: Map<string, Platform[]>
}

function getSeasonalCoverUrl(
  gameId: string,
  defaultCoverUrl: string | null | undefined,
  seasonalImages: Map<string, SeasonalImage>
): string | null {
  const seasonal = seasonalImages.get(gameId)
  if (seasonal?.isSeasonal && seasonal.coverUrl) {
    return seasonal.coverUrl
  }
  return defaultCoverUrl ?? null
}

function getSeasonalLogoUrl(
  gameId: string,
  defaultLogoUrl: string | null | undefined,
  seasonalImages: Map<string, SeasonalImage>
): string | null {
  const seasonal = seasonalImages.get(gameId)
  if (seasonal?.isSeasonal && seasonal.logoUrl) {
    return seasonal.logoUrl
  }
  return defaultLogoUrl ?? null
}

function getPlatformsForGame(gameId: string, platformMap: Map<string, Platform[]>): Platform[] {
  return platformMap.get(gameId) || []
}

export function HeadlinesSection({ news, seasonalImages, gamePlatforms }: HeadlinesSectionProps) {
  if (news.length === 0) return null

  return (
    <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-b from-zinc-900/50 to-transparent border-t border-b border-white/5">
      <div className="space-y-4">
        <SectionHeader title="Latest Headlines" href="/news" glowLine />
        <div className="space-y-3">
          {news.slice(0, 5).map((newsItem) => (
            <MediaCard
              key={newsItem.id}
              href={`/news/${newsItem.id}`}
              title={newsItem.title}
              summary={newsItem.summary}
              whyItMatters={newsItem.why_it_matters}
              imageUrl={
                newsItem.game_id
                  ? getSeasonalCoverUrl(newsItem.game_id, newsItem.games?.cover_url, seasonalImages)
                  : newsItem.games?.cover_url
              }
              variant="horizontal"
              game={
                newsItem.game_id
                  ? {
                      name: newsItem.games?.name || 'General',
                      logoUrl: getSeasonalLogoUrl(newsItem.game_id, newsItem.games?.logo_url, seasonalImages),
                      platforms: getPlatformsForGame(newsItem.game_id, gamePlatforms),
                    }
                  : undefined
              }
              badges={
                <>
                  <Badge variant="news">News</Badge>
                  {newsItem.is_rumor && <Badge variant="rumor">Rumor</Badge>}
                </>
              }
              metaText={
                <MetaRow
                  items={[
                    newsItem.games?.name || 'General',
                    newsItem.source_name,
                    formatDate(newsItem.published_at),
                  ]}
                  size="xs"
                />
              }
            />
          ))}
        </div>
      </div>
    </section>
  )
}
