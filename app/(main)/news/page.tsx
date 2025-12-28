import { getNewsGroupedByGame, getNewsFiltersData } from './queries'
import { GroupedNewsFeed } from './GroupedNewsFeed'

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

  const [groupedNews, filtersData] = await Promise.all([
    getNewsGroupedByGame({ includeRumors }),
    getNewsFiltersData(),
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

      {/* Grouped Feed */}
      <GroupedNewsFeed
        groups={groupedNews.groups}
        lastVisit={groupedNews.lastVisit}
        newItemsCount={groupedNews.newItemsCount}
        includeRumors={includeRumors}
        followedGames={filtersData.followedGames}
        topStories={groupedNews.topStories}
      />
    </div>
  )
}
