import Link from 'next/link'
import { getPatchFiltersData, getPatchesList } from './queries'
import { formatDate } from '@/lib/dates'

type SearchParams = {
  game?: string
  tag?: string
  importance?: string
  page?: string
}

function getImpactColor(score: number): string {
  if (score >= 8) return 'bg-red-500/10 text-red-400'
  if (score >= 5) return 'bg-yellow-500/10 text-yellow-400'
  return 'bg-green-500/10 text-green-400'
}

function buildUrl(
  base: Record<string, string | undefined>,
  updates: Record<string, string | undefined>
): string {
  const params = new URLSearchParams()

  const merged = { ...base, ...updates }

  if (merged.game) params.set('game', merged.game)
  if (merged.tag) params.set('tag', merged.tag)
  if (merged.importance) params.set('importance', merged.importance)
  if (merged.page && merged.page !== '1') params.set('page', merged.page)

  const query = params.toString()
  return query ? `/patches?${query}` : '/patches'
}

export default async function PatchesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const gameId = searchParams.game
  const tag = searchParams.tag
  const importance = searchParams.importance as
    | 'major'
    | 'medium'
    | 'minor'
    | undefined
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1

  const [filtersData, patchesResult] = await Promise.all([
    getPatchFiltersData(),
    getPatchesList({
      gameId,
      tag,
      importance:
        importance && ['major', 'medium', 'minor'].includes(importance)
          ? importance
          : undefined,
      page,
    }),
  ])

  const currentFilters = {
    game: gameId,
    tag: tag,
    importance: importance,
    page: undefined,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patches</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Latest patch notes from your followed games
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <select
            defaultValue={gameId || ''}
            className="appearance-none rounded-lg border border-input bg-background px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Games</option>
            {filtersData.followedGames.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        <div className="relative">
          <select
            defaultValue={tag || ''}
            className="appearance-none rounded-lg border border-input bg-background px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Tags</option>
            {filtersData.availableTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        <div className="relative">
          <select
            defaultValue={importance || ''}
            className="appearance-none rounded-lg border border-input bg-background px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Importance</option>
            <option value="major">Major (8-10)</option>
            <option value="medium">Medium (5-7)</option>
            <option value="minor">Minor (1-4)</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      <noscript>
        <p className="text-sm text-muted-foreground">
          Enable JavaScript for filter functionality
        </p>
      </noscript>

      <div className="flex flex-wrap gap-2">
        {filtersData.followedGames.map((game) => (
          <Link
            key={game.id}
            href={buildUrl(currentFilters, {
              game: gameId === game.id ? undefined : game.id,
            })}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              gameId === game.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-input bg-background hover:bg-accent'
            }`}
          >
            {game.name}
          </Link>
        ))}
      </div>

      {patchesResult.items.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            No patches found matching your filters.
          </p>
          <Link
            href="/patches"
            className="mt-4 inline-block text-sm text-primary hover:underline"
          >
            Clear all filters
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {patchesResult.items.map((patch) => (
              <Link
                key={patch.id}
                href={`/patches/${patch.id}`}
                className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold group-hover:text-primary">
                      {patch.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {patch.game.name}
                    </p>
                  </div>
                  <div
                    className={`flex-shrink-0 rounded-md px-2 py-1 text-xs font-medium ${getImpactColor(patch.impact_score)}`}
                  >
                    {patch.impact_score}/10
                  </div>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(patch.published_at)}
                </p>

                {patch.summary_tldr && (
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {patch.summary_tldr}
                  </p>
                )}

                {patch.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {patch.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                    {patch.tags.length > 3 && (
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        +{patch.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-6">
            <div className="text-sm text-muted-foreground">
              Page {patchesResult.page}
            </div>
            <div className="flex gap-2">
              {patchesResult.page > 1 && (
                <Link
                  href={buildUrl(currentFilters, {
                    page: String(patchesResult.page - 1),
                  })}
                  className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  Previous
                </Link>
              )}
              {patchesResult.hasMore && (
                <Link
                  href={buildUrl(currentFilters, {
                    page: String(patchesResult.page + 1),
                  })}
                  className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
