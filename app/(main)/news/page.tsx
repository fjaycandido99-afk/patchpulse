import { getFlatNewsList } from './queries'
import { NewsFeed } from './NewsFeed'

type SearchParams = {
  rumors?: string
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const includeRumors = params.rumors !== 'false'

  const news = await getFlatNewsList({ includeRumors, limit: 50 })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">News</h1>
        <p className="mt-1 text-muted-foreground">
          Skip the noise. PatchPulse tells you what matters.
        </p>
      </div>

      {/* Flat News Feed */}
      <NewsFeed news={news} includeRumors={includeRumors} />
    </div>
  )
}
