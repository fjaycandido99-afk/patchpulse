'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { relativeDaysText } from '@/lib/dates'

type SteamStatsData = {
  playtime_minutes: number | null
  last_played_at: string | null
}

type SteamStatsProps = {
  steamAppId?: number | null
  steamStats?: SteamStatsData | null
  showPlayerCount?: boolean
  layout?: 'inline' | 'stacked'
}

function formatPlaytime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} mins`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours < 100) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hours`
  }
  return `${hours} hours`
}

function formatLastPlayed(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  // Format as date for older
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Simple client-side cache for player counts
const playerCountCache = new Map<number, { count: string; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function SteamStats({
  steamAppId,
  steamStats,
  showPlayerCount = true,
  layout = 'stacked'
}: SteamStatsProps) {
  const [playerCount, setPlayerCount] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!showPlayerCount || !steamAppId) return

    // Check cache first
    const cached = playerCountCache.get(steamAppId)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setPlayerCount(cached.count)
      return
    }

    const fetchPlayerCount = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/steam/player-counts?appIds=${steamAppId}`)
        if (response.ok) {
          const data = await response.json()
          const count = data[steamAppId.toString()]?.formatted
          if (count) {
            playerCountCache.set(steamAppId, { count, timestamp: Date.now() })
            setPlayerCount(count)
          }
        }
      } catch (error) {
        console.error('Failed to fetch player count:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayerCount()
  }, [steamAppId, showPlayerCount])

  const hasPlaytime = steamStats?.playtime_minutes && steamStats.playtime_minutes > 0
  const hasLastPlayed = steamStats?.last_played_at
  const hasAnyData = hasPlaytime || hasLastPlayed || playerCount

  if (!hasAnyData && !isLoading) {
    return null
  }

  // Steam-style stacked layout
  if (layout === 'stacked') {
    return (
      <div className="space-y-0.5 text-sm">
        {hasPlaytime && (
          <div className="flex items-baseline gap-2">
            <span className="text-muted-foreground text-xs uppercase tracking-wide">Playtime</span>
            <span className="text-foreground font-medium">
              {formatPlaytime(steamStats!.playtime_minutes!)}
            </span>
          </div>
        )}
        {hasLastPlayed && (
          <div className="flex items-baseline gap-2">
            <span className="text-muted-foreground text-xs uppercase tracking-wide">Last played</span>
            <span className="text-foreground/80">
              {formatLastPlayed(steamStats!.last_played_at!)}
            </span>
          </div>
        )}
        {showPlayerCount && playerCount && (
          <div className="flex items-center gap-2 pt-0.5">
            <Users className="h-3 w-3 text-emerald-400" />
            <span className="text-emerald-400 font-medium">{playerCount}</span>
            <span className="text-muted-foreground text-xs">playing now</span>
          </div>
        )}
        {showPlayerCount && isLoading && (
          <div className="flex items-center gap-2 pt-0.5">
            <Users className="h-3 w-3 text-muted-foreground/50 animate-pulse" />
            <span className="text-muted-foreground/50 text-xs">Loading...</span>
          </div>
        )}
      </div>
    )
  }

  // Inline compact layout (for smaller cards)
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
      {hasPlaytime && (
        <span>{formatPlaytime(steamStats!.playtime_minutes!)}</span>
      )}
      {hasLastPlayed && (
        <span>{relativeDaysText(steamStats!.last_played_at!)}</span>
      )}
      {showPlayerCount && playerCount && (
        <span className="flex items-center gap-1 text-emerald-400">
          <Users className="h-3 w-3" />
          {playerCount}
        </span>
      )}
    </div>
  )
}

// Batch fetcher for multiple games at once
export function useSteamPlayerCounts(steamAppIds: number[]) {
  const [counts, setCounts] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (steamAppIds.length === 0) return

    // Filter out cached ones
    const uncachedIds = steamAppIds.filter((id) => {
      const cached = playerCountCache.get(id)
      return !cached || Date.now() - cached.timestamp >= CACHE_TTL
    })

    // Set cached values immediately
    const initialCounts: Record<string, string> = {}
    for (const id of steamAppIds) {
      const cached = playerCountCache.get(id)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        initialCounts[id.toString()] = cached.count
      }
    }
    if (Object.keys(initialCounts).length > 0) {
      setCounts(initialCounts)
    }

    if (uncachedIds.length === 0) return

    const fetchCounts = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/steam/player-counts?appIds=${uncachedIds.join(',')}`)
        if (response.ok) {
          const data = await response.json()
          const newCounts: Record<string, string> = { ...initialCounts }
          for (const [appId, info] of Object.entries(data)) {
            if (info && typeof info === 'object' && 'formatted' in info) {
              const formatted = (info as { formatted: string }).formatted
              newCounts[appId] = formatted
              playerCountCache.set(parseInt(appId), { count: formatted, timestamp: Date.now() })
            }
          }
          setCounts(newCounts)
        }
      } catch (error) {
        console.error('Failed to fetch player counts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCounts()
  }, [steamAppIds.join(',')])

  return { counts, isLoading }
}
