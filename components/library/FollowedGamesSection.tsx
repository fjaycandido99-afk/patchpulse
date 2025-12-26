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

type FollowedGamesSectionProps = {
  followedGames: Game[]
  backlogGames: BacklogGame[]
  favoriteGameIds: string[]
}

function GameCard({ game, isFavorite }: { game: Game; isFavorite?: boolean }) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className="group relative flex flex-col rounded-lg border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors"
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] bg-muted">
        {game.cover_url ? (
          <Image
            src={game.cover_url}
            alt={game.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 33vw, 150px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Gamepad2 className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        {/* Favorite badge */}
        {isFavorite && (
          <div className="absolute top-2 right-2 p-1 rounded-full bg-amber-500">
            <Star className="h-3 w-3 text-white fill-white" />
          </div>
        )}
      </div>

      {/* Name */}
      <div className="p-2">
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
          {game.name}
        </p>
      </div>
    </Link>
  )
}

export function FollowedGamesSection({
  followedGames,
  backlogGames,
  favoriteGameIds,
}: FollowedGamesSectionProps) {
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

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold">Followed Games</h3>
          <span className="text-sm text-muted-foreground">({followedOnlyGames.length})</span>
        </div>
      </div>

      {followedOnlyGames.length === 0 ? (
        <div className="text-center py-8">
          <Gamepad2 className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No followed games yet</p>
          <Link
            href="/search"
            className="text-sm text-primary hover:underline mt-1 inline-block"
          >
            Search for games to follow
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {sortedFollowed.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isFavorite={favoriteSet.has(game.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
