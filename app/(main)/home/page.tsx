import { getHomeFeed } from './queries'
import { HeroCard } from '@/components/media/HeroCard'
import { MediaCard } from '@/components/media/MediaCard'
import { BacklogCard } from '@/components/backlog/BacklogCard'
import { Badge, ImpactBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { MetaRow } from '@/components/ui/MetaRow'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { InstallHint } from '@/components/ui/InstallHint'
import { formatDate, relativeDaysText } from '@/lib/dates'

export default async function HomePage() {
  const feed = await getHomeFeed()

  const heroItem =
    feed.topPatches.length > 0
      ? { type: 'patch' as const, data: feed.topPatches[0] }
      : feed.latestNews.length > 0
        ? { type: 'news' as const, data: feed.latestNews[0] }
        : null

  const remainingPatches = heroItem?.type === 'patch'
    ? feed.topPatches.slice(1)
    : feed.topPatches

  const remainingNews = heroItem?.type === 'news'
    ? feed.latestNews.slice(1)
    : feed.latestNews

  const hasContent =
    feed.topPatches.length > 0 ||
    feed.latestNews.length > 0 ||
    feed.backlogNudge ||
    feed.upcomingWishlist.length > 0

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome to PatchPulse</h1>
        <p className="mt-2 text-muted-foreground max-w-md">
          Follow some games to see patches, news, and updates here.
        </p>
      </div>
    )
  }

  return (
    <>
      <InstallHint />
      <div className="space-y-6 sm:space-y-8">
        {heroItem && (
        <section>
          {heroItem.type === 'patch' ? (
            <HeroCard
              href={`/patches/${heroItem.data.id}`}
              title={heroItem.data.title}
              summary={heroItem.data.summary_tldr}
              fallbackTitle={heroItem.data.games?.name}
              badges={
                <>
                  <Badge variant="patch" size="md">Patch</Badge>
                  <ImpactBadge score={heroItem.data.impact_score} size="md" />
                </>
              }
              metaLeft={
                <MetaRow
                  items={[
                    heroItem.data.games?.name,
                    formatDate(heroItem.data.published_at),
                  ]}
                  size="sm"
                />
              }
            />
          ) : (
            <HeroCard
              href={`/news/${heroItem.data.id}`}
              title={heroItem.data.title}
              summary={heroItem.data.summary}
              fallbackTitle={heroItem.data.games?.name || 'Gaming News'}
              badges={
                <>
                  <Badge variant="news" size="md">News</Badge>
                  {heroItem.data.is_rumor && (
                    <Badge variant="rumor" size="md">Rumor</Badge>
                  )}
                </>
              }
              metaLeft={
                <MetaRow
                  items={[
                    heroItem.data.games?.name || 'General',
                    heroItem.data.source_name,
                    formatDate(heroItem.data.published_at),
                  ]}
                  size="sm"
                />
              }
            />
          )}
        </section>
      )}

      <div className="lg:flex lg:gap-8">
        <div className="flex-1 space-y-6 sm:space-y-8">
          {remainingPatches.length > 0 && (
            <section className="space-y-3">
              <SectionHeader title="Biggest Changes" href="/patches" />

              <div className="-mx-4 px-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory sm:mx-0 sm:px-0 sm:overflow-visible sm:snap-none">
                <div className="flex gap-4 sm:grid sm:grid-cols-2 sm:gap-4">
                  {remainingPatches.slice(0, 4).map((patch) => (
                    <div key={patch.id} className="w-72 flex-shrink-0 snap-start sm:w-auto sm:snap-align-none">
                      <MediaCard
                        href={`/patches/${patch.id}`}
                        title={patch.title}
                        summary={patch.summary_tldr}
                        imageUrl={patch.games?.cover_url}
                        badges={
                          <>
                            <Badge variant="patch">Patch</Badge>
                            <ImpactBadge score={patch.impact_score} showScore={false} />
                          </>
                        }
                        metaText={
                          <MetaRow
                            items={[
                              patch.games?.name,
                              formatDate(patch.published_at),
                            ]}
                            size="xs"
                          />
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {remainingNews.length > 0 && (
            <section className="space-y-3">
              <SectionHeader title="Latest Headlines" href="/news" />

              <div className="space-y-3">
                {remainingNews.slice(0, 5).map((news) => (
                  <MediaCard
                    key={news.id}
                    href={`/news/${news.id}`}
                    title={news.title}
                    summary={news.summary}
                    imageUrl={news.games?.cover_url}
                    variant="horizontal"
                    badges={
                      <>
                        <Badge variant="news">News</Badge>
                        {news.is_rumor && <Badge variant="rumor">Rumor</Badge>}
                      </>
                    }
                    metaText={
                      <MetaRow
                        items={[
                          news.games?.name || 'General',
                          news.source_name,
                          formatDate(news.published_at),
                        ]}
                        size="xs"
                      />
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {feed.backlogNudge && (
            <section className="space-y-3">
              <SectionHeader title="Continue Playing" href="/backlog" />
              <BacklogCard
                href={`/backlog/${feed.backlogNudge.game_id}`}
                title={feed.backlogNudge.games?.name || 'Unknown Game'}
                progress={feed.backlogNudge.progress}
                imageUrl={feed.backlogNudge.games?.cover_url}
                lastPlayedText={
                  feed.backlogNudge.last_played_at
                    ? `Last played ${relativeDaysText(feed.backlogNudge.last_played_at)}`
                    : undefined
                }
              />
            </section>
          )}

          <div className="lg:hidden">
            <ReleaseRadarSection wishlist={feed.upcomingWishlist} />
          </div>
        </div>

        <aside className="hidden lg:block lg:w-80 lg:flex-shrink-0">
          <div className="sticky top-6">
            <ReleaseRadarSection wishlist={feed.upcomingWishlist} />
          </div>
        </aside>
      </div>
    </div>
    </>
  )
}

type WishlistItem = {
  id: string
  game_id: string
  games: {
    name: string
    slug: string
    cover_url: string | null
    release_date: string
  } | null
}

function ReleaseRadarSection({ wishlist }: { wishlist: WishlistItem[] }) {
  if (wishlist.length === 0) {
    return null
  }

  return (
    <section className="space-y-3">
      <SectionHeader title="Release Radar" href="/profile" />
      <Card variant="subtle" className="p-0 overflow-hidden">
        <div className="divide-y divide-border">
          {wishlist.map((item) => {
            const releaseDate = item.games?.release_date
              ? new Date(item.games.release_date)
              : null
            const daysUntil = releaseDate
              ? Math.ceil(
                  (releaseDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                )
              : null

            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">
                    {item.games?.name || 'Unknown Game'}
                  </h3>
                  {releaseDate && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(releaseDate)}
                    </p>
                  )}
                </div>
                {daysUntil !== null && (
                  <Badge variant="upcoming" size="sm">
                    {daysUntil <= 0 ? 'Out Now' : daysUntil === 1 ? '1 day' : `${daysUntil} days`}
                  </Badge>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </section>
  )
}
