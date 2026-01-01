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
  spotlight: GameHealth | null
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
                        unoptimized
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

  // Get spotlight state label
  const getSpotlightLabel = () => {
    if (!data.spotlight) return null
    if (data.spotlight.state === 'resurfacing') return 'Waking Up'
    if (data.spotlight.state === 'active') return 'Active'
    return null
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Spotlight Header with Background Image */}
      {data.spotlight?.cover_url ? (
        <Link
          href={`/backlog/${data.spotlight.id}`}
          className="relative block h-32 sm:h-40 group"
        >
          {/* Background Image - Clear, no blur */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={data.spotlight.cover_url}
              alt={data.spotlight.name}
              fill
              className="object-cover scale-105 group-hover:scale-100 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              unoptimized
            />
          </div>

          {/* Dark Gradient Overlay - Lighter for clearer image */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-card/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-card/40 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end">
            <div className="flex items-end gap-4">
              {/* Game Cover Thumbnail */}
              <div className="relative w-16 h-20 sm:w-20 sm:h-26 rounded-lg overflow-hidden ring-2 ring-white/20 shadow-2xl flex-shrink-0 group-hover:ring-primary/50 transition-all">
                <Image
                  src={data.spotlight.cover_url}
                  alt={data.spotlight.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized
                />
                {/* State Badge */}
                {getSpotlightLabel() && (
                  <div className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold shadow-lg ${
                    data.spotlight.state === 'resurfacing'
                      ? 'bg-amber-500 text-black'
                      : 'bg-green-500 text-black'
                  }`}>
                    {getSpotlightLabel()}
                  </div>
                )}
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/60 mb-1">Spotlight</p>
                <h3 className="font-bold text-lg sm:text-xl text-white truncate group-hover:text-primary transition-colors">
                  {data.spotlight.name}
                </h3>
                <p className="text-sm text-white/70 truncate">{data.spotlight.reason}</p>
              </div>
            </div>
          </div>

          {/* Subtle animated grain overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC40Ii8+PC9zdmc+')]" />
        </Link>
      ) : (
        /* Fallback Header without Spotlight */
        <div className="p-4 sm:p-6 pb-0">
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
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 sm:p-6 pt-4">
        {/* Show header info if spotlight exists (moved below) */}
        {data.spotlight?.cover_url && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Backlog Health</h3>
              <p className="text-xs text-muted-foreground">
                {data.total} games tracked
              </p>
            </div>
          </div>
        )}

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
    </div>
  )
}
