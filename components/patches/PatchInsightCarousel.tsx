'use client'

import { useState, useEffect, useCallback, useRef, TouchEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, GitCompare } from 'lucide-react'

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
  hero_url?: string | null
  platforms: Platform[]
}

type FeaturedPatch = {
  id: string
  title: string
  published_at: string
  summary_tldr: string | null
  tags: string[]
  impact_score: number
  source_url: string | null
  ai_insight?: string | null
  game: Game
}

type PatchInsightCarouselProps = {
  patches: FeaturedPatch[]
  autoPlayInterval?: number
}

// Tag category mapping for insight highlights
const TAG_CATEGORIES: Record<string, { label: string; color: string }> = {
  balance: { label: 'Balance Changes', color: 'bg-amber-500/20 text-amber-400' },
  buffs: { label: 'Buffs', color: 'bg-green-500/20 text-green-400' },
  nerfs: { label: 'Nerfs', color: 'bg-red-500/20 text-red-400' },
  mobility: { label: 'Mobility', color: 'bg-cyan-500/20 text-cyan-400' },
  weapons: { label: 'Weapons', color: 'bg-orange-500/20 text-orange-400' },
  'map changes': { label: 'Map Flow', color: 'bg-purple-500/20 text-purple-400' },
  performance: { label: 'Performance', color: 'bg-emerald-500/20 text-emerald-400' },
  content: { label: 'New Content', color: 'bg-violet-500/20 text-violet-400' },
  bugfix: { label: 'Bug Fixes', color: 'bg-blue-500/20 text-blue-400' },
}

function getTagCategory(tag: string) {
  const lowerTag = tag.toLowerCase()
  return TAG_CATEGORIES[lowerTag] || { label: tag, color: 'bg-zinc-500/20 text-zinc-400' }
}

function getImpactLabel(score: number): { label: string; color: string } {
  if (score >= 8) return { label: 'Major Update', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
  if (score >= 5) return { label: 'Significant', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' }
  return { label: 'Minor', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
}

export function PatchInsightCarousel({
  patches,
  autoPlayInterval = 6000,
}: PatchInsightCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const itemCount = patches.length

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % itemCount)
  }, [itemCount])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + itemCount) % itemCount)
  }, [itemCount])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Auto-play
  useEffect(() => {
    if (isPaused || itemCount <= 1) return

    const interval = setInterval(goToNext, autoPlayInterval)
    return () => clearInterval(interval)
  }, [isPaused, autoPlayInterval, goToNext, itemCount])

  // Touch handlers
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    setIsPaused(true)
  }

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    const threshold = 50

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        goToNext()
      } else {
        goToPrev()
      }
    }

    setTimeout(() => setIsPaused(false), 3000)
  }

  if (itemCount === 0) return null

  const currentPatch = patches[currentIndex]
  const brandColor = currentPatch.game.brand_color || '#3b82f6'
  const impact = getImpactLabel(currentPatch.impact_score)
  const heroImage = currentPatch.game.hero_url || currentPatch.game.cover_url

  return (
    <div
      className="relative group rounded-2xl overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides container */}
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {patches.map((patch, index) => {
            const patchBrandColor = patch.game.brand_color || '#3b82f6'
            const patchHeroImage = patch.game.hero_url || patch.game.cover_url
            const patchImpact = getImpactLabel(patch.impact_score)

            return (
              <div
                key={patch.id}
                className="w-full flex-shrink-0"
                aria-hidden={index !== currentIndex}
              >
                {/* Hero slide */}
                <div className="relative h-[320px] sm:h-[380px] lg:h-[420px]">
                  {/* Background image or gradient */}
                  {patchHeroImage ? (
                    <>
                      <Image
                        src={patchHeroImage}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority={index === 0}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          background: `linear-gradient(135deg, ${patchBrandColor}40 0%, transparent 50%)`,
                        }}
                      />
                    </>
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${patchBrandColor}60 0%, ${patchBrandColor}20 50%, #09090b 100%)`,
                      }}
                    />
                  )}

                  {/* Content overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
                    {/* Top badges */}
                    <div className="absolute top-5 left-5 sm:top-8 sm:left-8 flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${patchImpact.color}`}>
                        {patchImpact.label}
                      </span>
                      {patch.tags.slice(0, 3).map((tag) => {
                        const category = getTagCategory(tag)
                        return (
                          <span
                            key={tag}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${category.color}`}
                          >
                            {category.label}
                          </span>
                        )
                      })}
                    </div>

                    {/* Game info + Title */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {patch.game.logo_url && (
                          <div className="relative h-8 w-8 rounded overflow-hidden bg-white/10 backdrop-blur">
                            <Image
                              src={patch.game.logo_url}
                              alt={patch.game.name}
                              fill
                              className="object-contain"
                              sizes="32px"
                            />
                          </div>
                        )}
                        <span className="text-sm font-medium text-white/80">
                          {patch.game.name}
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight line-clamp-2">
                        {patch.title}
                      </h2>

                      {patch.summary_tldr && (
                        <p className="text-sm sm:text-base text-white/70 line-clamp-2 max-w-2xl">
                          {patch.summary_tldr}
                        </p>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Link
                          href={`/patches/${patch.id}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black font-medium text-sm hover:bg-white/90 transition-colors"
                        >
                          View Full Patch
                          <ArrowRight className="h-4 w-4" />
                        </Link>

                        <button
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 backdrop-blur border border-white/20 text-white font-medium text-sm hover:bg-white/20 transition-colors"
                        >
                          <Sparkles className="h-4 w-4" />
                          AI Summary
                        </button>

                        <button
                          className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 backdrop-blur border border-white/20 text-white font-medium text-sm hover:bg-white/20 transition-colors"
                        >
                          <GitCompare className="h-4 w-4" />
                          Compare
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation arrows */}
      {itemCount > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute top-1/2 left-3 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white/80 hover:text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={goToNext}
            className="absolute top-1/2 right-3 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white/80 hover:text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Pagination dots */}
      {itemCount > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {patches.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-6 bg-white'
                  : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {!isPaused && itemCount > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden">
          <div
            className="h-full bg-white/60"
            style={{
              animation: `carousel-progress ${autoPlayInterval}ms linear`,
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes carousel-progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
