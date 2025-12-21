'use client'

import { useRouter } from 'next/navigation'

type Game = {
  id: string
  name: string
  slug: string
}

type NewsFiltersProps = {
  followedGames: Game[]
  availableTopics: string[]
  currentGameId?: string
  currentTopic?: string
  includeRumors: boolean
}

export function NewsFilters({
  followedGames,
  availableTopics,
  currentGameId,
  currentTopic,
  includeRumors,
}: NewsFiltersProps) {
  const router = useRouter()

  function buildUrl(params: {
    game?: string
    topic?: string
    rumors?: boolean
  }): string {
    const newParams = new URLSearchParams()

    const finalGame = params.game !== undefined ? params.game : currentGameId
    const finalTopic = params.topic !== undefined ? params.topic : currentTopic
    const finalRumors =
      params.rumors !== undefined ? params.rumors : includeRumors

    if (finalGame) newParams.set('game', finalGame)
    if (finalTopic) newParams.set('topic', finalTopic)
    if (finalRumors) newParams.set('rumors', 'true')

    const queryString = newParams.toString()
    return queryString ? `/news?${queryString}` : '/news'
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        className="rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        value={currentGameId || ''}
        onChange={(e) => {
          router.push(buildUrl({ game: e.target.value }))
        }}
      >
        <option value="">All Games</option>
        {followedGames.map((game) => (
          <option key={game.id} value={game.id}>
            {game.name}
          </option>
        ))}
      </select>

      <select
        className="rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        value={currentTopic || ''}
        onChange={(e) => {
          router.push(buildUrl({ topic: e.target.value }))
        }}
      >
        <option value="">All Topics</option>
        {availableTopics.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={includeRumors}
          onChange={(e) => {
            router.push(buildUrl({ rumors: e.target.checked }))
          }}
          className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-primary"
        />
        <span className="text-muted-foreground">Include rumors</span>
      </label>
    </div>
  )
}
