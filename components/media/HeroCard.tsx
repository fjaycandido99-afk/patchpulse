'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ReactNode, useState } from 'react'
import { FileText, Sparkles, GitCompare, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { GameLogo } from '@/components/ui/GameLogo'
import { PlatformIcons, type Platform } from '@/components/ui/PlatformIcons'

type AffectedSystem = 'map' | 'mobility' | 'weapons' | 'ranked' | 'casual' | 'balance' | 'ui' | 'performance' | 'social' | 'audio'

type HeroCardProps = {
  href: string
  title: string
  summary?: string | null
  imageUrl?: string | null
  blurHash?: string | null
  fallbackTitle?: string
  badges?: ReactNode
  metaLeft?: ReactNode
  metaRight?: ReactNode
  impactMeter?: {
    meta: number // 0-10
    casual: number // 0-10
  }
  affectedSystems?: AffectedSystem[]
  aiInsight?: string | null
  showActions?: boolean
  type?: 'patch' | 'news'
  // Game branding
  game?: {
    name: string
    logoUrl?: string | null
    platforms?: Platform[]
  }
  publishedAt?: string
}

function getInitials(text: string): string {
  if (!text) return ''
  return text
    .split(' ')
    .slice(0, 2)
    .map((word) => word?.[0] || '')
    .join('')
    .toUpperCase()
}

function ImageFallback({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 flex items-center justify-center">
      <span className="text-5xl sm:text-7xl font-bold text-white/10 select-none tracking-tight">
        {getInitials(title)}
      </span>
    </div>
  )
}

function ImpactMeter({ label, icon, value, color }: { label: string; icon: string; value: number; color: string }) {
  const filled = Math.round(value)
  const empty = 10 - filled
  const levelLabel = value >= 8 ? 'High' : value >= 5 ? 'Medium' : 'Low'

  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm">
      <span className="text-zinc-400 w-24 sm:w-28 flex items-center gap-1.5">
        <span>{icon}</span>
        <span>{label}:</span>
      </span>
      <div className="flex gap-0.5">
        {Array.from({ length: filled }).map((_, i) => (
          <div key={`f-${i}`} className={`w-2 h-3 sm:w-2.5 sm:h-4 rounded-sm ${color}`} />
        ))}
        {Array.from({ length: empty }).map((_, i) => (
          <div key={`e-${i}`} className="w-2 h-3 sm:w-2.5 sm:h-4 rounded-sm bg-white/10" />
        ))}
      </div>
      <span className={`text-xs font-semibold ml-1 ${color.replace('bg-', 'text-').replace('/80', '')}`}>
        {levelLabel}
      </span>
    </div>
  )
}

const systemLabels: Record<AffectedSystem, string> = {
  map: 'Map Flow',
  mobility: 'Mobility',
  weapons: 'Weapon Balance',
  ranked: 'Ranked',
  casual: 'Casual',
  balance: 'Balance',
  ui: 'UI/UX',
  performance: 'Performance',
  social: 'Social',
  audio: 'Audio',
}

function AffectedSystemTag({ system }: { system: AffectedSystem }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-colors cursor-default">
      <span className="text-zinc-500">▸</span>
      {systemLabels[system]}
    </span>
  )
}

function ActionButton({
  icon: Icon,
  label,
  variant = 'default',
  onClick,
}: {
  icon: typeof FileText
  label: string
  variant?: 'default' | 'primary'
  onClick?: (e: React.MouseEvent) => void
}) {
  const baseStyles = "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all active:scale-95"
  const variantStyles = variant === 'primary'
    ? "bg-white/10 border border-white/20 text-white hover:bg-white/15 hover:border-white/30"
    : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:border-white/20 hover:text-white"

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles}`}
    >
      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      <span>{label}</span>
    </button>
  )
}

function AIInsightBox({ insight }: { insight: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
      <Zap className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
      <div>
        <span className="text-xs font-semibold text-violet-400">AI Insight</span>
        <p className="text-sm text-zinc-300 mt-0.5 leading-relaxed">{insight}</p>
      </div>
    </div>
  )
}

export function HeroCard({
  href,
  title,
  summary,
  imageUrl,
  blurHash,
  fallbackTitle,
  badges,
  metaLeft,
  impactMeter,
  affectedSystems,
  aiInsight,
  showActions = false,
  type = 'patch',
  game,
  publishedAt,
}: HeroCardProps) {
  const displayTitle = fallbackTitle || game?.name || title
  const [showAllSystems, setShowAllSystems] = useState(false)

  // On mobile, show first 3 systems collapsed
  const visibleSystems = affectedSystems
    ? (showAllSystems ? affectedSystems : affectedSystems.slice(0, 3))
    : []
  const hasMoreSystems = affectedSystems && affectedSystems.length > 3

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-black/40 gradient-border">
      {/* Background Image - Compact sizing */}
      <div className="relative aspect-[2.5/1] sm:aspect-[3/1] lg:aspect-[3.5/1] w-full">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
            priority
            placeholder={blurHash ? 'blur' : 'empty'}
            blurDataURL={blurHash || undefined}
          />
        ) : (
          <ImageFallback title={displayTitle} />
        )}

        {/* Multi-layer gradient for text readability - Always present */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 lg:p-8">
        {/* Top Row: Badges + Game Info + Platforms */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-3">
            {badges && (
              <div className="flex flex-wrap items-center gap-2">
                {badges}
              </div>
            )}
          </div>

          {/* Right side: Game info + Platforms */}
          <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-400">
            {/* Game logo or name */}
            {game && (
              <div className="flex items-center gap-2">
                <GameLogo
                  logoUrl={game.logoUrl}
                  gameName={game.name}
                  size="sm"
                />
                {!game.logoUrl && (
                  <span className="font-medium">{game.name}</span>
                )}
              </div>
            )}

            {/* Date separator */}
            {publishedAt && (
              <>
                <span className="text-zinc-600">·</span>
                <span>{publishedAt}</span>
              </>
            )}

            {/* Platform icons */}
            {game?.platforms && game.platforms.length > 0 && (
              <>
                <span className="text-zinc-600 hidden sm:inline">·</span>
                <div className="hidden sm:block">
                  <PlatformIcons platforms={game.platforms} maxVisible={4} size="sm" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <Link href={href} className="block group/title">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-white line-clamp-2 group-hover/title:text-zinc-100 transition-colors">
            {title}
          </h2>
        </Link>

        {/* Description - Reframed for meaning */}
        {summary && (
          <p className="mt-2 text-sm sm:text-base text-zinc-200/90 line-clamp-2 max-w-3xl leading-relaxed">
            {summary}
          </p>
        )}

        {/* Impact Meters - Only for patches */}
        {type === 'patch' && impactMeter && (
          <div className="mt-4 flex flex-col gap-2 p-3 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 w-fit">
            <ImpactMeter
              label="Meta Impact"
              icon="🎯"
              value={impactMeter.meta}
              color={impactMeter.meta >= 7 ? 'bg-red-500/80' : impactMeter.meta >= 4 ? 'bg-amber-500/80' : 'bg-green-500/80'}
            />
            <ImpactMeter
              label="Casual"
              icon="🎮"
              value={impactMeter.casual}
              color={impactMeter.casual >= 7 ? 'bg-red-500/80' : impactMeter.casual >= 4 ? 'bg-amber-500/80' : 'bg-green-500/80'}
            />
          </div>
        )}

        {/* Affected Systems - Expandable on mobile */}
        {affectedSystems && affectedSystems.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Affected Systems</span>
              {hasMoreSystems && (
                <button
                  onClick={() => setShowAllSystems(!showAllSystems)}
                  className="sm:hidden flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  {showAllSystems ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showAllSystems ? 'Less' : `+${affectedSystems.length - 3}`}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Mobile: show limited, Desktop: show all */}
              <div className="flex flex-wrap gap-2 sm:hidden">
                {visibleSystems.map((system) => (
                  <AffectedSystemTag key={system} system={system} />
                ))}
              </div>
              <div className="hidden sm:flex sm:flex-wrap gap-2">
                {affectedSystems.map((system) => (
                  <AffectedSystemTag key={system} system={system} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="mt-4 flex flex-wrap gap-2">
            {/* Mobile: AI Summary first */}
            <div className="contents sm:hidden">
              <Link href={href}>
                <ActionButton icon={Sparkles} label="AI Summary" variant="primary" />
              </Link>
              <Link href={href}>
                <ActionButton icon={FileText} label="View Full Patch" />
              </Link>
            </div>
            {/* Desktop: Full Patch first */}
            <div className="hidden sm:contents">
              <Link href={href}>
                <ActionButton icon={FileText} label="View Full Patch" variant="primary" />
              </Link>
              <Link href={href}>
                <ActionButton icon={Sparkles} label="AI Summary" />
              </Link>
              <ActionButton
                icon={GitCompare}
                label="Compare Last Patch"
                onClick={(e) => {
                  e.preventDefault()
                  // Future: Open comparison modal
                }}
              />
            </div>
          </div>
        )}

        {/* AI Insight - The differentiator */}
        {aiInsight && (
          <div className="mt-4">
            <AIInsightBox insight={aiInsight} />
          </div>
        )}
      </div>
    </div>
  )
}

// Simplified export for news items
export function NewsHeroCard({
  href,
  title,
  summary,
  imageUrl,
  fallbackTitle,
  badges,
  metaLeft,
}: Omit<HeroCardProps, 'impactMeter' | 'affectedSystems' | 'aiInsight' | 'showActions' | 'type'>) {
  return (
    <HeroCard
      href={href}
      title={title}
      summary={summary}
      imageUrl={imageUrl}
      fallbackTitle={fallbackTitle}
      badges={badges}
      metaLeft={metaLeft}
      type="news"
      showActions={false}
    />
  )
}
