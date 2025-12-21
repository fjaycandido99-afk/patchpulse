import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { getPatchById } from '../queries'
import { isBookmarked } from '@/app/(main)/actions/bookmarks'
import { BookmarkButton } from '@/components/ui/BookmarkButton'
import { formatDate } from '@/lib/dates'

type KeyChange = {
  category?: string
  change: string
}

function getImpactColor(score: number): string {
  if (score >= 8) return 'bg-red-500/10 text-red-400'
  if (score >= 5) return 'bg-yellow-500/10 text-yellow-400'
  return 'bg-green-500/10 text-green-400'
}

function getImpactLabel(score: number): string {
  if (score >= 8) return 'Major'
  if (score >= 5) return 'Medium'
  return 'Minor'
}

export default async function PatchDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const [patch, bookmarked] = await Promise.all([
    getPatchById(params.id),
    isBookmarked('patch', params.id),
  ])

  const keyChanges = Array.isArray(patch.key_changes)
    ? (patch.key_changes as KeyChange[])
    : []

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/patches"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Patches
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{patch.title}</h1>
            <p className="mt-1 text-muted-foreground">{patch.game.name}</p>
          </div>
          <BookmarkButton
            entityType="patch"
            entityId={patch.id}
            initialBookmarked={bookmarked}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {formatDate(patch.published_at)}
          </span>

          <div
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${getImpactColor(patch.impact_score)}`}
          >
            {getImpactLabel(patch.impact_score)} Impact ({patch.impact_score}/10)
          </div>

          {patch.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {patch.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {patch.summary_tldr && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">TL;DR</h2>
          <p className="text-muted-foreground">{patch.summary_tldr}</p>
        </section>
      )}

      {keyChanges.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Key Changes</h2>
          <ul className="space-y-2">
            {keyChanges.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
              >
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <div className="flex-1">
                  {item.category && (
                    <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {item.category}
                    </span>
                  )}
                  <span className="text-sm">{item.change}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {patch.raw_text && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Full Patch Notes</h2>
          <div className="rounded-lg border border-border bg-card p-4">
            <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
              {patch.raw_text}
            </pre>
          </div>
        </section>
      )}

      {patch.source_url && (
        <div className="border-t border-border pt-6">
          <a
            href={patch.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary transition-colors hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            View source
          </a>
        </div>
      )}
    </div>
  )
}
