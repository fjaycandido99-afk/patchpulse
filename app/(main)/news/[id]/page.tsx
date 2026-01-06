import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { ArrowLeft, ExternalLink, Sparkles, Brain, Zap, Users, Trophy, ChevronRight, Star, Flame, Calendar, Clock } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { getNewsById, getRelatedNews } from '../queries'
import { isBookmarked } from '@/app/(main)/actions/bookmarks'
import { getBacklogItem } from '@/app/(main)/backlog/queries'
import { BookmarkButton } from '@/components/ui/BookmarkButton'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { GameLogo } from '@/components/ui/GameLogo'
import { formatDate, relativeDaysText } from '@/lib/dates'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/subscriptions/limits'
import { AutoMarkRead } from '@/components/notifications/AutoMarkRead'

// Topic to icon mapping
const TOPIC_ICONS: Record<string, { icon: typeof Trophy; color: string; bg: string }> = {
  'ranked': { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  'competitive': { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  'esports': { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  'season': { icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  'update': { icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  'content': { icon: Star, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  'new': { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  'event': { icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  'default': { icon: Star, color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
}

function getTopicIcon(topic?: string) {
  if (!topic) return TOPIC_ICONS.default
  const lower = topic.toLowerCase()
  for (const [key, value] of Object.entries(TOPIC_ICONS)) {
    if (lower.includes(key)) return value
  }
  return TOPIC_ICONS.default
}

// Visual meter component
function ImpactMeter({ label, icon: Icon, value, color }: {
  label: string
  icon: typeof Trophy
  value: number
  color: string
}) {
  const percentage = Math.min(100, Math.max(0, value))
  const levelLabel = percentage >= 70 ? 'High' : percentage >= 40 ? 'Medium' : 'Low'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className={`text-sm font-bold ${color}`}>{levelLabel}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color.replace('text-', 'bg-')}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Section divider component
function SectionDivider() {
  return (
    <div className="relative py-2">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </div>
  )
}

// Topic highlight card
function TopicCard({ topic }: { topic: string }) {
  const { icon: Icon, color, bg } = getTopicIcon(topic)

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <span className="text-sm font-medium text-zinc-200">{topic}</span>
    </div>
  )
}

// Since You Last Played card for news
function SinceLastPlayedCard({
  gameName,
  lastPlayed,
  highlights
}: {
  gameName: string
  lastPlayed?: string | null
  highlights: string[]
}) {
  if (highlights.length === 0) return null

  return (
    <Card className="p-5 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <Clock className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="font-semibold text-amber-300">Since You Last Played</h3>
          {lastPlayed && (
            <p className="text-xs text-muted-foreground">Last played {relativeDaysText(lastPlayed)}</p>
          )}
        </div>
      </div>
      <ul className="space-y-2">
        {highlights.slice(0, 3).map((highlight, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <ChevronRight className="w-4 h-4 mt-0.5 text-amber-400 flex-shrink-0" />
            <span className="text-zinc-300">{highlight}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [news, bookmarked, plan] = await Promise.all([
    getNewsById(id),
    isBookmarked('news', id),
    user ? getUserPlan(user.id) : Promise.resolve('free' as const),
  ])
  const isPro = plan === 'pro'

  // Get backlog item if user is logged in and news is for a specific game
  let backlogItem = null
  if (user && news.game?.id) {
    try {
      backlogItem = await getBacklogItem(news.game.id)
    } catch {
      // User might not have backlog item
    }
  }

  const relatedNews = await getRelatedNews(
    news.id,
    news.game?.id || null,
    news.topics,
    4
  )

  const brandColor = news.game?.brand_color || '#6366f1'
  // Use article's OG image first, then fall back to game images
  const heroImage = news.image_url || news.game?.hero_url || news.game?.cover_url || null

  // Calculate impact scores based on topics
  const hasCompetitive = news.topics.some(t => ['ranked', 'competitive', 'esports', 'tournament'].includes(t.toLowerCase()))
  const hasCasual = news.topics.some(t => ['update', 'content', 'event', 'season'].includes(t.toLowerCase()))
  const competitiveScore = hasCompetitive ? 80 : 50
  const casualScore = hasCasual ? 85 : 50

  // Generate highlights from summary
  const highlights = news.summary ? [news.summary.split('.')[0] + '.'] : []

  return (
    <div className="relative min-h-screen page-enter">
      {/* Auto-mark notification as read when viewing this news */}
      <AutoMarkRead contentType="news" contentId={id} />

      {/* Fixed background hero */}
      <HeroBanner imageUrl={heroImage} altText={news.title} fallbackColor={brandColor} />

      {/* Spacer for hero - accounts for header on mobile */}
      <div className="h-[200px] sm:h-[240px] md:h-[350px]" />

      {/* Content that scrolls over hero */}
      <div className="relative z-10 pt-6 pb-8 min-h-screen space-y-4 px-0">
        {/* Back Button */}
        <Suspense fallback={
          <span className="inline-flex items-center gap-1.5 text-sm text-white/70">
            <ArrowLeft className="h-4 w-4" />
            Back
          </span>
        }>
          <BackButton
            defaultHref="/news"
            defaultLabel="Back to News"
            fromHomeLabel="Back to Home"
          />
        </Suspense>

        {/* Game info + Title - Card on mobile */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            {news.game && (
              <>
                {news.game.logo_url ? (
                  <GameLogo logoUrl={news.game.logo_url} gameName={news.game.name} size="md" />
                ) : (
                  <div
                    className="w-10 h-10 rounded-[10px] flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: brandColor }}
                  >
                    {news.game.name.charAt(0)}
                  </div>
                )}
                <span className="font-medium text-white">{news.game.name}</span>
                <span className="text-white/60">•</span>
              </>
            )}
            <span className="text-white/60 text-sm">{formatDate(news.published_at)}</span>
            {news.source_name && (
              <>
                <span className="text-white/60">•</span>
                <span className="text-white/60 text-sm">{news.source_name}</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="news" size="md">News</Badge>
            {news.is_rumor && (
              <Badge variant="rumor" size="md">Rumor</Badge>
            )}
          </div>

          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              {news.title}
            </h1>
            <BookmarkButton
              entityType="news"
              entityId={news.id}
              initialBookmarked={bookmarked}
              size="lg"
              isPro={isPro}
            />
          </div>
        </Card>

        {/* Main Content */}
        <div className="space-y-6">
        {/* 2. QUICK IMPACT - Visual Meters */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold">Quick Impact</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ImpactMeter
              label="Competitive"
              icon={Trophy}
              value={competitiveScore}
              color="text-amber-400"
            />
            <ImpactMeter
              label="Casual"
              icon={Users}
              value={casualScore}
              color="text-blue-400"
            />
          </div>
        </Card>

        <SectionDivider />

        {/* Summary Section */}
        {news.summary && (
          <>
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <span className="text-lg">📋</span>
                </div>
                <h2 className="text-lg font-semibold">Summary</h2>
              </div>
              <p className="text-zinc-300 leading-relaxed">{news.summary}</p>
            </Card>
            <SectionDivider />
          </>
        )}

        {/* 3. KEY TOPICS - Icon Cards */}
        {news.topics.length > 0 && (
          <>
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Star className="w-4 h-4 text-emerald-400" />
                </div>
                <h2 className="text-lg font-semibold">Key Topics</h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {news.topics.slice(0, 6).map((topic, index) => (
                  <TopicCard key={index} topic={topic} />
                ))}
              </div>
            </section>
            <SectionDivider />
          </>
        )}

        {/* Why It Matters Section */}
        {news.why_it_matters && (
          <>
            <Card className="p-5 space-y-3 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold">Why It Matters</h2>
              </div>
              <p className="text-zinc-300 leading-relaxed">{news.why_it_matters}</p>
            </Card>
            <SectionDivider />
          </>
        )}

        {/* Insight Block */}
        <Card className="p-5 space-y-3 border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <h2 className="text-lg font-semibold">Insight</h2>
          </div>
          <p className="text-zinc-300 leading-relaxed">
            {news.is_rumor
              ? "This is currently unconfirmed. We recommend waiting for official announcements before making gameplay decisions based on this information."
              : news.topics.some(t => t.toLowerCase().includes('season'))
                ? "New seasons often bring significant meta shifts. Consider reviewing your strategies and loadouts once the update goes live."
                : news.topics.some(t => t.toLowerCase().includes('update'))
                  ? "Updates like this typically require adapting your playstyle. Keep an eye on community feedback in the first few days."
                  : "Stay informed about how this news affects your favorite game. Follow related updates for the full picture."}
          </p>
        </Card>

        <SectionDivider />

        {/* 5. SINCE YOU LAST PLAYED - Personalized */}
        {backlogItem && news.game && highlights.length > 0 && (
          <>
            <SinceLastPlayedCard
              gameName={news.game.name}
              lastPlayed={backlogItem.last_played_at}
              highlights={highlights}
            />
            <SectionDivider />
          </>
        )}

        {/* Source Link Card */}
        {news.source_url && (
          <>
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
            <SectionDivider />
          </>
        )}

        {/* Related News Section */}
        {relatedNews.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">
              {news.game ? `More ${news.game.name} News` : 'Related News'}
            </h2>
            <div className="grid gap-3">
              {relatedNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className="group flex items-center justify-between gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.game_name && `${item.game_name} · `}
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
    </div>
  )
}
