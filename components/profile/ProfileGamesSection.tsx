import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Gamepad2, BookOpen, Star } from 'lucide-react'

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

type ProfileGamesSectionProps = {
  followedGames: Game[]
  backlogGames: BacklogGame[]
  favoriteGameIds: string[]
}

const STATUS_COLORS: Record<string, string> = {
  playing: 'bg-green-500',
  paused: 'bg-amber-500',
  backlog: 'bg-blue-500',
  finished: 'bg-purple-500',
  dropped: 'bg-zinc-500',
}

const STATUS_LABELS: Record<string, string> = {
  playing: 'Playing',
  paused: 'Paused',
  backlog: 'Backlog',
  finished: 'Finished',
  dropped: 'Dropped',
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

function BacklogGameCard({ game, isFavorite }: { game: BacklogGame; isFavorite?: boolean }) {
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

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold text-white ${STATUS_COLORS[game.status]}`}>
            {STATUS_LABELS[game.status]}
          </span>
        </div>

        {/* Favorite badge */}
        {isFavorite && (
          <div className="absolute top-2 right-2 p-1 rounded-full bg-amber-500">
            <Star className="h-3 w-3 text-white fill-white" />
          </div>
        )}

        {/* Progress bar */}
        {game.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div
              className="h-full bg-primary"
              style={{ width: `${game.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Name */}
      <div className="p-2">
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
          {game.name}
        </p>
        {game.progress > 0 && (
          <p className="text-xs text-muted-foreground">{game.progress}% complete</p>
        )}
      </div>
    </Link>
  )
}

export function ProfileGamesSection({
  followedGames,
  backlogGames,
  favoriteGameIds,
}: ProfileGamesSectionProps) {
  const favoriteSet = new Set(favoriteGameIds)

  // Separate backlog games that are also followed
  const backlogGameIds = new Set(backlogGames.map((g) => g.id))
  const followedOnlyGames = followedGames.filter((g) => !backlogGameIds.has(g.id))

  // Sort favorites to the front
  const sortedFollowed = [...followedOnlyGames].sort((a, b) => {
    const aFav = favoriteSet.has(a.id) ? 0 : 1
    const bFav = favoriteSet.has(b.id) ? 0 : 1
    return aFav - bFav || a.name.localeCompare(b.name)
  })

  const sortedBacklog = [...backlogGames].sort((a, b) => {
    const aFav = favoriteSet.has(a.id) ? 0 : 1
    const bFav = favoriteSet.has(b.id) ? 0 : 1
    return aFav - bFav || a.name.localeCompare(b.name)
  })

  return (
    <div className="space-y-8">
      {/* Followed Games */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold">Followed Games</h3>
            <span className="text-sm text-muted-foreground">({followedOnlyGames.length})</span>
          </div>
          {followedOnlyGames.length > 6 && (
            <Link
              href="/home"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
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
            {sortedFollowed.slice(0, 12).map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isFavorite={favoriteSet.has(game.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Backlog Games */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-semibold">My Backlog</h3>
            <span className="text-sm text-muted-foreground">({backlogGames.length})</span>
          </div>
          {backlogGames.length > 0 && (
            <Link
              href="/backlog"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              Manage backlog
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {backlogGames.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No games in backlog</p>
            <Link
              href="/backlog"
              className="text-sm text-primary hover:underline mt-1 inline-block"
            >
              Add games to your backlog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {sortedBacklog.slice(0, 12).map((game) => (
              <BacklogGameCard
                key={game.id}
                game={game}
                isFavorite={favoriteSet.has(game.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
