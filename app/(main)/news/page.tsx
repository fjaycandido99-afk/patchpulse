import Link from 'next/link'
import { getNewsFiltersData, getNewsList } from './queries'
import { formatDate } from '@/lib/dates'
import { NewsFilters } from './NewsFilters'
import { MediaCard } from '@/components/media/MediaCard'
import { Badge } from '@/components/ui/Badge'
import { MetaRow } from '@/components/ui/MetaRow'
import { TagChipList } from '@/components/ui/TagChip'

type SearchParams = {
  game?: string
  topic?: string
  rumors?: string
  page?: string
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const gameId = searchParams.game
  const topic = searchParams.topic
  const includeRumors = searchParams.rumors === 'true'
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1

  const [filtersData, newsResult] = await Promise.all([
    getNewsFiltersData(),
    getNewsList({ gameId, topic, includeRumors, page }),
  ])

  const { followedGames, availableTopics } = filtersData
  const { items: newsItems, hasMore } = newsResult

  function buildUrl(newPage: number): string {
    const params = new URLSearchParams()

    if (gameId) params.set('game', gameId)
    if (topic) params.set('topic', topic)
    if (includeRumors) params.set('rumors', 'true')
    if (newPage > 1) params.set('page', String(newPage))

    const queryString = params.toString()
    return queryString ? `/news?${queryString}` : '/news'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">News</h1>
        <p className="mt-1 text-muted-foreground">
          Noise-free updates for your games
        </p>
      </div>

      <NewsFilters
        followedGames={followedGames}
        availableTopics={availableTopics}
        currentGameId={gameId}
        currentTopic={topic}
        includeRumors={includeRumors}
      />

      {newsItems.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No news found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or follow more games
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {newsItems.map((news) => (
            <MediaCard
              key={news.id}
              href={`/news/${news.id}`}
              title={news.title}
              summary={news.summary}
              imageUrl={news.game?.cover_url}
              badges={
                <>
                  <Badge variant="news">News</Badge>
                  {news.is_rumor && <Badge variant="rumor">Rumor</Badge>}
                </>
              }
              metaText={
                <div className="space-y-2">
                  <MetaRow
                    items={[
                      news.game?.name || 'General',
                      formatDate(news.published_at),
                    ]}
                    size="xs"
                  />
                  {news.topics.length > 0 && (
                    <TagChipList tags={news.topics} max={3} />
                  )}
                </div>
              }
            />
          ))}
        </div>
      )}

      {(page > 1 || hasMore) && (
        <div className="flex items-center justify-center gap-4">
          {page > 1 ? (
            <Link
              href={buildUrl(page - 1)}
              className="rounded-md border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-muted"
            >
              Previous
            </Link>
          ) : (
            <span className="rounded-md border border-border bg-card px-4 py-2 text-sm text-muted-foreground opacity-50">
              Previous
            </span>
          )}

          <span className="text-sm text-muted-foreground">Page {page}</span>

          {hasMore ? (
            <Link
              href={buildUrl(page + 1)}
              className="rounded-md border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-muted"
            >
              Next
            </Link>
          ) : (
            <span className="rounded-md border border-border bg-card px-4 py-2 text-sm text-muted-foreground opacity-50">
              Next
            </span>
          )}
        </div>
      )}
    </div>
  )
}
