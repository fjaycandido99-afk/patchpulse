import Image from 'next/image'
import Link from 'next/link'
import { Gamepad2, Star } from 'lucide-react'

type Game = {
  id: string
  name: string
  slug: string
  cover_url: string | null
}

type BacklogGame = Game & {
  status: 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped'
  progress: number
}

type FollowedGamesContentProps = {
  followedGames: Game[]
  backlogGames: BacklogGame[]
  favoriteGameIds: string[]
}

function GameCard({ game, isFavorite }: { game: Game; isFavorite?: boolean }) {
  return (
    <Link
      href={`/backlog/${game.id}`}
      className="group relative flex flex-col rounded-lg border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors"
    >
      <div className="relative aspect-[3/4] bg-muted">
        {game.cover_url ? (
          <Image
            src={game.cover_url}
            alt={game.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 25vw, 120px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Gamepad2 className="h-6 w-6 text-muted-foreground" />
          </div>
        )}

        {isFavorite && (
          <div className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-amber-500">
            <Star className="h-2.5 w-2.5 text-white fill-white" />
          </div>
        )}
      </div>

      <div className="p-2">
        <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">
          {game.name}
        </p>
      </div>
    </Link>
  )
}

export function FollowedGamesContent({
  followedGames,
  backlogGames,
  favoriteGameIds,
}: FollowedGamesContentProps) {
  const favoriteSet = new Set(favoriteGameIds)
  const backlogGameIds = new Set(backlogGames.map((g) => g.id))

  // Get games that are followed but not in backlog
  const followedOnlyGames = followedGames.filter((g) => !backlogGameIds.has(g.id))

  // Sort favorites to the front
  const sortedFollowed = [...followedOnlyGames].sort((a, b) => {
    const aFav = favoriteSet.has(a.id) ? 0 : 1
    const bFav = favoriteSet.has(b.id) ? 0 : 1
    return aFav - bFav || a.name.localeCompare(b.name)
  })

  if (followedOnlyGames.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/10 flex items-center justify-center">
          <Gamepad2 className="h-6 w-6 text-blue-400" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No followed games</p>
        <p className="text-muted-foreground text-xs mb-4">Follow games to get updates</p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-sm font-medium border border-blue-500/20 transition-colors"
        >
          Discover Games
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
      {sortedFollowed.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          isFavorite={favoriteSet.has(game.id)}
        />
      ))}
    </div>
  )
}
