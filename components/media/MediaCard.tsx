import Link from 'next/link'
import Image from 'next/image'
import { ReactNode, Children, isValidElement } from 'react'
import { Flame, Swords, Brain, Map, Wrench, Gamepad2, Shield, Zap, Target, Users } from 'lucide-react'
import { GameLogoMini } from '@/components/ui/GameLogo'
import { PlatformIcons, type Platform } from '@/components/ui/PlatformIcons'

type CategoryType = 'mobility' | 'weapon' | 'meta' | 'map' | 'bugfix' | 'gameplay' | 'defense' | 'ability' | 'balance' | 'social'

type MediaCardProps = {
  href: string
  title: string
  summary?: string | null
  imageUrl?: string | null
  blurHash?: string | null
  badges?: ReactNode
  metaText?: ReactNode
  category?: CategoryType
  whyItMatters?: string | null
  // Game branding
  game?: {
    name: string
    logoUrl?: string | null
    platforms?: Platform[]
  }
}

type MediaCardVariant = 'vertical' | 'vertical-large' | 'horizontal'

type MediaCardWithVariantProps = MediaCardProps & {
  variant?: MediaCardVariant
}

const categoryConfig: Record<CategoryType, { icon: typeof Flame; label: string; color: string }> = {
  mobility: { icon: Zap, label: 'Mobility Changes', color: 'text-cyan-400' },
  weapon: { icon: Swords, label: 'Weapon Balance', color: 'text-red-400' },
  meta: { icon: Brain, label: 'Meta Impact', color: 'text-purple-400' },
  map: { icon: Map, label: 'Map Update', color: 'text-green-400' },
  bugfix: { icon: Wrench, label: 'Bug Fixes', color: 'text-amber-400' },
  gameplay: { icon: Gamepad2, label: 'Gameplay', color: 'text-blue-400' },
  defense: { icon: Shield, label: 'Defense', color: 'text-emerald-400' },
  ability: { icon: Flame, label: 'Abilities', color: 'text-orange-400' },
  balance: { icon: Target, label: 'Balance', color: 'text-pink-400' },
  social: { icon: Users, label: 'Social', color: 'text-violet-400' },
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

function ThumbnailFallback({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 flex items-center justify-center">
      <span className="text-xl sm:text-2xl font-bold text-white/10 select-none tracking-tight">
        {getInitials(title)}
      </span>
    </div>
  )
}

function limitBadges(badges: ReactNode, max: number): ReactNode {
  const childArray = Children.toArray(badges)
  if (childArray.length <= max) return badges
  return childArray.slice(0, max)
}

function CategoryTag({ category }: { category: CategoryType }) {
  const config = categoryConfig[category]
  const Icon = config.icon

  return (
    <div className={`flex items-center gap-1 text-xs ${config.color}`}>
      <Icon className="w-3 h-3" />
      <span className="font-medium">{config.label}</span>
    </div>
  )
}

export function MediaCard({
  href,
  title,
  summary,
  imageUrl,
  blurHash,
  badges,
  metaText,
  category,
  whyItMatters,
  game,
  variant = 'vertical',
}: MediaCardWithVariantProps) {
  const limitedBadges = badges ? limitBadges(badges, 2) : null
  const displaySummary = whyItMatters || summary

  const isLarge = variant === 'vertical-large'
  const aspectClass = isLarge ? 'aspect-[4/3]' : 'aspect-[16/9]'

  if (variant === 'horizontal') {
    return (
      <Link
        href={href}
        className="group flex gap-2.5 sm:gap-4 overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-2 sm:p-3 transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20 active:scale-[0.98]"
      >
        <div className="relative w-16 h-16 sm:w-28 sm:aspect-[16/9] sm:h-auto flex-shrink-0 overflow-hidden rounded-lg sm:rounded-xl">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 64px, 112px"
              unoptimized
            />
          ) : (
            <ThumbnailFallback title={title} />
          )}
        </div>

        <div className="flex flex-1 flex-col justify-center overflow-hidden min-w-0">
          {/* Title */}
          <h3 className="text-sm sm:text-base font-medium leading-snug line-clamp-2 text-white group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Meta row - compact on mobile */}
          <div className="mt-1 flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-500">
            {game && <span className="truncate max-w-[80px] sm:max-w-[120px]">{game.name}</span>}
            {game && metaText && <span className="text-zinc-600">·</span>}
            {metaText && <span className="truncate">{metaText}</span>}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 hover:border-white/20 hover:bg-white/[0.07] touch-feedback gradient-border"
    >
      <div className={`relative ${aspectClass} w-full overflow-hidden`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            placeholder={blurHash ? 'blur' : 'empty'}
            blurDataURL={blurHash || undefined}
            unoptimized
          />
        ) : (
          <ThumbnailFallback title={title} />
        )}
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Category icon overlay */}
        {category && (
          <div className="absolute top-3 left-3">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 ${categoryConfig[category].color}`}>
              {(() => {
                const Icon = categoryConfig[category].icon
                return <Icon className="w-3.5 h-3.5" />
              })()}
              <span className="text-xs font-medium">{categoryConfig[category].label}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        {limitedBadges && (
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {limitedBadges}
          </div>
        )}

        <h3 className="text-base font-semibold leading-snug line-clamp-2 text-white group-hover:text-white/95">
          {title}
        </h3>

        {displaySummary && (
          <p className="mt-2 text-sm text-zinc-300/80 line-clamp-2 leading-relaxed">
            {displaySummary}
          </p>
        )}

        {/* Footer: Meta + Game branding */}
        <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2 min-w-0">
            {game && (
              <>
                <GameLogoMini logoUrl={game.logoUrl} gameName={game.name} />
                <span className="text-xs text-zinc-500 truncate">{game.name}</span>
              </>
            )}
          </div>
          {game?.platforms && game.platforms.length > 0 && (
            <PlatformIcons platforms={game.platforms} maxVisible={3} size="sm" showTooltip={false} />
          )}
        </div>

        {metaText && !game && (
          <div className="mt-2.5 text-xs text-zinc-500">{metaText}</div>
        )}
      </div>
    </Link>
  )
}

export function MediaCardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  )
}

export function MediaCardList({ children }: { children: ReactNode }) {
  return <div className="space-y-3">{children}</div>
}
