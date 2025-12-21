import Image from 'next/image'
import { getGames } from './actions'
import { CreateGameForm } from './CreateGameForm'
import { EditGameButton } from './EditGameButton'
import { DeleteGameButton } from './DeleteGameButton'

export default async function AdminGamesPage() {
  const games = await getGames()

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-xl font-semibold mb-6">Add Game</h1>
        <CreateGameForm />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">
          Games ({games.length})
        </h2>

        {games.length === 0 ? (
          <p className="text-sm text-zinc-500">No games yet. Add one above.</p>
        ) : (
          <div className="space-y-2">
            {games.map((game) => (
              <div
                key={game.id}
                className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-3"
              >
                <div className="relative h-12 w-9 flex-shrink-0 overflow-hidden rounded bg-zinc-800">
                  {game.cover_url ? (
                    <Image
                      src={game.cover_url}
                      alt={game.name}
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-zinc-600">
                      ?
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{game.name}</p>
                  <p className="text-xs text-zinc-500 truncate">
                    {game.slug}
                    {game.platforms && game.platforms.length > 0 && (
                      <span className="ml-2">
                        · {game.platforms.join(', ')}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <EditGameButton game={game} />
                  <DeleteGameButton gameId={game.id} gameName={game.name} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
