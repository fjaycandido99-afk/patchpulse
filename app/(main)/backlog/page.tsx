import Link from 'next/link'
import { getBacklogBoard, getFollowedGamesForBacklogPicker } from './queries'
import { AddToBacklogPanel } from '@/components/backlog/AddToBacklogPanel'
import { relativeDaysText } from '@/lib/dates'

type BacklogStatus = 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped'

const SECTION_CONFIG: {
  key: BacklogStatus
  title: string
  emptyText: string
}[] = [
  { key: 'playing', title: 'Playing', emptyText: 'Nothing currently playing' },
  { key: 'paused', title: 'Paused', emptyText: 'No paused games' },
  { key: 'backlog', title: 'Backlog', emptyText: 'Backlog is empty' },
  { key: 'finished', title: 'Finished', emptyText: 'No finished games yet' },
  { key: 'dropped', title: 'Dropped', emptyText: 'No dropped games' },
]

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted">
      <div
        className="h-1.5 rounded-full bg-primary transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export default async function BacklogPage() {
  const [board, followedGames] = await Promise.all([
    getBacklogBoard(),
    getFollowedGamesForBacklogPicker(),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Backlog</h1>
        <p className="mt-1 text-muted-foreground">
          Track your gaming progress and what to play next
        </p>
      </div>

      <AddToBacklogPanel games={followedGames} />

      <div className="space-y-8">
        {SECTION_CONFIG.map(({ key, title, emptyText }) => {
          const items = board[key]
          return (
            <section key={key} className="space-y-3">
              <h2 className="text-lg font-semibold">
                {title}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({items.length})
                </span>
              </h2>

              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">{emptyText}</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/backlog/${item.game_id}`}
                      className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
                    >
                      <div className="space-y-3">
                        <h3 className="font-medium leading-tight group-hover:text-primary">
                          {item.game.name}
                        </h3>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{item.progress}%</span>
                          </div>
                          <ProgressBar value={item.progress} />
                        </div>

                        {item.next_note && (
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            Next: {item.next_note}
                          </p>
                        )}

                        {item.last_played_at && (
                          <p className="text-xs text-muted-foreground/70">
                            Last played {relativeDaysText(item.last_played_at)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
