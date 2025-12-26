import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ExternalLink, Sparkles, Brain, Zap, Users, Trophy } from 'lucide-react'
import { getNewsById, getRelatedNews } from '../queries'
import { isBookmarked } from '@/app/(main)/actions/bookmarks'
import { BookmarkButton } from '@/components/ui/BookmarkButton'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { GameLogo } from '@/components/ui/GameLogo'
import { formatDate, relativeDaysText } from '@/lib/dates'

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [news, bookmarked] = await Promise.all([
    getNewsById(id),
    isBookmarked('news', id),
  ])

  const relatedNews = await getRelatedNews(
    news.id,
    news.game?.id || null,
    news.topics,
    4
  )

  const brandColor = news.game?.brand_color || '#6366f1'
  const heroImage = news.game?.hero_url || news.game?.cover_url

  return (
    <div className="space-y-6 sm:space-y-8 page-enter">
      {/* Hero Section with Game Visual */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          {heroImage ? (
            <Image
              src={heroImage}
              alt=""
              fill
              className="object-cover opacity-20 blur-sm"
              priority
            />
          ) : (
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `linear-gradient(135deg, ${brandColor}40 0%, transparent 50%, ${brandColor}20 100%)`
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(ellipse at top, ${brandColor}30 0%, transparent 70%)`
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-6 sm:pb-8">
          {/* Back Button */}
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground mb-4 sm:mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Link>

          {/* Game Badge + Meta Row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {news.game && (
              <div className="flex items-center gap-2">
                {news.game.logo_url ? (
                  <GameLogo
                    logoUrl={news.game.logo_url}
                    gameName={news.game.name}
                    size="sm"
                  />
                ) : (
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: brandColor }}
                  >
                    {news.game.name.charAt(0)}
                  </div>
                )}
                <span className="font-medium text-sm">{news.game.name}</span>
              </div>
            )}
            <span className="text-muted-foreground text-sm">•</span>
            <span className="text-sm text-muted-foreground/80">
              {formatDate(news.published_at)}
            </span>
            {news.source_name && (
              <>
                <span className="text-muted-foreground text-sm">•</span>
                <span className="text-sm text-muted-foreground/80">{news.source_name}</span>
              </>
            )}
          </div>

          {/* Title + Badges */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="news" size="md">News</Badge>
                {news.is_rumor && (
                  <Badge variant="rumor" size="md">Rumor</Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                {news.title}
              </h1>
            </div>
            <div className="flex-shrink-0">
              <BookmarkButton
                entityType="news"
                entityId={news.id}
                initialBookmarked={bookmarked}
                size="lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Quick Impact Box - Inferred from content */}
        <Card className="p-4 border-l-4" style={{ borderLeftColor: brandColor }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4" style={{ color: brandColor }} />
            <h3 className="font-semibold text-sm">Quick Impact</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs text-muted-foreground">Competitive</p>
                <p className="text-sm font-medium">
                  {news.topics.some(t => ['ranked', 'competitive', 'esports', 'tournament'].includes(t.toLowerCase()))
                    ? 'High'
                    : 'Medium'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs text-muted-foreground">Casual</p>
                <p className="text-sm font-medium">
                  {news.topics.some(t => ['update', 'content', 'event', 'season'].includes(t.toLowerCase()))
                    ? 'High'
                    : 'Medium'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Summary Section */}
        {news.summary && (
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <span className="text-lg">📋</span>
              </div>
              <h2 className="text-lg font-semibold">Summary</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{news.summary}</p>
          </Card>
        )}

        {/* Why It Matters Section */}
        {news.why_it_matters && (
          <Card className="p-5 space-y-3 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Brain className="w-4 h-4 text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold">Why It Matters</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{news.why_it_matters}</p>
          </Card>
        )}

        {/* Insight Block */}
        <Card className="p-5 space-y-3 border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <h2 className="text-lg font-semibold">Insight</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-sm">
            {news.is_rumor
              ? "This is currently unconfirmed. We recommend waiting for official announcements before making gameplay decisions based on this information."
              : news.topics.some(t => t.toLowerCase().includes('season'))
                ? "New seasons often bring significant meta shifts. Consider reviewing your strategies and loadouts once the update goes live."
                : news.topics.some(t => t.toLowerCase().includes('update'))
                  ? "Updates like this typically require adapting your playstyle. Keep an eye on community feedback in the first few days."
                  : "Stay informed about how this news affects your favorite game. Follow related updates for the full picture."}
          </p>
        </Card>

        {/* Topics as Clickable Chips */}
        {news.topics.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Topics</h2>
            <div className="flex flex-wrap gap-2">
              {news.topics.map((topic) => (
                <Link
                  key={topic}
                  href={`/news?topic=${encodeURIComponent(topic)}`}
                  className="group rounded-lg bg-muted/50 border border-transparent px-3 py-1.5 text-sm text-muted-foreground transition-all hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
                >
                  {topic}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Source Link Card */}
        {news.source_url && (
          <Card className="p-4 sm:p-5 border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-medium text-blue-400">Full Article</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {news.source_name ? `Read the full story on ${news.source_name}` : 'Read the full story'}
                </p>
              </div>
              <a
                href={news.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 active:bg-blue-500/40 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Read Full Article
              </a>
            </div>
          </Card>
        )}

        {/* Related News Section */}
        {relatedNews.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-border">
            <h2 className="text-lg font-semibold">
              {news.game ? `More ${news.game.name} News` : 'Related News'}
            </h2>
            <div className="grid gap-3">
              {relatedNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className="group flex items-center justify-between gap-4 p-3 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.game_name && `${item.game_name} • `}
                      {formatDate(item.published_at)}
                    </p>
                  </div>
                  {item.is_rumor && (
                    <Badge variant="rumor" size="sm">Rumor</Badge>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
