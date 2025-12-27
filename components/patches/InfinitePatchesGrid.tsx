'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink, Loader2, Sparkles } from 'lucide-react'
import { loadMorePatches } from '@/app/(main)/home/actions'
import { relativeDaysText } from '@/lib/dates'

type Platform = {
  id: string
  name: string
  icon_url: string | null
}

type PatchItem = {
  id: string
  title: string
  published_at: string
  summary_tldr: string | null
  tags: string[]
  impact_score: number
  source_url: string | null
  game: {
    id: string
    name: string
    slug: string
    logo_url: string | null
    brand_color: string | null
    cover_url: string | null
    hero_url?: string | null
    platforms: Platform[]
  }
}

type InfinitePatchesGridProps = {
  initialPatches: PatchItem[]
  initialHasMore: boolean
  initialPage: number
  filters: {
    gameId?: string
    tag?: string
    importance?: 'major' | 'medium' | 'minor'
  }
  onEndReached?: () => void
}

// Tag color mapping
const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  balance: { bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/20' },
  buffs: { bg: 'bg-green-500/10', text: 'text-green-300', border: 'border-green-500/20' },
  nerfs: { bg: 'bg-red-500/10', text: 'text-red-300', border: 'border-red-500/20' },
  bugfix: { bg: 'bg-blue-500/10', text: 'text-blue-300', border: 'border-blue-500/20' },
  'bug fix': { bg: 'bg-blue-500/10', text: 'text-blue-300', border: 'border-blue-500/20' },
  content: { bg: 'bg-purple-500/10', text: 'text-purple-300', border: 'border-purple-500/20' },
  'new content': { bg: 'bg-purple-500/10', text: 'text-purple-300', border: 'border-purple-500/20' },
  feature: { bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/20' },
  performance: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/20' },
  ui: { bg: 'bg-indigo-500/10', text: 'text-indigo-300', border: 'border-indigo-500/20' },
  'quality of life': { bg: 'bg-teal-500/10', text: 'text-teal-300', border: 'border-teal-500/20' },
  qol: { bg: 'bg-teal-500/10', text: 'text-teal-300', border: 'border-teal-500/20' },
  security: { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/20' },
  gameplay: { bg: 'bg-orange-500/10', text: 'text-orange-300', border: 'border-orange-500/20' },
  meta: { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-300', border: 'border-fuchsia-500/20' },
}

function getTagStyle(tag: string) {
  const lowerTag = tag.toLowerCase()
  return TAG_COLORS[lowerTag] || { bg: 'bg-white/5', text: 'text-zinc-300', border: 'border-white/10' }
}

function getImpactStyle(score: number): { label: string; bg: string; text: string; border: string } {
  if (score >= 8) return { label: 'Major', bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-400/30' }
  if (score >= 5) return { label: 'Medium', bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-400/30' }
  return { label: 'Minor', bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-400/30' }
}

// Hero-style patch card (for major patches - full width)
function HeroPatchCard({ patch, priority = false }: { patch: PatchItem; priority?: boolean }) {
  const impact = getImpactStyle(patch.impact_score)
  const heroImage = patch.game.hero_url || patch.game.cover_url
  const brandColor = patch.game.brand_color || '#3b82f6'

  return (
    <Link
      href={`/patches/${patch.id}`}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 block"
    >
      {/* Hero Image - More compact sizing */}
      <div className="relative aspect-[2.5/1] lg:aspect-[3/1]">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={patch.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority={priority}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${brandColor}40 0%, ${brandColor}10 50%, #09090b 100%)`,
            }}
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* Content on Image */}
        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
          {/* Game Logo + Name */}
          <div className="flex items-center gap-2 mb-2">
            {patch.game.logo_url && (
              <div className="relative w-6 h-6 rounded overflow-hidden bg-white/10 backdrop-blur-sm">
                <Image
                  src={patch.game.logo_url}
                  alt={patch.game.name}
                  fill
                  className="object-contain"
                  sizes="24px"
                />
              </div>
            )}
            <span className="text-xs text-zinc-300 font-medium">{patch.game.name}</span>
          </div>

          {/* Patch Title */}
          <h3 className="text-lg lg:text-2xl font-bold leading-tight text-white line-clamp-2 group-hover:text-primary transition-colors">
            {patch.title}
          </h3>
        </div>

        {/* Importance Badge - Top Right */}
        <span className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold border backdrop-blur-sm ${impact.bg} ${impact.text} ${impact.border}`}>
          {impact.label}
        </span>
      </div>

      {/* Meta Section */}
      <div className="p-4 lg:p-5 space-y-3">
        {/* Summary */}
        {patch.summary_tldr && (
          <p className="text-sm text-zinc-300 line-clamp-2">
            {patch.summary_tldr}
          </p>
        )}

        {/* Tags */}
        {patch.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {patch.tags.slice(0, 4).map((tag) => {
              const style = getTagStyle(tag)
              return (
                <span
                  key={tag}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${style.bg} ${style.text} ${style.border}`}
                >
                  {tag}
                </span>
              )
            })}
            {patch.tags.length > 4 && (
              <span className="rounded-full px-2 py-0.5 text-[11px] text-zinc-400 bg-white/5 border border-white/10">
                +{patch.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
          <span>{relativeDaysText(patch.published_at)}</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
              <Sparkles className="w-3.5 h-3.5" />
              AI Summary
            </span>
            {patch.source_url && (
              <span className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
                Full Notes
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

// Compact card (for medium/minor patches - grid layout)
function CompactPatchCard({ patch }: { patch: PatchItem }) {
  const impact = getImpactStyle(patch.impact_score)
  const heroImage = patch.game.hero_url || patch.game.cover_url
  const brandColor = patch.game.brand_color || '#3b82f6'

  return (
    <Link
      href={`/patches/${patch.id}`}
      className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/40 block"
    >
      {/* Image - Compact sizing */}
      <div className="relative aspect-[2/1]">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={patch.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${brandColor}40 0%, ${brandColor}10 50%, #09090b 100%)`,
            }}
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        {/* Content on Image */}
        <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4">
          <p className="text-[11px] text-zinc-300 mb-1 font-medium">{patch.game.name}</p>
          <h3 className="text-sm lg:text-base font-semibold leading-tight text-white line-clamp-2 group-hover:text-primary transition-colors">
            {patch.title}
          </h3>
        </div>

        {/* Importance Badge */}
        <span className={`absolute top-2.5 right-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold border backdrop-blur-sm ${impact.bg} ${impact.text} ${impact.border}`}>
          {impact.label}
        </span>
      </div>

      {/* Meta Section */}
      <div className="p-3 lg:p-4 space-y-2">
        {patch.summary_tldr && (
          <p className="text-xs text-zinc-400 line-clamp-2">
            {patch.summary_tldr}
          </p>
        )}

        {patch.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {patch.tags.slice(0, 3).map((tag) => {
              const style = getTagStyle(tag)
              return (
                <span
                  key={tag}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${style.bg} ${style.text} ${style.border}`}
                >
                  {tag}
                </span>
              )
            })}
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-zinc-500">
          <span>{relativeDaysText(patch.published_at)}</span>
          {patch.source_url && (
            <ExternalLink className="w-3 h-3" />
          )}
        </div>
      </div>
    </Link>
  )
}

export function InfinitePatchesGrid({
  initialPatches,
  initialHasMore,
  initialPage,
  filters,
  onEndReached,
}: InfinitePatchesGridProps) {
  const [patches, setPatches] = useState<PatchItem[]>(initialPatches)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [page, setPage] = useState(initialPage)
  const [isLoading, setIsLoading] = useState(false)
  const [hasTriggeredEnd, setHasTriggeredEnd] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Reset when filters change
  useEffect(() => {
    setPatches(initialPatches)
    setHasMore(initialHasMore)
    setPage(initialPage)
    setHasTriggeredEnd(false)
  }, [initialPatches, initialHasMore, initialPage])

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const nextPage = page + 1
      const result = await loadMorePatches({
        gameId: filters.gameId,
        tag: filters.tag,
        importance: filters.importance,
        page: nextPage,
      })

      // Deduplicate by ID
      setPatches((prev) => {
        const existingIds = new Set(prev.map(p => p.id))
        const newItems = (result.items as PatchItem[]).filter(p => !existingIds.has(p.id))
        return [...prev, ...newItems]
      })
      setHasMore(result.hasMore)
      setPage(nextPage)

      if (!result.hasMore && !hasTriggeredEnd && onEndReached) {
        setHasTriggeredEnd(true)
        onEndReached()
      }
    } catch (error) {
      console.error('Failed to load more patches:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, page, filters, hasTriggeredEnd, onEndReached])

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isLoading, loadMore])

  // Trigger end reached if initially no more
  useEffect(() => {
    if (!hasMore && !hasTriggeredEnd && patches.length > 0 && onEndReached) {
      setHasTriggeredEnd(true)
      onEndReached()
    }
  }, [hasMore, hasTriggeredEnd, patches.length, onEndReached])

  // Split patches by importance
  const majorPatches = patches.filter(p => p.impact_score >= 8)
  const otherPatches = patches.filter(p => p.impact_score < 8)

  return (
    <div className="space-y-6">
      {/* Major Patches - Full Width Hero Cards */}
      {majorPatches.length > 0 && (
        <div className="space-y-4">
          {majorPatches.map((patch, idx) => (
            <HeroPatchCard key={patch.id} patch={patch} priority={idx < 2} />
          ))}
        </div>
      )}

      {/* Section Divider */}
      {majorPatches.length > 0 && otherPatches.length > 0 && (
        <div className="flex items-center gap-3 py-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">More Updates</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      )}

      {/* Medium/Minor Patches - Grid Layout */}
      {otherPatches.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {otherPatches.map((patch) => (
            <CompactPatchCard key={patch.id} patch={patch} />
          ))}
        </div>
      )}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading more patches...</span>
          </div>
        )}
        {hasMore && !isLoading && (
          <button
            onClick={loadMore}
            className="px-6 py-2.5 rounded-lg border border-white/10 bg-white/5 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Load More
          </button>
        )}
        {!hasMore && patches.length > 0 && (
          <p className="text-sm text-zinc-500">All patches loaded</p>
        )}
      </div>
    </div>
  )
}
