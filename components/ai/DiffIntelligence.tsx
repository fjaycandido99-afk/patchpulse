'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, TrendingUp, TrendingDown, Sparkles, Bug, Gamepad2, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type DiffStats = {
  buffs: number
  nerfs: number
  new_systems: number
  bug_fixes: number
  ignore_safe: boolean
}

type PatchWithDiff = {
  id: string
  title: string
  published_at: string
  impact_score: number
  summary_tldr: string | null
  ai_insight: string | null
  diff_stats: DiffStats | null
  game: {
    id: string
    name: string
    slug: string
    cover_url: string | null
  }
}

type DiffIntelligenceData = {
  patches: PatchWithDiff[]
  summary: {
    total_buffs: number
    total_nerfs: number
    total_new_systems: number
    total_bug_fixes: number
    patches_safe_to_skip: number
    must_play_patches: number
  }
  message: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
}

export function DiffIntelligence({ isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DiffIntelligenceData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/diff-intelligence')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get diff intelligence')
      }

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getImpactColor = (score: number) => {
    if (score >= 7) return 'text-red-400 bg-red-500/20'
    if (score >= 4) return 'text-amber-400 bg-amber-500/20'
    return 'text-zinc-400 bg-zinc-500/20'
  }

  const getImpactLabel = (score: number) => {
    if (score >= 7) return 'Must-Play'
    if (score >= 4) return 'Notable'
    return 'Minor'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card">
          <div>
            <h2 className="text-lg font-semibold">Diff Intelligence</h2>
            <p className="text-sm text-muted-foreground">Patch analysis for your games</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-2xl font-bold text-green-400">{data.summary.total_buffs}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Buffs</p>
                </div>
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-2xl font-bold text-red-400">{data.summary.total_nerfs}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Nerfs</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-2xl font-bold text-blue-400">{data.summary.total_new_systems}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">New Features</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Bug className="w-4 h-4 text-amber-400" />
                    <span className="text-2xl font-bold text-amber-400">{data.summary.total_bug_fixes}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Bug Fixes</p>
                </div>
              </div>

              {/* Quick Insights */}
              <div className="flex flex-wrap gap-2">
                {data.summary.must_play_patches > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 text-sm">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {data.summary.must_play_patches} must-play patch{data.summary.must_play_patches > 1 ? 'es' : ''}
                  </div>
                )}
                {data.summary.patches_safe_to_skip > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {data.summary.patches_safe_to_skip} safe to skip
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
                <p className="text-sm">{data.message}</p>
              </div>

              {/* Patches List */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Recent Patches</h3>
                {data.patches.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No recent patches for your games.
                  </p>
                ) : (
                  data.patches.map((patch) => (
                    <Link
                      key={patch.id}
                      href={`/patches/${patch.id}`}
                      className="block rounded-xl border border-border hover:border-primary/30 transition-colors overflow-hidden"
                    >
                      <div className="flex gap-3 p-3">
                        {/* Game Cover */}
                        <div className="relative flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden bg-zinc-800 ring-1 ring-white/10">
                          {patch.game.cover_url ? (
                            <Image
                              src={patch.game.cover_url}
                              alt={patch.game.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                              <Gamepad2 className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">{patch.game.name}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{formatDate(patch.published_at)}</span>
                            <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium ${getImpactColor(patch.impact_score)}`}>
                              {getImpactLabel(patch.impact_score)}
                            </span>
                          </div>

                          <p className="font-medium text-sm line-clamp-1">{patch.title}</p>

                          {patch.summary_tldr && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{patch.summary_tldr}</p>
                          )}

                          {/* Diff Stats */}
                          {patch.diff_stats && (
                            <div className="flex items-center gap-3 mt-2">
                              {patch.diff_stats.buffs > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs text-green-400">
                                  <TrendingUp className="w-3 h-3" />
                                  {patch.diff_stats.buffs}
                                </span>
                              )}
                              {patch.diff_stats.nerfs > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs text-red-400">
                                  <TrendingDown className="w-3 h-3" />
                                  {patch.diff_stats.nerfs}
                                </span>
                              )}
                              {patch.diff_stats.new_systems > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs text-blue-400">
                                  <Sparkles className="w-3 h-3" />
                                  {patch.diff_stats.new_systems}
                                </span>
                              )}
                              {patch.diff_stats.bug_fixes > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                                  <Bug className="w-3 h-3" />
                                  {patch.diff_stats.bug_fixes}
                                </span>
                              )}
                              {patch.diff_stats.ignore_safe && (
                                <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                                  <CheckCircle className="w-3 h-3" />
                                  Skip OK
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
