import { getFlatNewsList, getTopStories, getNewsSources } from './queries'
import { NewsFeed } from './NewsFeed'

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
