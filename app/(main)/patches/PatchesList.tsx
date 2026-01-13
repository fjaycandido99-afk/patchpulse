'use client'

import { useState, useTransition, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FileText, ChevronRight, Flame, Filter, Plus, Loader2, Check } from 'lucide-react'
import { followGame } from '@/app/(main)/actions/games'
import { PatchHoverPreview } from '@/components/patches/PatchHoverPreview'

type Patch = {
  id: string
  title: string
  published_at: string
  summary_tldr: string | null
  impact_score: number
  game: {
    id: string
    name: string
    slug: string
    cover_url: string | null
  }
}

type FilterType = 'all' | 'your_patches' | 'high_impact' | 'recent'

function getRelativeTime(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return then.toLocaleDateString()
}

function getImpactColor(score: number) {
  if (score >= 8) return 'text-red-400'
  if (score >= 6) return 'text-amber-400'
  if (score >= 4) return 'text-cyan-400'
  return 'text-zinc-400'
}

function getImpactBg(score: number) {
  if (score >= 8) return 'bg-red-500/20 border-red-500/30'
  if (score >= 6) return 'bg-amber-500/20 border-amber-500/30'
  if (score >= 4) return 'bg-cyan-500/20 border-cyan-500/30'
  return 'bg-zinc-500/20 border-zinc-500/30'
}

type Props = {
  initialPatches: Patch[]
  followedGameIds?: string[]
  backlogGameIds?: string[]
}

export function PatchesList({ initialPatches, followedGameIds = [], backlogGameIds = [] }: Props) {
  const [patches] = useState(initialPatches)
  const [filter, setFilter] = useState<FilterType>('all')
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set(followedGameIds))
  const yourGameIds = useMemo(() => new Set([...followedGameIds, ...backlogGameIds]), [followedGameIds, backlogGameIds])
  const [pendingGameId, setPendingGameId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleFollow(gameId: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (followedIds.has(gameId)) return

    setPendingGameId(gameId)
    startTransition(async () => {
      try {
        const result = await followGame(gameId)
        if (result.success && result.following) {
          setFollowedIds(prev => new Set([...prev, gameId]))
        }
      } catch (error) {
        console.error('Failed to follow game:', error)
      } finally {
        setPendingGameId(null)
      }
    })
  }

  const filteredPatches = patches.filter(p => {
    if (filter === 'your_patches') return yourGameIds.has(p.game.id)
    if (filter === 'high_impact') return p.impact_score >= 8
    if (filter === 'recent') {
      const hourAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return new Date(p.published_at) > hourAgo
    }
    return true
  })

  const filters: { id: FilterType; label: string; count?: number }[] = [
    { id: 'all', label: 'All', count: patches.length },
    { id: 'your_patches', label: 'Your Patches', count: patches.filter(p => yourGameIds.has(p.game.id)).length },
    { id: 'high_impact', label: 'Major', count: patches.filter(p => p.impact_score >= 8).length },
    { id: 'recent', label: 'Last 24h', count: patches.filter(p => new Date(p.published_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length },
  ]

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              filter === f.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-white/5 text-muted-foreground hover:bg-white/10'
            }`}
          >
            {f.label}
            {f.count !== undefined && f.count > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({f.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Patches List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {filteredPatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-cyan-500/50" />
            </div>
            <p className="text-lg font-medium">No patches found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter !== 'all' ? 'Try a different filter' : 'Check back later for updates'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="mt-4 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20"
              >
                View all patches
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredPatches.map(patch => (
              <PatchHoverPreview
                key={patch.id}
                patch={{
                  title: patch.title,
                  gameName: patch.game.name,
                  impactScore: patch.impact_score,
                  summary: patch.summary_tldr,
                  publishedAt: patch.published_at,
                }}
              >
                <Link
                  href={`/patches/${patch.id}`}
                  data-keyboard-nav
                  className="group flex gap-4 p-4 hover:bg-white/5 transition-colors"
                >
                {/* Game Cover */}
                <div className="flex-shrink-0">
                  {patch.game.cover_url ? (
                    <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-zinc-800 ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
                      <Image
                        src={patch.game.cover_url}
                        alt={patch.game.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-20 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center ring-1 ring-white/10">
                      <FileText className="w-6 h-6 text-cyan-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-base font-semibold line-clamp-1">
                          {patch.title}
                        </p>
                        {patch.impact_score >= 8 && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-red-500/20 text-red-400">
                            <Flame className="w-2.5 h-2.5 fill-red-400" />
                            Major
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/games/${patch.game.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-muted-foreground hover:text-foreground mt-0.5 inline-block"
                      >
                        {patch.game.name}
                      </Link>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-lg border ${getImpactBg(patch.impact_score)} ${getImpactColor(patch.impact_score)}`}>
                      {patch.impact_score}/10
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">
                      {getRelativeTime(patch.published_at)}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Follow Button */}
                      {followedIds.has(patch.game.id) ? (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-green-500/20 text-green-400 border border-green-500/30">
                          <Check className="w-3 h-3" />
                          Following
                        </span>
                      ) : (
                        <button
                          onClick={(e) => handleFollow(patch.game.id, e)}
                          disabled={isPending && pendingGameId === patch.game.id}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 active:scale-95 transition-all disabled:opacity-50"
                        >
                          {isPending && pendingGameId === patch.game.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Plus className="w-3 h-3" />
                          )}
                          Follow
                        </button>
                      )}
                      <span className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        View details
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              </PatchHoverPreview>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
