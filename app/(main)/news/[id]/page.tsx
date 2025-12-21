import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { getNewsById } from '../queries'
import { isBookmarked } from '@/app/(main)/actions/bookmarks'
import { BookmarkButton } from '@/components/ui/BookmarkButton'
import { formatDate } from '@/lib/dates'

export default async function NewsDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const [news, bookmarked] = await Promise.all([
    getNewsById(params.id),
    isBookmarked('news', params.id),
  ])

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/news"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to News
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">{news.title}</h1>
          <BookmarkButton
            entityType="news"
            entityId={news.id}
            initialBookmarked={bookmarked}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-muted-foreground">
            {news.game?.name || 'General'}
          </span>

          <span className="text-muted-foreground">•</span>

          <span className="text-sm text-muted-foreground">
            {formatDate(news.published_at)}
          </span>

          {news.is_rumor && (
            <span className="rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-400">
              Rumor
            </span>
          )}
        </div>
      </div>

      {news.summary && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Summary</h2>
          <p className="text-muted-foreground">{news.summary}</p>
        </section>
      )}

      {news.why_it_matters && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Why It Matters</h2>
          <p className="text-muted-foreground">{news.why_it_matters}</p>
        </section>
      )}

      {news.topics.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Topics</h2>
          <div className="flex flex-wrap gap-2">
            {news.topics.map((topic) => (
              <span
                key={topic}
                className="rounded-md bg-muted px-2.5 py-1 text-sm text-muted-foreground"
              >
                {topic}
              </span>
            ))}
          </div>
        </section>
      )}

      {(news.source_name || news.source_url) && (
        <div className="border-t border-border pt-6">
          {news.source_url ? (
            <a
              href={news.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary transition-colors hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              {news.source_name || 'View source'}
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">
              Source: {news.source_name}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
