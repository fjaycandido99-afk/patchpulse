'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { FileText } from 'lucide-react'
import { Badge, ImpactBadge } from '@/components/ui/badge'
import { MetaRow } from '@/components/ui/MetaRow'
import { MediaCard } from '@/components/media/MediaCard'
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

type CyclingPatchesProps = {
  patches: PatchItem[]
  visibleCount?: number
  cycleInterval?: number
}

export function CyclingPatches({
  patches,
  visibleCount = 6,
  cycleInterval = 3000
}: CyclingPatchesProps) {
  // Track which patches are currently displayed (by index in original array)
  const [displayIndices, setDisplayIndices] = useState<number[]>([])
  // Track which slot is animating
  const [animatingSlot, setAnimatingSlot] = useState<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize display indices
  useEffect(() => {
    const initial = patches.slice(0, visibleCount).map((_, i) => i)
    setDisplayIndices(initial)
  }, [patches.length, visibleCount])

  // Get indices of patches not currently displayed
  const getAvailableIndices = useCallback(() => {
    const displayedSet = new Set(displayIndices)
    return patches.map((_, i) => i).filter(i => !displayedSet.has(i))
  }, [displayIndices, patches])

  // Swap one random patch
  const swapRandomPatch = useCallback(() => {
    const available = getAvailableIndices()
    if (available.length === 0) return

    // Pick random slot to replace
    const slotToReplace = Math.floor(Math.random() * displayIndices.length)
    // Pick random patch from available
    const newPatchIndex = available[Math.floor(Math.random() * available.length)]

    // Animate out
    setAnimatingSlot(slotToReplace)

    setTimeout(() => {
      setDisplayIndices(prev => {
        const newIndices = [...prev]
        newIndices[slotToReplace] = newPatchIndex
        return newIndices
      })
      // Animate in
      setTimeout(() => {
        setAnimatingSlot(null)
      }, 50)
    }, 300)
  }, [displayIndices, getAvailableIndices])

  // Auto-cycle through patches one at a time
  useEffect(() => {
    if (patches.length <= visibleCount) return

    intervalRef.current = setInterval(swapRandomPatch, cycleInterval)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [patches.length, visibleCount, cycleInterval, swapRandomPatch])

  if (patches.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No patches yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Follow games to see their patch notes here
        </p>
      </div>
    )
  }

  // Get actual patch objects to display
  const displayPatches = displayIndices.map(i => patches[i]).filter(Boolean)

  return (
    <div className="space-y-3">
      {/* Patch count indicator */}
      {patches.length > visibleCount && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">
            Showing {visibleCount} of {patches.length} patches
          </span>
          <span className="text-xs text-muted-foreground/50">• auto-updating</span>
        </div>
      )}

      {/* Patches grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 auto-rows-fr">
        {displayPatches.map((patch, slotIndex) => (
          <div
            key={`slot-${slotIndex}-${patch.id}`}
            className={`h-full transition-all duration-300 ${
              animatingSlot === slotIndex
                ? 'opacity-0 scale-95'
                : 'opacity-100 scale-100'
            }`}
          >
            <MediaCard
              href={`/patches/${patch.id}?from=home`}
              title={patch.title}
              summary={patch.summary_tldr}
              imageUrl={patch.game.hero_url || patch.game.cover_url}
              variant="vertical"
              game={{
                name: patch.game.name,
                logoUrl: patch.game.logo_url,
                platforms: patch.game.platforms,
              }}
              badges={
                <>
                  <Badge variant="patch">Patch</Badge>
                  <ImpactBadge score={patch.impact_score} size="sm" />
                </>
              }
              metaText={
                <MetaRow
                  items={[
                    patch.game.name,
                    relativeDaysText(patch.published_at),
                  ]}
                  size="xs"
                />
              }
            />
          </div>
        ))}
      </div>
    </div>
  )
}
