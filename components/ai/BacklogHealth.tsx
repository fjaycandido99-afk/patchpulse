'use client'

import { useState, useEffect } from 'react'
import { Activity, Moon, Flame, Eye, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type BacklogHealthData = {
  active: { count: number; games: GameSummary[] }
  dormant: { count: number; games: GameSummary[] }
  resurfacing: { count: number; games: GameSummary[] }
  insight: string
}

type GameSummary = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  momentum: 'rising' | 'stable' | 'cooling'
  reason?: string
}

const MOMENTUM_CONFIG = {
  rising: { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Rising' },
  stable: { icon: Minus, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Stable' },
  cooling: { icon: TrendingDown, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Cooling' },
}

export function BacklogHealth() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<BacklogHealthData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHealth()
  }, [])

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/ai/backlog-health')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get backlog health')
      }

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Activity className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="font-semibold">Backlog Health</h3>
          <p className="text-sm text-muted-foreground">Your games at a glance</p>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-green-400" />
            <span className="text-2xl font-bold text-green-400">{data.active.count}</span>
          </div>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>

        <div className="p-3 rounded-lg bg-gradient-to-br from-zinc-500/10 to-zinc-500/5 border border-zinc-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Moon className="w-4 h-4 text-zinc-400" />
            <span className="text-2xl font-bold text-zinc-400">{data.dormant.count}</span>
          </div>
          <p className="text-xs text-muted-foreground">Dormant</p>
        </div>

        <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-4 h-4 text-amber-400" />
            <span className="text-2xl font-bold text-amber-400">{data.resurfacing.count}</span>
          </div>
          <p className="text-xs text-muted-foreground">Resurfacing</p>
        </div>
      </div>

      {/* AI Insight */}
      {data.insight && (
        <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 mb-4">
          <p className="text-sm">{data.insight}</p>
        </div>
      )}

      {/* Resurfacing Games */}
      {data.resurfacing.games.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Worth Checking
          </h4>
          <div className="space-y-2">
            {data.resurfacing.games.slice(0, 3).map((game) => {
              const config = MOMENTUM_CONFIG[game.momentum]
              const MomentumIcon = config.icon

              return (
                <Link
                  key={game.id}
                  href={`/games/${game.slug}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="relative w-10 h-12 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
                    {game.cover_url ? (
                      <Image
                        src={game.cover_url}
                        alt={game.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                        {game.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {game.name}
                    </p>
                    {game.reason && (
                      <p className="text-xs text-muted-foreground truncate">{game.reason}</p>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.bg} ${config.color}`}>
                    <MomentumIcon className="w-3 h-3" />
                    <span>{config.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
