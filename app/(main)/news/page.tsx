import { getFlatNewsList, getTopStories, getNewsSources } from './queries'
import { NewsFeed } from './NewsFeed'

// Force dynamic rendering to always show latest news
export const dynamic = 'force-dynamic'

type SearchParams = {
  rumors?: string
  source?: string
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const includeRumors = params.rumors !== 'false'
  const selectedSource = params.source || null

  const [news, topStories, sources] = await Promise.all([
    getFlatNewsList({ includeRumors, source: selectedSource || undefined, limit: 50 }),
    getTopStories(2),
    getNewsSources(),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">News</h1>
        <p className="mt-1 text-muted-foreground">
          Skip the noise. PatchPulse tells you what matters.
        </p>
        {/* Glow divider */}
        <div className="relative h-0.5 w-full overflow-visible mt-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />
          <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-md" />
        </div>
      </div>

      {/* News Feed with Top Stories */}
      <NewsFeed
        news={news}
        topStories={topStories}
        includeRumors={includeRumors}
        sources={sources}
        selectedSource={selectedSource}
      />
    </div>
  )
}
