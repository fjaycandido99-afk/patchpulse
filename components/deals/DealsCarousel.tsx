'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Gamepad2, Clock } from 'lucide-react'
import { DealBookmarkButton } from './DealBookmarkButton'
import { useDealSpotlight } from './DealSpotlightProvider'

type Deal = {
  id: string
  title: string
  salePrice: number
  normalPrice: number
  savings: number
  store: string
  thumb: string
  dealUrl: string
  isUserGame: boolean
  expiresIn: string | null
  steamAppId?: string | null
  isBookmarked?: boolean
}

type DealsCarouselProps = {
  deals: Deal[]
  autoPlayInterval?: number
  isPro?: boolean
}

export function DealsCarousel({
  deals,
  autoPlayInterval = 4000,
  isPro = false,
}: DealsCarouselProps) {
  const { openDealSpotlight } = useDealSpotlight()
  // 5 slots: 1 featured (large) + 4 grid items
  const [slots, setSlots] = useState([0, 1, 2, 3, 4])
  // Track which slot is currently transitioning
  const [fadingSlot, setFadingSlot] = useState<number | null>(null)

  const visibleCount = 5

  // Auto-rotate one random slot at a time
  useEffect(() => {
    if (deals.length <= visibleCount) return

    const interval = setInterval(() => {
      // Pick a random slot to change
      const slotToChange = Math.floor(Math.random() * 5)

      // Start fade out
      setFadingSlot(slotToChange)

      // After fade out, update the deal and fade in
      setTimeout(() => {
        setSlots(prev => {
          const newSlots = [...prev]
          // Pick a random deal that's not currently showing
          const currentDeals = new Set(newSlots)
          let newDealIndex = Math.floor(Math.random() * deals.length)
          // Try to find a deal not currently visible
          let attempts = 0
          while (currentDeals.has(newDealIndex) && attempts < 10) {
            newDealIndex = Math.floor(Math.random() * deals.length)
            attempts++
          }
          newSlots[slotToChange] = newDealIndex
          return newSlots
        })

        // Keep fading state for fade-in animation
        setTimeout(() => {
          setFadingSlot(null)
        }, 400)
      }, 400)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [deals.length, autoPlayInterval])

  if (deals.length === 0) return null

  // Helper to render a deal card
  const renderDealCard = (dealIndex: number, slotIndex: number, isLarge = false) => {
    const deal = deals[dealIndex % deals.length]
    const isFading = fadingSlot === slotIndex

    const handleClick = () => {
      openDealSpotlight({
        id: deal.id,
        title: deal.title,
        salePrice: deal.salePrice,
        normalPrice: deal.normalPrice,
        savings: deal.savings,
        store: deal.store,
        thumb: deal.thumb,
        dealUrl: deal.dealUrl,
        isUserGame: deal.isUserGame,
        expiresIn: deal.expiresIn,
        steamAppId: deal.steamAppId,
        isBookmarked: deal.isBookmarked,
      }, isPro)
    }

    return (
      <div
        key={`slot-${slotIndex}`}
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
        className="group active:scale-[0.98] text-left block h-full w-full cursor-pointer"
        style={{
          opacity: isFading ? 0 : 1,
          transform: isFading ? 'scale(0.97)' : 'scale(1)',
          transition: 'opacity 400ms ease-in-out, transform 400ms ease-in-out',
        }}
      >
        <div className={`relative ${isLarge ? 'aspect-[16/9]' : 'aspect-[16/9]'} rounded-xl overflow-hidden bg-zinc-900`}>
          {deal.thumb ? (
            <>
              <Image
                src={deal.thumb}
                alt={deal.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes={isLarge ? '(max-width: 640px) 100vw, 50vw' : '(max-width: 640px) 50vw, 25vw'}
                loading="lazy"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
              <Gamepad2 className="w-8 h-8 text-zinc-700" />
            </div>
          )}

          {/* Discount badge */}
          <span className={`absolute top-2 left-2 ${isLarge ? 'text-sm px-2.5 py-1' : 'text-xs px-2 py-0.5'} rounded-lg backdrop-blur-sm font-bold bg-green-500 text-white shadow-lg`}>
            -{deal.savings}%
          </span>

          {/* Bookmark button - top right */}
          <div className={`absolute ${isLarge ? 'top-2 right-2' : 'top-1.5 right-1.5'}`}>
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

          {/* User game badge */}
          {deal.isUserGame && (
            <span className={`absolute ${isLarge ? 'top-12 right-2' : 'top-10 right-1.5'} ${isLarge ? 'text-xs px-2 py-1' : 'text-[10px] px-1.5 py-0.5'} rounded-lg backdrop-blur-sm font-medium bg-primary text-white shadow-lg`}>
              In Library
            </span>
          )}

          {/* Content overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 p-3">
            <h3 className={`font-bold text-white ${isLarge ? 'text-lg sm:text-xl' : 'text-sm'} line-clamp-1 mb-1 group-hover:text-primary transition-colors`}>
              {deal.title}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`${isLarge ? 'text-sm' : 'text-xs'} text-white/50 line-through`}>
                  ${deal.normalPrice.toFixed(2)}
                </span>
                <span className={`${isLarge ? 'text-xl' : 'text-base'} font-bold text-green-400`}>
                  ${deal.salePrice.toFixed(2)}
                </span>
              </div>
              {deal.expiresIn && (
                <div className={`flex items-center gap-1 ${isLarge ? 'text-xs' : 'text-[10px]'} text-white/70 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm`}>
                  <Clock className="h-3 w-3" />
                  <span>{deal.expiresIn}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Featured large card */}
      <div className="sm:row-span-2">
        {renderDealCard(slots[0], 0, true)}
      </div>

      {/* 4 smaller cards in a 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {renderDealCard(slots[1], 1)}
        {renderDealCard(slots[2], 2)}
        {renderDealCard(slots[3], 3)}
        {renderDealCard(slots[4], 4)}
      </div>
    </div>
  )
}
