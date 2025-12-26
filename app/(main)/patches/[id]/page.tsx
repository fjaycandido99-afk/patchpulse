import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ExternalLink, Sparkles, Zap, Users, Trophy, Target, ChevronRight } from 'lucide-react'
import { getPatchById, getRelatedPatches } from '../queries'
import { isBookmarked } from '@/app/(main)/actions/bookmarks'
import { BookmarkButton } from '@/components/ui/BookmarkButton'
import { Badge, ImpactBadge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { GameLogo } from '@/components/ui/GameLogo'
import { formatDate } from '@/lib/dates'

type KeyChange = {
  category?: string
  change: string
}

function getImpactColor(score: number): string {
  if (score >= 8) return 'text-red-400'
  if (score >= 5) return 'text-yellow-400'
  return 'text-green-400'
}

function getImpactBgColor(score: number): string {
  if (score >= 8) return 'bg-red-500/10 border-red-500/30'
  if (score >= 5) return 'bg-yellow-500/10 border-yellow-500/30'
  return 'bg-green-500/10 border-green-500/30'
}

function getImpactLabel(score: number): string {
  if (score >= 8) return 'Major'
  if (score >= 5) return 'Medium'
  return 'Minor'
}

function getCompetitiveImpact(score: number): string {
  if (score >= 8) return 'High'
  if (score >= 5) return 'Medium'
  return 'Low'
}

function getCasualImpact(score: number): string {
  // Casual impact is typically less affected by competitive changes
  if (score >= 9) return 'High'
  if (score >= 6) return 'Medium'
  return 'Low'
}

export default async function PatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [patch, bookmarked] = await Promise.all([
    getPatchById(id),
    isBookmarked('patch', id),
  ])

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
            href="/patches"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground mb-4 sm:mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patches
          </Link>

          {/* Game Badge + Meta Row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              {patch.game.logo_url ? (
                <GameLogo
                  logoUrl={patch.game.logo_url}
                  gameName={patch.game.name}
                  size="sm"
                />
              ) : (
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: brandColor }}
                >
                  {patch.game.name.charAt(0)}
                </div>
              )}
              <span className="font-medium text-sm">{patch.game.name}</span>
            </div>
            <span className="text-muted-foreground text-sm">•</span>
            <span className="text-sm text-muted-foreground/80">
              {formatDate(patch.published_at)}
            </span>
          </div>

          {/* Title + Badges */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="patch" size="md">Patch</Badge>
                <ImpactBadge score={patch.impact_score} size="md" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                {patch.title}
              </h1>
            </div>
            <div className="flex-shrink-0">
              <BookmarkButton
                entityType="patch"
                entityId={patch.id}
                initialBookmarked={bookmarked}
                size="lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Quick Impact Box */}
        <Card className={`p-4 border-l-4 ${getImpactBgColor(patch.impact_score)}`}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className={`w-4 h-4 ${getImpactColor(patch.impact_score)}`} />
            <h3 className="font-semibold text-sm">Quick Impact</h3>
            <span className={`ml-auto text-lg font-bold ${getImpactColor(patch.impact_score)}`}>
              {patch.impact_score}/10
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs text-muted-foreground">Competitive</p>
                <p className="text-sm font-medium">{getCompetitiveImpact(patch.impact_score)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs text-muted-foreground">Casual</p>
                <p className="text-sm font-medium">{getCasualImpact(patch.impact_score)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* TL;DR Section */}
        {patch.summary_tldr && (
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <span className="text-lg">⚡</span>
              </div>
              <h2 className="text-lg font-semibold">TL;DR</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{patch.summary_tldr}</p>
          </Card>
        )}

        {/* Key Changes / What Changed */}
        {keyChanges.length > 0 && (
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold">What Changed</h2>
            </div>
            <ul className="space-y-2">
              {keyChanges.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3 hover:bg-card transition-colors"
                >
                  <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                  <div className="flex-1 min-w-0">
                    {item.category && (
                      <span className="inline-block mr-2 mb-1 rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {item.category}
                      </span>
                    )}
                    <span className="text-sm">{item.change}</span>
                  </div>
                </li>
              ))}
            </ul>
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
            {patch.ai_insight || (
              patch.impact_score >= 8
                ? "This is a major update that will significantly affect gameplay. Expect shifts in the meta and consider adjusting your strategies. The first few days after release often see aggressive experimentation."
                : patch.impact_score >= 5
                  ? "A moderate update with targeted changes. While not game-changing, these adjustments may affect specific playstyles or characters. Keep an eye on community discussions."
                  : "A minor update focused on quality-of-life improvements and bug fixes. Your current strategies should remain largely unaffected."
            )}
          </p>
        </Card>

        {/* Tags as Clickable Chips */}
        {patch.tags.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {patch.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/patches?tag=${encodeURIComponent(tag)}`}
                  className="group rounded-lg bg-muted/50 border border-transparent px-3 py-1.5 text-sm text-muted-foreground transition-all hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Full Patch Notes (Collapsible Preview) */}
        {patch.raw_text && (
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-500/10 flex items-center justify-center">
                <span className="text-lg">📜</span>
              </div>
              <h2 className="text-lg font-semibold">Full Patch Notes</h2>
            </div>
            <div className="rounded-lg border border-border bg-zinc-900/50 p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono">
                {patch.raw_text}
              </pre>
            </div>
          </Card>
        )}

        {/* Source Link Card */}
        {patch.source_url && (
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
        )}

        {/* Related Patches Section */}
        {relatedPatches.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-border">
            <h2 className="text-lg font-semibold">
              More {patch.game.name} Patches
            </h2>
            <div className="grid gap-3">
              {relatedPatches.map((item) => (
                <Link
                  key={item.id}
                  href={`/patches/${item.id}`}
                  className="group flex items-center justify-between gap-4 p-3 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all"
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
        )}
      </div>
    </div>
  )
}
