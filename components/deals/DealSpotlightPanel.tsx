'use client'

import Image from 'next/image'
import { X, Gamepad2, Clock, ExternalLink, Tag, Store, TrendingDown } from 'lucide-react'
import { DealBookmarkButton } from './DealBookmarkButton'

export type SpotlightDeal = {
  id: string
  title: string
  salePrice: number
  normalPrice: number
  savings: number
  store: string
  thumb: string
  dealUrl: string
  isUserGame?: boolean
  expiresIn?: string | null
  steamAppId?: string | null
  isBookmarked?: boolean
}

type DealSpotlightPanelProps = {
  deal: SpotlightDeal
  isOpen: boolean
  onClose: () => void
  isPro?: boolean
}

export function DealSpotlightPanel({ deal, isOpen, onClose, isPro = false }: DealSpotlightPanelProps) {
  if (!isOpen) return null

  const savings = deal.normalPrice - deal.salePrice
  const imageUrl = deal.steamAppId
    ? `https://cdn.akamai.steamstatic.com/steam/apps/${deal.steamAppId}/header.jpg`
    : deal.thumb

  // Get store badge styles
  const getStoreBadgeStyles = (store: string) => {
    switch (store) {
      case 'Steam':
        return 'bg-[#1b2838] text-[#66c0f4]'
      case 'Epic Games Store':
        return 'bg-black text-white'
      case 'GOG':
        return 'bg-[#86328a] text-white'
      case 'Humble Store':
        return 'bg-[#cc2929] text-white'
      case 'Fanatical':
        return 'bg-orange-600 text-white'
      case 'GreenManGaming':
        return 'bg-green-600 text-white'
      case 'GameBillet':
        return 'bg-blue-600 text-white'
      case 'Gamesplanet':
        return 'bg-cyan-600 text-white'
      case 'IndieGala':
        return 'bg-pink-600 text-white'
      case 'GamersGate':
        return 'bg-amber-600 text-white'
      case 'Blizzard Shop':
        return 'bg-[#00aeff] text-white'
      case 'Ubisoft Store':
        return 'bg-[#0070ff] text-white'
      case 'Origin':
      case 'EA App':
        return 'bg-[#f56c2d] text-white'
      case 'Microsoft Store':
      case 'Xbox Store':
        return 'bg-[#107c10] text-white'
      case 'PlayStation Store':
        return 'bg-[#003791] text-white'
      case 'Nintendo eShop':
        return 'bg-[#e60012] text-white'
      case 'Prime Gaming':
      case 'Amazon':
        return 'bg-[#ff9900] text-black'
      case 'itch.io':
        return 'bg-[#fa5c5c] text-white'
      default:
        return 'bg-zinc-700 text-zinc-300'
    }
  }

  const getStoreDisplayName = (store: string) => {
    switch (store) {
      case 'Epic Games Store': return 'Epic'
      case 'GreenManGaming': return 'GMG'
      case 'PlayStation Store': return 'PSN'
      case 'Nintendo eShop': return 'eShop'
      case 'Microsoft Store': return 'MS Store'
      default: return store
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel - Bottom sheet on mobile, side panel on desktop */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-y-0 md:left-auto md:right-0 md:w-[420px]">
        <div className="flex h-[75vh] md:h-full flex-col rounded-t-3xl md:rounded-none bg-background border-t md:border-l border-border overflow-hidden animate-in slide-in-from-bottom md:slide-in-from-right duration-300">

          {/* Drag handle - mobile only */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Hero Section */}
          <div className="relative h-44 sm:h-52 md:h-56 flex-shrink-0">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={deal.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 420px"
                priority
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                <Gamepad2 className="h-16 w-16 text-zinc-600" />
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Discount badge */}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold bg-green-500 text-white">
                <TrendingDown className="h-4 w-4" />
                -{deal.savings}% OFF
              </span>
            </div>

            {/* User game badge */}
            {deal.isUserGame && (
              <div className="absolute top-14 left-4">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold bg-primary text-primary-foreground">
                  In Your Library
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-5">

              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-foreground">{deal.title}</h2>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStoreBadgeStyles(deal.store)}`}>
                    {getStoreDisplayName(deal.store)}
                  </span>
                  {deal.expiresIn && (
                    <span className="flex items-center gap-1 text-xs text-amber-400">
                      <Clock className="h-3.5 w-3.5" />
                      {deal.expiresIn}
                    </span>
                  )}
                </div>
              </div>

              {/* Price Section */}
              <section className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                  <Tag className="h-4 w-4 text-green-400" />
                  Price Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Original Price</span>
                    <span className="text-sm text-muted-foreground line-through">${deal.normalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Discount</span>
                    <span className="text-sm font-medium text-green-400">-{deal.savings}% (${savings.toFixed(2)} off)</span>
                  </div>
                  <div className="border-t border-border pt-3 flex items-center justify-between">
                    <span className="text-base font-semibold text-foreground">Sale Price</span>
                    <span className="text-2xl font-bold text-green-400">${deal.salePrice.toFixed(2)}</span>
                  </div>
                </div>
              </section>

              {/* Store Info */}
              <section className="rounded-xl border border-border bg-card/50 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                  <Store className="h-4 w-4 text-blue-400" />
                  Where to Buy
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{deal.store}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Official retailer</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${getStoreBadgeStyles(deal.store)}`}>
                    {getStoreDisplayName(deal.store)}
                  </span>
                </div>
              </section>

              {/* Deal Tips */}
              <section className="rounded-xl border border-border bg-card/50 p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">Deal Tips</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    {deal.savings >= 75 ? 'Historic low price - great time to buy!' :
                     deal.savings >= 50 ? 'Solid discount - worth considering' :
                     'Check price history before buying'}
                  </li>
                  {deal.expiresIn && (
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      Deal expires {deal.expiresIn.toLowerCase()}
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    Bookmark to track this deal
                  </li>
                </ul>
              </section>

            </div>
          </div>

          {/* Actions - Sticky footer */}
          <div className="flex-shrink-0 border-t border-border bg-background p-4 pb-6 sm:pb-4">
            <div className="flex gap-3">
              {/* Buy Now button */}
              <a
                href={deal.dealUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Buy Now - ${deal.salePrice.toFixed(2)}
              </a>

              {/* Bookmark button */}
              <div className="flex items-center justify-center rounded-xl px-4 py-3 border border-border bg-card hover:bg-muted transition-colors">
                <DealBookmarkButton
                  dealId={deal.id}
                  metadata={{
                    title: deal.title,
                    salePrice: deal.salePrice,
                    normalPrice: deal.normalPrice,
                    savings: deal.savings,
                    store: deal.store,
                    thumb: deal.thumb,
                    dealUrl: deal.dealUrl,
                    steamAppId: deal.steamAppId || null,
                    savedAt: new Date().toISOString(),
                  }}
                  initialBookmarked={deal.isBookmarked || false}
                  isPro={isPro}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
