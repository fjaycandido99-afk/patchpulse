'use client'

import { useState, useEffect } from 'react'
import { Activity, Moon, Sunrise, Loader2, ChevronDown, ChevronUp, Gamepad2, Zap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type GameHealth = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  state: 'active' | 'dormant' | 'resurfacing'
  reason: string
  days_since_update: number | null
}

type BacklogHealthData = {
  active: { count: number; games: GameHealth[] }
  dormant: { count: number; games: GameHealth[] }
  resurfacing: { count: number; games: GameHealth[] }
  message: string
  total: number
}

const STATE_CONFIG = {
  active: {
    icon: Zap,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    gradient: 'from-green-500/10 to-green-500/5',
    label: 'Active',
    description: 'Recent updates — good time to jump in',
  },
  dormant: {
    icon: Moon,
    color: 'text-zinc-400',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/30',
    gradient: 'from-zinc-500/10 to-zinc-500/5',
    label: 'Dormant',
    description: 'Safe to ignore for now',
  },
  resurfacing: {
    icon: Sunrise,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    gradient: 'from-amber-500/10 to-amber-500/5',
    label: 'Resurfacing',
    description: 'Worth revisiting',
  },
}

type StateKey = keyof typeof STATE_CONFIG

export function BacklogHealth() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<BacklogHealthData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedState, setExpandedState] = useState<StateKey | null>(null)

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

  const toggleState = (state: StateKey) => {
    setExpandedState(expandedState === state ? null : state)
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

  const renderStateCard = (stateKey: StateKey) => {
    const config = STATE_CONFIG[stateKey]
    const stateData = data[stateKey]
    const Icon = config.icon
    const isExpanded = expandedState === stateKey
    const hasGames = stateData.count > 0

    return (
      <div key={stateKey} className="space-y-2">
        <button
          onClick={() => hasGames && toggleState(stateKey)}
          disabled={!hasGames}
          className={`w-full p-4 rounded-xl border transition-all text-left ${config.border} bg-gradient-to-br ${config.gradient} ${
            hasGames ? 'hover:border-opacity-60 cursor-pointer' : 'opacity-60 cursor-default'
          } ${isExpanded ? 'ring-2 ring-offset-2 ring-offset-background ring-primary/30' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${config.color}`}>{stateData.count}</span>
                  <span className="font-medium">{config.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{config.description}</p>
              </div>
            </div>
            {hasGames && (
              isExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )
            )}
          </div>
        </button>

        {/* Expanded Game List */}
        {isExpanded && stateData.games.length > 0 && (
          <div className={`rounded-xl border ${config.border} overflow-hidden`}>
            <div className="divide-y divide-border">
              {stateData.games.map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.slug}`}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors group"
                >
                  <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 ring-1 ring-white/10">
                    {game.cover_url ? (
                      <Image
                        src={game.cover_url}
                        alt={game.name}
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
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {game.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{game.reason}</p>
                  </div>
                  {game.days_since_update !== null && (
                    <div className="text-xs text-muted-foreground flex-shrink-0">
                      {game.days_since_update === 0 ? 'Today' :
                       game.days_since_update === 1 ? '1d ago' :
                       `${game.days_since_update}d ago`}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Activity className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="font-semibold">Backlog Health</h3>
          <p className="text-sm text-muted-foreground">
            {data.total} games tracked
          </p>
        </div>
      </div>

      {/* Dynamic Message */}
      {data.message && (
        <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 mb-4">
          <p className="text-sm">{data.message}</p>
        </div>
      )}

      {/* State Cards */}
      <div className="space-y-3">
        {/* Show Resurfacing first if there are any (most actionable) */}
        {data.resurfacing.count > 0 && renderStateCard('resurfacing')}
        {renderStateCard('active')}
        {renderStateCard('dormant')}
      </div>
    </div>
  )
}
