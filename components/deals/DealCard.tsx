'use client'

import Image from 'next/image'
import { Gamepad2, Clock } from 'lucide-react'
import { DealBookmarkButton } from './DealBookmarkButton'

type DealCardProps = {
  id: string
  title: string
  salePrice: number
  normalPrice: number
  savings: number
  store: string
  storeIcon: string | null
  steamAppId?: string | null
  thumb: string
  dealUrl: string
  isUserGame?: boolean
  expiresIn?: string | null
  isBookmarked?: boolean
  isPro?: boolean
}

export function DealCard({
  id,
  title,
  salePrice,
  normalPrice,
  savings,
  store,
  storeIcon,
  steamAppId,
  thumb,
  dealUrl,
  isUserGame,
  expiresIn,
  isBookmarked = false,
  isPro = false,
}: DealCardProps) {
  // Use Steam header image for better quality (460x215 aspect ratio)
  const headerImage = steamAppId
    ? `https://cdn.akamai.steamstatic.com/steam/apps/${steamAppId}/header.jpg`
    : thumb

  return (
    <a
      href={dealUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex flex-col overflow-hidden rounded-xl border transition-all hover:shadow-lg ${
        isUserGame
          ? 'border-primary/30 hover:border-primary/50 hover:shadow-primary/10'
          : 'border-border hover:border-primary/50 hover:shadow-primary/5'
      } bg-card`}
    >
      {/* Cover Image - Steam header aspect ratio (460:215 ≈ 2.14:1) */}
      <div className="relative aspect-[460/215] w-full overflow-hidden bg-muted">
        {headerImage ? (
          <Image
            src={headerImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Gamepad2 className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Discount Badge */}
        <span className="absolute top-2 left-2 z-10 rounded-lg bg-green-500 px-2 py-1 text-sm font-bold text-white shadow-lg">
          -{savings}%
        </span>

        {/* Bookmark Button */}
        <div className="absolute top-2 right-2 z-10">
          <DealBookmarkButton
            dealId={id}
            metadata={{
              title,
              salePrice,
              normalPrice,
              savings,
              store,
              thumb,
              dealUrl,
              steamAppId: steamAppId || null,
              savedAt: new Date().toISOString(),
            }}
            initialBookmarked={isBookmarked}
            isPro={isPro}
          />
        </div>

        {/* User Game Badge */}
        {isUserGame && (
          <span className="absolute top-10 left-2 z-10 rounded-lg bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground shadow-lg">
            In Library
          </span>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* Title overlay on image */}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="text-sm font-bold text-white line-clamp-1 drop-shadow-lg">
            {title}
          </h3>
        </div>
      </div>

      {/* Price Bar */}
      <div className="flex items-center justify-between gap-2 p-3 bg-card">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground line-through">${normalPrice.toFixed(2)}</span>
          <span className="text-lg font-bold text-green-400">${salePrice.toFixed(2)}</span>
        </div>
        {expiresIn && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="text-xs font-medium">{expiresIn}</span>
          </div>
        )}
      </div>
    </a>
  )
}
