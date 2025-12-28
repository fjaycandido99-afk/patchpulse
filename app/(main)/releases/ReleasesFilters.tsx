'use client'

import { useRouter } from 'next/navigation'

type ReleasesFiltersProps = {
  currentDays: 7 | 14 | 30
  currentPlatform: string
  counts: {
    last7: number
    last14: number
    last30: number
  }
}

export function ReleasesFilters({
  currentDays,
  currentPlatform,
  counts,
}: ReleasesFiltersProps) {
  const router = useRouter()

  function buildUrl(params: { days?: number; platform?: string }): string {
    const newParams = new URLSearchParams()

    const finalDays = params.days !== undefined ? params.days : currentDays
    const finalPlatform = params.platform !== undefined ? params.platform : currentPlatform

    if (finalDays !== 30) newParams.set('days', String(finalDays))
    if (finalPlatform && finalPlatform !== 'all') newParams.set('platform', finalPlatform)

    const queryString = newParams.toString()
    return queryString ? `/releases?${queryString}` : '/releases'
  }

  const dayOptions = [
    { value: 7, label: 'Last 7 days', count: counts.last7 },
    { value: 14, label: 'Last 14 days', count: counts.last14 },
    { value: 30, label: 'Last 30 days', count: counts.last30 },
  ] as const

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Days filter as chip buttons */}
      <div className="flex rounded-lg border border-border bg-card p-1">
        {dayOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => router.push(buildUrl({ days: option.value }))}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              currentDays === option.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {option.value}d
            {option.count > 0 && (
              <span className="ml-1 opacity-60">({option.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Platform filter */}
      <select
        className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
        value={currentPlatform}
        onChange={(e) => router.push(buildUrl({ platform: e.target.value }))}
      >
        <option value="all">All Platforms</option>
        <option value="pc">PC</option>
        <option value="playstation">PlayStation</option>
        <option value="xbox">Xbox</option>
        <option value="switch">Switch</option>
      </select>
    </div>
  )
}
