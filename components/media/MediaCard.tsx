import Link from 'next/link'
import Image from 'next/image'
import { ReactNode, Children, isValidElement } from 'react'

type MediaCardProps = {
  href: string
  title: string
  summary?: string | null
  imageUrl?: string | null
  badges?: ReactNode
  metaText?: ReactNode
}

type MediaCardVariant = 'vertical' | 'horizontal'

type MediaCardWithVariantProps = MediaCardProps & {
  variant?: MediaCardVariant
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

export function MediaCard({
  href,
  title,
  summary,
  imageUrl,
  badges,
  metaText,
  variant = 'vertical',
}: MediaCardWithVariantProps) {
  const limitedBadges = badges ? limitBadges(badges, 2) : null

  if (variant === 'horizontal') {
    return (
      <Link
        href={href}
        className="group flex gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-black/30 active:scale-[0.99]"
      >
        <div className="relative aspect-[16/9] w-28 flex-shrink-0 overflow-hidden rounded-xl sm:w-36">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 112px, 144px"
            />
          ) : (
            <ThumbnailFallback title={title} />
          )}
        </div>

        <div className="flex flex-1 flex-col justify-center overflow-hidden py-1">
          {limitedBadges && (
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              {limitedBadges}
            </div>
          )}

          <h3 className="text-base font-semibold leading-snug line-clamp-2 text-white">
            {title}
          </h3>

          {summary && (
            <p className="mt-1.5 text-sm text-zinc-200/80 line-clamp-2">
              {summary}
            </p>
          )}

          {metaText && (
            <div className="mt-2 text-xs text-zinc-400">{metaText}</div>
          )}
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-black/30 active:scale-[0.99]"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <ThumbnailFallback title={title} />
        )}
      </div>

      <div className="p-4">
        {limitedBadges && (
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {limitedBadges}
          </div>
        )}

        <h3 className="text-base font-semibold leading-snug line-clamp-2 text-white">
          {title}
        </h3>

        {summary && (
          <p className="mt-2 text-sm text-zinc-200/80 line-clamp-2">
            {summary}
          </p>
        )}

        {metaText && (
          <div className="mt-2 text-xs text-zinc-400">{metaText}</div>
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
