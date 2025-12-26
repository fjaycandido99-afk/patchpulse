'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink, Loader2 } from 'lucide-react'
import { loadMorePatches } from '@/app/(main)/home/actions'
import { relativeDaysText } from '@/lib/dates'
import { PlatformIconsInline } from '@/components/ui/PlatformIcons'

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
  ui: { bg: 'bg-indigo-500/20', text: 'text-indigo-400' },
  'quality of life': { bg: 'bg-teal-500/20', text: 'text-teal-400' },
  qol: { bg: 'bg-teal-500/20', text: 'text-teal-400' },
  security: { bg: 'bg-rose-500/20', text: 'text-rose-400' },
  gameplay: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  meta: { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-400' },
}

function getTagStyle(tag: string) {
  const lowerTag = tag.toLowerCase()
  return TAG_COLORS[lowerTag] || { bg: 'bg-zinc-500/20', text: 'text-zinc-400' }
}

function TagBadge({ tag }: { tag: string }) {
  const style = getTagStyle(tag)
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${style.bg} ${style.text}`}>
      {tag}
    </span>
  )
}

function getImpactColor(score: number): string {
  if (score >= 8) return 'bg-red-500/20 text-red-400 border-red-500/30'
  if (score >= 5) return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  return 'bg-green-500/20 text-green-400 border-green-500/30'
}

function getImpactLabel(score: number): string {
  if (score >= 8) return 'Major'
  if (score >= 5) return 'Medium'
  return 'Minor'
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

      // Deduplicate by ID to prevent React key warnings
      setPatches((prev) => {
        const existingIds = new Set(prev.map(p => p.id))
        const newItems = (result.items as PatchItem[]).filter(p => !existingIds.has(p.id))
        return [...prev, ...newItems]
      })
      setHasMore(result.hasMore)
      setPage(nextPage)

      // Trigger end callback when no more patches
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

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {patches.map((patch, index) => {
          const brandColor = patch.game.brand_color || '#3b82f6'
          return (
            <div
              key={patch.id}
              className="group relative rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
              style={{
                borderColor: `${brandColor}20`,
                animationDelay: `${(index % 12) * 50}ms`,
              }}
            >
              <Link
                href={`/patches/${patch.id}`}
                className="absolute inset-0 z-0"
                aria-label={`View ${patch.title} details`}
              />
              <div className="h-1 w-full" style={{ backgroundColor: brandColor }} />
              <div className="relative z-10 pointer-events-none p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {patch.game.logo_url ? (
                      <div className="relative h-6 w-6 flex-shrink-0 rounded overflow-hidden bg-zinc-800">
                        <Image
                          src={patch.game.logo_url}
                          alt={patch.game.name}
                          fill
                          className="object-contain"
                          sizes="24px"
                        />
                      </div>
                    ) : patch.game.cover_url ? (
                      <div className="relative h-6 w-6 flex-shrink-0 rounded overflow-hidden">
                        <Image
                          src={patch.game.cover_url}
                          alt={patch.game.name}
                          fill
                          className="object-cover"
                          sizes="24px"
                        />
                      </div>
                    ) : (
                      <div
                        className="h-6 w-6 flex-shrink-0 rounded"
                        style={{ backgroundColor: brandColor }}
                      />
                    )}
                    <span className="text-sm font-medium text-muted-foreground truncate">
                      {patch.game.name}
                    </span>
                  </div>
                  <div
                    className={`flex-shrink-0 rounded-md border px-2 py-0.5 text-xs font-semibold ${getImpactColor(patch.impact_score)}`}
                  >
                    {getImpactLabel(patch.impact_score)}
                  </div>
                </div>
                <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {patch.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="capitalize">{relativeDaysText(patch.published_at)}</span>
                  {patch.game.platforms.length > 0 && (
                    <>
                      <span className="text-muted-foreground/50">·</span>
                      <PlatformIconsInline platforms={patch.game.platforms} />
                    </>
                  )}
                </div>
                {patch.summary_tldr && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {patch.summary_tldr}
                  </p>
                )}
                <div className="flex items-end justify-between gap-2 pt-1">
                  {patch.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {patch.tags.slice(0, 3).map((t) => (
                        <TagBadge key={t} tag={t} />
                      ))}
                      {patch.tags.length > 3 && (
                        <span className="px-2 py-0.5 rounded-md text-xs text-muted-foreground bg-muted">
                          +{patch.tags.length - 3}
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
                      className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
                      title="View full patch notes"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Full Notes</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

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
            className="px-6 py-2.5 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors"
          >
            Load More
          </button>
        )}
        {!hasMore && patches.length > 0 && (
          <p className="text-sm text-muted-foreground">All patches loaded</p>
        )}
      </div>
    </div>
  )
}
