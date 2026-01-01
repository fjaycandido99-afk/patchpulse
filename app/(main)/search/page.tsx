import Link from 'next/link'
import { search, type SearchCategory } from './queries'
import { logSearchRequest } from './actions'
import { formatDate } from '@/lib/dates'
import { Search, Gamepad2, FileText, Newspaper } from 'lucide-react'
import { SearchImage } from './SearchImage'

type SearchParams = {
  q?: string
  category?: SearchCategory
}

function getImpactColor(score: number): string {
  if (score >= 8) return 'bg-red-500/10 text-red-400'
  if (score >= 5) return 'bg-yellow-500/10 text-yellow-400'
  return 'bg-green-500/10 text-green-400'
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const query = params.q || ''
  const category = (params.category as SearchCategory) || 'all'

  const results = await search(query, category)

  const totalResults =
    results.games.length + results.patches.length + results.news.length

  const categories: { id: SearchCategory; label: string; icon: typeof Search; count: number }[] = [
    { id: 'all', label: 'All', icon: Search, count: totalResults },
    { id: 'games', label: 'Games', icon: Gamepad2, count: results.games.length },
    { id: 'patches', label: 'Patches', icon: FileText, count: results.patches.length },
    { id: 'news', label: 'News', icon: Newspaper, count: results.news.length },
  ]

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {query ? `Results for "${query}"` : 'Search'}
        </h1>
        {query && (
          <p className="mt-1 text-sm text-muted-foreground">
            {totalResults} result{totalResults !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon
          const isActive = category === cat.id
          return (
            <Link
              key={cat.id}
              href={`/search?q=${encodeURIComponent(query)}&category=${cat.id}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
              {cat.count > 0 && (
                <span className={`ml-1 text-xs ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  ({cat.count})
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* No query state */}
      {!query && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            Enter a search term to find games, patches, and news.
          </p>
        </div>
      )}

      {/* No results state - log search for admin review */}
      {query && results.games.length === 0 && (
        <NoResultsLogger query={query} hasOtherResults={results.patches.length > 0 || results.news.length > 0} />
      )}

      {/* Results */}
      {query && totalResults > 0 && (
        <div className="space-y-6">
          {/* Games */}
          {results.games.length > 0 && (category === 'all' || category === 'games') && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-primary" />
                  Games
                </h2>
                {category === 'all' && results.games.length >= 5 && (
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&category=games`}
                    className="text-sm text-primary hover:underline"
                  >
                    View all
                  </Link>
                )}
              </div>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {results.games.map((game) => (
                  <Link
                    key={game.id}
                    href={`/backlog/${game.id}`}
                    className="group flex flex-col overflow-hidden rounded-xl border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all bg-card"
                  >
                    {/* Cover Image */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                      {game.cover_url ? (
                        <SearchImage src={game.cover_url} alt={game.name} type="game" fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Gamepad2 className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    {/* Title */}
                    <div className="p-3">
                      <h3 className="text-sm font-semibold line-clamp-2">{game.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Patches */}
          {results.patches.length > 0 && (category === 'all' || category === 'patches') && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Patches
                </h2>
                {category === 'all' && results.patches.length >= 5 && (
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&category=patches`}
                    className="text-sm text-primary hover:underline"
                  >
                    View all
                  </Link>
                )}
              </div>
              <div className="space-y-2">
                {results.patches.map((patch) => (
                  <Link
                    key={patch.id}
                    href={`/patches/${patch.id}`}
                    className="flex gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    {patch.game.cover_url ? (
                      <SearchImage src={patch.game.cover_url} alt={patch.game.name} type="patch" />
                    ) : (
                      <div className="w-14 h-14 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-medium line-clamp-1">{patch.title}</h3>
                        <span className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${getImpactColor(patch.impact_score)}`}>
                          {patch.impact_score}/10
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {patch.game.name} &middot; {formatDate(patch.published_at)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* News */}
          {results.news.length > 0 && (category === 'all' || category === 'news') && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-primary" />
                  News
                </h2>
                {category === 'all' && results.news.length >= 5 && (
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&category=news`}
                    className="text-sm text-primary hover:underline"
                  >
                    View all
                  </Link>
                )}
              </div>
              <div className="space-y-2">
                {results.news.map((item) => (
                  <Link
                    key={item.id}
                    href={`/news/${item.id}`}
                    className="flex gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    {item.game?.cover_url ? (
                      <SearchImage src={item.game.cover_url} alt={item.game.name} type="news" />
                    ) : (
                      <div className="w-14 h-14 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Newspaper className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <h3 className="text-sm font-medium line-clamp-1 flex-1">{item.title}</h3>
                        {item.is_rumor && (
                          <span className="flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium bg-yellow-500/10 text-yellow-400">
                            Rumor
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.game?.name || 'General'}
                        {item.source_name && <> &middot; {item.source_name}</>}
                        {' '}&middot; {formatDate(item.published_at)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

// Server component that logs failed game searches
async function NoResultsLogger({ query, hasOtherResults }: { query: string; hasOtherResults: boolean }) {
  // Log the search request for admin review
  await logSearchRequest(query)

  if (hasOtherResults) {
    // Only show message if there are no games but there are patches/news
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
        <Gamepad2 className="w-8 h-8 mx-auto text-primary/60 mb-2" />
        <p className="text-sm font-medium text-foreground">
          Can&apos;t find &quot;{query}&quot;?
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          We&apos;ve noted your request and will add it soon!
        </p>
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
        <Gamepad2 className="w-8 h-8 text-primary/60" />
      </div>
      <p className="text-lg font-medium mb-2">Can&apos;t find &quot;{query}&quot;?</p>
      <p className="text-muted-foreground text-sm max-w-md mx-auto">
        We&apos;ve noted your request! Our team reviews these regularly and will add popular games soon.
      </p>
    </div>
  )
}
