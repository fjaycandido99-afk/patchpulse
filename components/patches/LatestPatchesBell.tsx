'use client'

import { useState, useEffect } from 'react'
import { Gamepad2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type LatestPatchesStats = {
  total_today: number
  high_impact_count: number
}

type Props = {
  initialStats?: LatestPatchesStats
  size?: 'sm' | 'md'
}

export function LatestPatchesBell({ initialStats, size = 'md' }: Props) {
  const [stats, setStats] = useState<LatestPatchesStats>(
    initialStats || { total_today: 0, high_impact_count: 0 }
  )

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to patch_notes changes
    const channel = supabase
      .channel('patches-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'patch_notes',
        },
        async () => {
          // Refetch stats when new patch is added
          await fetchStats()
        }
      )
      .subscribe()

    async function fetchStats() {
      try {
        const res = await fetch('/api/patches/discover?stats=true')
        const data = await res.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch patch stats:', error)
      }
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const hasPatches = stats.total_today > 0
  const hasHighImpact = stats.high_impact_count > 0

  return (
    <Link
      href="/patches"
      className="relative p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-white/10 active:bg-white/20 active:scale-95 transition-all touch-manipulation group"
      title="Discover Patches (games you don't follow)"
      aria-label={`Discover patches from other games${hasPatches ? ` (${stats.total_today} today)` : ''}`}
    >
      {/* Pulsing halo effect when there are high impact patches */}
      {hasHighImpact && (
        <span className="absolute inset-0 rounded-xl bg-cyan-500/20 animate-ping-slow opacity-75" />
      )}

      {/* Subtle glow ring on hover */}
      <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300" />

      <Gamepad2 className={`relative h-5 w-5 transition-colors duration-200 ${
        hasPatches ? 'text-cyan-400' : 'text-muted-foreground'
      }`} />

      {/* Badge showing today's count */}
      {hasPatches && (
        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
          <span className={`absolute w-4 h-4 rounded-full ${hasHighImpact ? 'bg-red-500 animate-ping' : 'bg-cyan-500'} opacity-75`} />
          <span className={`relative w-4 h-4 rounded-full ${hasHighImpact ? 'bg-red-500' : 'bg-cyan-500'} flex items-center justify-center text-[9px] font-bold text-white`}>
            {stats.total_today > 9 ? '9+' : stats.total_today}
          </span>
        </span>
      )}
    </Link>
  )
}
