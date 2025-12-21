import Link from 'next/link'
import Image from 'next/image'
import { ReactNode } from 'react'

type HeroCardProps = {
  href: string
  title: string
  summary?: string | null
  imageUrl?: string | null
  fallbackTitle?: string
  badges?: ReactNode
  metaLeft?: ReactNode
  metaRight?: ReactNode
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

export function HeroCard({
  href,
  title,
  summary,
  imageUrl,
  fallbackTitle,
  badges,
  metaLeft,
  metaRight,
}: HeroCardProps) {
  const displayTitle = fallbackTitle || title

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-black/30 active:scale-[0.99]"
    >
      <div className="relative aspect-[16/9] lg:aspect-[21/9] w-full">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
            priority
          />
        ) : (
          <ImageFallback title={displayTitle} />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 lg:p-8">
          {badges && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {badges}
            </div>
          )}

          <h2 className="text-xl sm:text-2xl font-semibold leading-tight tracking-tight text-white line-clamp-2">
            {title}
          </h2>

          {summary && (
            <p className="mt-2 text-sm sm:text-base text-zinc-200/90 line-clamp-2 max-w-2xl">
              {summary}
            </p>
          )}

          {(metaLeft || metaRight) && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-300/80">
              {metaLeft && <div>{metaLeft}</div>}
              {metaRight && <div>{metaRight}</div>}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
