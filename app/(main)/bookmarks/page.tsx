import Link from 'next/link'
import { getBookmarkedPatches, getBookmarkedNews } from './queries'
import { MediaCard } from '@/components/media/MediaCard'
import { Badge, ImpactBadge } from '@/components/ui/badge'
import { MetaRow } from '@/components/ui/MetaRow'
import { formatDate } from '@/lib/dates'

export default async function BookmarksPage() {
  const [patches, news] = await Promise.all([
    getBookmarkedPatches(),
    getBookmarkedNews(),
  ])

  const hasBookmarks = patches.length > 0 || news.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Saved</h1>
        <p className="mt-1 text-muted-foreground">
          Your bookmarked patches and news
        </p>
      </div>

      {!hasBookmarks ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No saved items yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Bookmark patches and news to save them here for later
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/patches"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Browse Patches
            </Link>
            <Link
              href="/news"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Browse News
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {patches.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">
                Saved Patches
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({patches.length})
                </span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {patches.map((item) => (
                  <MediaCard
                    key={item.id}
                    href={`/patches/${item.patch.id}`}
                    title={item.patch.title}
                    summary={item.patch.summary_tldr}
                    imageUrl={item.patch.game?.cover_url}
                    badges={
                      <>
                        <Badge variant="patch">Patch</Badge>
                        <ImpactBadge score={item.patch.impact_score} showScore={false} />
                      </>
                    }
                    metaText={
                      <MetaRow
                        items={[
                          item.patch.game?.name,
                          formatDate(item.patch.published_at),
                        ]}
                        size="xs"
                      />
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {news.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">
                Saved News
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({news.length})
                </span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {news.map((item) => (
                  <MediaCard
                    key={item.id}
                    href={`/news/${item.news.id}`}
                    title={item.news.title}
                    summary={item.news.summary}
                    imageUrl={item.news.game?.cover_url}
                    badges={
                      <>
                        <Badge variant="news">News</Badge>
                        {item.news.is_rumor && <Badge variant="rumor">Rumor</Badge>}
                      </>
                    }
                    metaText={
                      <MetaRow
                        items={[
                          item.news.game?.name || 'General',
                          formatDate(item.news.published_at),
                        ]}
                        size="xs"
                      />
                    }
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
