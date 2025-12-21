import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBacklogItem } from '../queries'
import { BacklogControls } from '@/components/backlog/BacklogControls'
import { WhatsNew } from '@/components/backlog/WhatsNew'
import { formatDate } from '@/lib/dates'

function WhatsNewSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-6 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-5 rounded bg-muted" />
        <div className="h-5 w-24 rounded bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </div>
    </div>
  )
}

async function getGame(gameId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('games')
    .select('id, name, slug, cover_url')
    .eq('id', gameId)
    .single()

  return data
}

export default async function BacklogDetailPage({
  params,
}: {
  params: { gameId: string }
}) {
  const [game, backlogItem] = await Promise.all([
    getGame(params.gameId),
    getBacklogItem(params.gameId),
  ])

  if (!game) {
    notFound()
  }

  const initialStatus = backlogItem?.status ?? 'backlog'
  const initialProgress = backlogItem?.progress ?? 0
  const initialNextNote = backlogItem?.next_note ?? null

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/backlog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Backlog
        </Link>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">{game.name}</h1>

        {backlogItem && (
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {backlogItem.last_played_at && (
              <span>Last played: {formatDate(backlogItem.last_played_at)}</span>
            )}
            {backlogItem.started_at && (
              <span>Started: {formatDate(backlogItem.started_at)}</span>
            )}
            {backlogItem.finished_at && (
              <span>Finished: {formatDate(backlogItem.finished_at)}</span>
            )}
          </div>
        )}
      </div>

      <Suspense fallback={<WhatsNewSkeleton />}>
        <WhatsNew gameId={params.gameId} />
      </Suspense>

      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <BacklogControls
          gameId={params.gameId}
          initialStatus={initialStatus}
          initialProgress={initialProgress}
          initialNextNote={initialNextNote}
        />
      </div>

      <p className="text-sm text-muted-foreground/70">
        Tip: Write the next step so you can jump back in later.
      </p>
    </div>
  )
}
