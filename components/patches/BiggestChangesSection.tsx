import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, TrendingUp, ArrowRight } from 'lucide-react'
import { relativeDaysText } from '@/lib/dates'

type Platform = {
  id: string
  name: string
  icon_url: string | null
}

type Game = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  brand_color: string | null
  cover_url: string | null
  platforms: Platform[]
}

type BigPatch = {
  id: string
  title: string
  published_at: string
  summary_tldr: string | null
  tags: string[]
  impact_score: number
  source_url: string | null
  game: Game
}

type BiggestChangesSectionProps = {
  patches: BigPatch[]
  title?: string
  showViewAll?: boolean
}

// Tag colors
const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  balance: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  buffs: { bg: 'bg-green-500/20', text: 'text-green-400' },
  nerfs: { bg: 'bg-red-500/20', text: 'text-red-400' },
  bugfix: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  'bug fix': { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  content: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  'new content': { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  feature: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  performance: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  mobility: { bg: 'bg-sky-500/20', text: 'text-sky-400' },
  weapons: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  gameplay: { bg: 'bg-rose-500/20', text: 'text-rose-400' },
  meta: { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-400' },
}

function getTagStyle(tag: string) {
  const lowerTag = tag.toLowerCase()
  return TAG_COLORS[lowerTag] || { bg: 'bg-zinc-500/20', text: 'text-zinc-400' }
}

function getImpactInfo(score: number): { label: string; color: string; ringColor: string } {
  if (score >= 8) {
    return {
      label: 'Major',
      color: 'text-red-400',
      ringColor: 'ring-red-500/50',
    }
  }
  if (score >= 5) {
    return {
      label: 'Medium',
      color: 'text-amber-400',
      ringColor: 'ring-amber-500/50',
    }
  }
  return {
    label: 'Minor',
    color: 'text-green-400',
    ringColor: 'ring-green-500/50',
  }
}

export function BiggestChangesSection({
  patches,
  title = 'Biggest Changes',
  showViewAll = true,
}: BiggestChangesSectionProps) {
  if (patches.length === 0) return null

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        {showViewAll && (
          <Link
            href="/patches?importance=major"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {patches.map((patch) => {
          const brandColor = patch.game.brand_color || '#3b82f6'
          const impact = getImpactInfo(patch.impact_score)
          const heroImage = patch.game.cover_url

          return (
            <div
              key={patch.id}
              className="group relative rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Clickable overlay */}
              <Link
                href={`/patches/${patch.id}`}
                className="absolute inset-0 z-0"
                aria-label={`View ${patch.title} details`}
              />

              {/* Top section with image/gradient */}
              <div className="relative h-28 sm:h-32 overflow-hidden">
                {heroImage ? (
                  <>
                    <Image
                      src={heroImage}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `linear-gradient(135deg, ${brandColor}60 0%, transparent 60%)`,
                      }}
                    />
                  </>
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${brandColor}50 0%, ${brandColor}20 50%, #09090b 100%)`,
                    }}
                  />
                )}

                {/* Impact badge */}
                <div className="absolute top-3 right-3">
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm ring-1 ${impact.ringColor}`}
                  >
                    <span className={`text-xs font-semibold ${impact.color}`}>
                      {patch.impact_score}/10
                    </span>
                  </div>
                </div>

                {/* Game logo overlay */}
                {patch.game.logo_url && (
                  <div className="absolute bottom-3 left-3">
                    <div className="relative h-8 w-8 rounded bg-black/40 backdrop-blur overflow-hidden">
                      <Image
                        src={patch.game.logo_url}
                        alt={patch.game.name}
                        fill
                        className="object-contain"
                        sizes="32px"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="relative z-10 pointer-events-none p-4 space-y-3">
                {/* Game name + Date */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium">{patch.game.name}</span>
                  <span className="capitalize">{relativeDaysText(patch.published_at)}</span>
                </div>

                {/* Title */}
                <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {patch.title}
                </h3>

                {/* Summary */}
                {patch.summary_tldr && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {patch.summary_tldr}
                  </p>
                )}

                {/* Tags + Source */}
                <div className="flex items-end justify-between gap-2 pt-1">
                  {patch.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {patch.tags.slice(0, 2).map((tag) => {
                        const style = getTagStyle(tag)
                        return (
                          <span
                            key={tag}
                            className={`px-2 py-0.5 rounded-md text-xs font-medium ${style.bg} ${style.text}`}
                          >
                            {tag}
                          </span>
                        )
                      })}
                      {patch.tags.length > 2 && (
                        <span className="px-2 py-0.5 rounded-md text-xs text-muted-foreground bg-muted">
                          +{patch.tags.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div />
                  )}

                  {patch.source_url && (
                    <a
                      href={patch.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pointer-events-auto flex items-center gap-1 px-2 py-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded transition-colors"
                      title="View source"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
