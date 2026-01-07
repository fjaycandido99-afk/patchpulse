import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { ExternalLink, Sparkles, Zap, Users, Trophy, Target, ChevronRight, Map, Swords, Shield, Settings, Gamepad2, BarChart3, Clock, Flame, Star, ArrowLeft } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { getPatchById, getRelatedPatches } from '../queries'
import { isBookmarked } from '@/app/(main)/actions/bookmarks'
import { isFollowingGame } from '@/app/(main)/actions/games'
import { getBacklogItem } from '@/app/(main)/backlog/queries'
import { BookmarkButton } from '@/components/ui/BookmarkButton'
import { CopyButton } from '@/components/ui/CopyButton'
import { ShareButton } from '@/components/ui/ShareButton'
import { FollowGameButton } from '@/components/games'
import { Badge, ImpactBadge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { GameLogo } from '@/components/ui/GameLogo'
import { formatDate, relativeDaysText } from '@/lib/dates'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan } from '@/lib/subscriptions/limits'
import { AutoMarkRead } from '@/components/notifications/AutoMarkRead'

type KeyChange = {
  category?: string
  change: string
}

// Category to icon mapping
const CATEGORY_ICONS: Record<string, { icon: typeof Trophy; color: string; bg: string }> = {
  'ranked': { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  'competitive': { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  'balance': { icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  'buffs': { icon: Flame, color: 'text-green-400', bg: 'bg-green-500/10' },
  'nerfs': { icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10' },
  'map': { icon: Map, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  'weapons': { icon: Swords, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  'gameplay': { icon: Gamepad2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  'ui': { icon: Settings, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  'performance': { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  'new content': { icon: Star, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  'content': { icon: Star, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  'default': { icon: Target, color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
}

function getCategoryIcon(category?: string) {
  if (!category) return CATEGORY_ICONS.default
  const lower = category.toLowerCase()
  for (const [key, value] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return value
  }
  return CATEGORY_ICONS.default
}

function getImpactColor(score: number): string {
  if (score >= 8) return 'text-red-400'
  if (score >= 5) return 'text-amber-400'
  return 'text-green-400'
}

function getImpactBgColor(score: number): string {
  if (score >= 8) return 'bg-red-500'
  if (score >= 5) return 'bg-amber-500'
  return 'bg-green-500'
}

function getCompetitiveScore(score: number): number {
  return Math.min(100, Math.round(score * 10))
}

function getCasualScore(score: number): number {
  // Casual impact is typically less affected
  return Math.min(100, Math.round(score * 7))
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

// Section divider component - bright glow style
function SectionDivider() {
  return (
    <div className="relative h-0.5 w-full overflow-visible my-4">
      {/* Base line - stronger */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
      {/* Inner glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />
      {/* Outer glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-md" />
    </div>
  )
}

// What Changed icon card
function ChangeCard({ category, change }: { category?: string; change: string }) {
  const { icon: Icon, color, bg } = getCategoryIcon(category)

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        {category && (
          <span className={`text-xs font-semibold uppercase tracking-wide ${color}`}>
            {category}
          </span>
        )}
        <p className="text-sm text-zinc-200 mt-0.5 leading-relaxed">{change}</p>
      </div>
    </div>
  )
}

// Since You Last Played card
function SinceLastPlayedCard({
  gameName,
  logoUrl,
  lastPlayed,
  changes
}: {
  gameName: string
  logoUrl?: string | null
  lastPlayed?: string | null
  changes: string[]
}) {
  if (changes.length === 0) return null

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
        {changes.slice(0, 4).map((change, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <ChevronRight className="w-4 h-4 mt-0.5 text-amber-400 flex-shrink-0" />
            <span className="text-zinc-300">{change}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default async function PatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [patch, bookmarked, plan] = await Promise.all([
    getPatchById(id),
    isBookmarked('patch', id),
    user ? getUserPlan(user.id) : Promise.resolve('free' as const),
  ])
  const isPro = plan === 'pro'

  // Check if user is following this game
  const isFollowing = await isFollowingGame(patch.game.id)

  // Get backlog item if user is logged in
  let backlogItem = null
  if (user) {
    try {
      backlogItem = await getBacklogItem(patch.game.id)
    } catch {
      // User might not have backlog item
    }
  }

  const relatedPatches = await getRelatedPatches(
    patch.id,
    patch.game.id,
    patch.tags,
    4
  )

  const keyChanges = Array.isArray(patch.key_changes)
    ? (patch.key_changes as KeyChange[])
    : []

  const brandColor = patch.game.brand_color || '#6366f1'
  const heroImage = patch.game.hero_url || patch.game.cover_url

  // Generate "Since You Last Played" changes from key changes
  const sinceLastPlayedChanges = keyChanges.slice(0, 4).map(kc => kc.change)

  return (
    <div className="relative min-h-screen page-enter">
      {/* Auto-mark notification as read when viewing this patch */}
      <AutoMarkRead contentType="patch" contentId={id} />

      {/* Fixed background hero */}
      <HeroBanner imageUrl={heroImage} altText={patch.title} fallbackColor={brandColor} />

      {/* Spacer for hero */}
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
            defaultHref="/patches"
            defaultLabel="Back to Patches"
            fromHomeLabel="Back to Home"
          />
        </Suspense>

        {/* Game info + Title - Card */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            {patch.game.logo_url ? (
              <GameLogo logoUrl={patch.game.logo_url} gameName={patch.game.name} size="md" />
            ) : (
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: brandColor }}
              >
                {patch.game.name.charAt(0)}
              </div>
            )}
            <Link href={`/games/${patch.game.slug}`} className="font-medium text-white hover:text-primary transition-colors">
              {patch.game.name}
            </Link>
            <FollowGameButton
              gameId={patch.game.id}
              gameName={patch.game.name}
              initialFollowing={isFollowing}
              size="sm"
              variant="outline"
            />
            <span className="text-white/60">•</span>
            <span className="text-white/60 text-sm">{formatDate(patch.published_at)}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="patch" size="md">Patch</Badge>
            <ImpactBadge score={patch.impact_score} size="md" />
          </div>

          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              {patch.title}
            </h1>
            <div className="flex items-center gap-2 flex-shrink-0">
              <ShareButton title={patch.title} size="md" variant="icon" />
              <BookmarkButton
                entityType="patch"
                entityId={patch.id}
                initialBookmarked={bookmarked}
                size="lg"
                isPro={isPro}
              />
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <div className="space-y-6">
        {/* 2. QUICK IMPACT - Visual Meters */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className={`w-5 h-5 ${getImpactColor(patch.impact_score)}`} />
              <h3 className="font-semibold">Quick Impact</h3>
            </div>
            <div className={`text-2xl font-bold ${getImpactColor(patch.impact_score)}`}>
              {patch.impact_score}/10
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ImpactMeter
              label="Competitive"
              icon={Trophy}
              value={getCompetitiveScore(patch.impact_score)}
              color="text-amber-400"
            />
            <ImpactMeter
              label="Casual"
              icon={Users}
              value={getCasualScore(patch.impact_score)}
              color="text-blue-400"
            />
          </div>
        </Card>

        <SectionDivider />

        {/* TL;DR Section */}
        {patch.summary_tldr && (
          <>
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <span className="text-lg">⚡</span>
                  </div>
                  <h2 className="text-lg font-semibold">Summary</h2>
                </div>
                <CopyButton text={patch.summary_tldr} label="Copy" size="sm" variant="button" />
              </div>
              <p className="text-zinc-300 leading-relaxed">{patch.summary_tldr}</p>
            </Card>
            <SectionDivider />
          </>
        )}

        {/* 3. WHAT CHANGED - Icon Cards */}
        {keyChanges.length > 0 && (
          <>
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-emerald-400" />
                </div>
                <h2 className="text-lg font-semibold">What Changed</h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {keyChanges.slice(0, 4).map((item, index) => (
                  <ChangeCard key={index} category={item.category} change={item.change} />
                ))}
              </div>

              {keyChanges.length > 4 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{keyChanges.length - 4} more changes
                </p>
              )}
            </section>
            <SectionDivider />
          </>
        )}

        {/* Insight Block - Why It Matters */}
        <Card className="p-5 space-y-3 border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <h2 className="text-lg font-semibold">Why It Matters</h2>
          </div>
          <p className="text-zinc-300 leading-relaxed">
            {patch.ai_insight || (
              patch.impact_score >= 8
                ? "This is a major update that will significantly affect gameplay. Expect shifts in the meta and consider adjusting your strategies. The first few days after release often see aggressive experimentation."
                : patch.impact_score >= 5
                  ? "A moderate update with targeted changes. While not game-changing, these adjustments may affect specific playstyles or characters. Keep an eye on community discussions."
                  : "A minor update focused on quality-of-life improvements and bug fixes. Your current strategies should remain largely unaffected."
            )}
          </p>
        </Card>

        <SectionDivider />

        {/* 5. SINCE YOU LAST PLAYED - Personalized */}
        {backlogItem && sinceLastPlayedChanges.length > 0 && (
          <>
            <SinceLastPlayedCard
              gameName={patch.game.name}
              logoUrl={patch.game.logo_url}
              lastPlayed={backlogItem.last_played_at}
              changes={sinceLastPlayedChanges}
            />
            <SectionDivider />
          </>
        )}

        {/* Tags as Clickable Chips */}
        {patch.tags.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {patch.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/patches?tag=${encodeURIComponent(tag)}`}
                  className="group rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-zinc-300 transition-all hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Full Patch Notes */}
        {patch.raw_text && (
          <>
            <SectionDivider />
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-500/10 flex items-center justify-center">
                    <span className="text-lg">📜</span>
                  </div>
                  <h2 className="text-lg font-semibold">Full Patch Notes</h2>
                </div>
                <CopyButton text={patch.raw_text} label="Copy All" size="sm" variant="button" />
              </div>
              <div className="rounded-lg border border-white/10 bg-black/40 p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-zinc-400 font-mono">
                  {patch.raw_text}
                </pre>
              </div>
            </Card>
          </>
        )}

        {/* Source Link Card */}
        {patch.source_url && (
          <>
            <SectionDivider />
            <Card className="p-4 sm:p-5 border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="font-medium text-blue-400">Official Patch Notes</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    View the complete official patch notes
                  </p>
                </div>
                <a
                  href={patch.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 active:bg-blue-500/40 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Full Notes
                </a>
              </div>
            </Card>
          </>
        )}

        {/* Related Patches Section */}
        {relatedPatches.length > 0 && (
          <>
            <SectionDivider />
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">
                More {patch.game.name} Patches
              </h2>
              <div className="grid gap-3">
                {relatedPatches.map((item) => (
                  <Link
                    key={item.id}
                    href={`/patches/${item.id}`}
                    className="group flex items-center justify-between gap-4 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(item.published_at)}
                      </p>
                    </div>
                    <ImpactBadge score={item.impact_score} size="sm" />
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
        </div>
      </div>
    </div>
  )
}
