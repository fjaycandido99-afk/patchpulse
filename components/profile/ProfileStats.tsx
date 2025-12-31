'use client'

import { useState } from 'react'
import { Gamepad2, Clock, Layers, Trophy, BookOpen, Pause, ChevronDown, ChevronUp, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type Game = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  status?: 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped'
  progress?: number
  playtime_minutes?: number
}

type ProfileStatsProps = {
  followedCount: number
  backlogCount: number
  playingCount: number
  completedCount: number
  pausedCount: number
  totalPlaytime: number
  followedGames?: Game[]
  backlogGames?: Game[]
  playtimeGames?: Game[]
}

type ExpandedSection = 'following' | 'backlog' | 'playing' | 'completed' | 'playtime' | null

export function ProfileStats({
  followedCount,
  backlogCount,
  playingCount,
  completedCount,
  pausedCount,
  totalPlaytime,
  followedGames = [],
  backlogGames = [],
  playtimeGames = [],
}: ProfileStatsProps) {
  const [expanded, setExpanded] = useState<ExpandedSection>(null)
  const playtimeHours = Math.round(totalPlaytime / 60)

  const toggleSection = (section: ExpandedSection) => {
    setExpanded(expanded === section ? null : section)
  }

  // Filter backlog games by status
  const playingGames = backlogGames.filter(g => g.status === 'playing')
  const completedGames = backlogGames.filter(g => g.status === 'finished')

  // Primary stats (always visible in grid)
  const primaryStats = [
    {
      id: 'following' as const,
      label: 'Following',
      value: followedCount,
      icon: Gamepad2,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      hoverBg: 'hover:bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      games: followedGames,
    },
    {
      id: 'backlog' as const,
      label: 'In Backlog',
      value: backlogCount,
      icon: BookOpen,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      hoverBg: 'hover:bg-amber-500/20',
      borderColor: 'border-amber-500/30',
      games: backlogGames,
    },
    {
      id: 'playing' as const,
      label: 'Playing',
      value: playingCount,
      icon: Layers,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      hoverBg: 'hover:bg-green-500/20',
      borderColor: 'border-green-500/30',
      games: playingGames,
    },
    {
      id: 'completed' as const,
      label: 'Completed',
      value: completedCount,
      icon: Trophy,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      hoverBg: 'hover:bg-purple-500/20',
      borderColor: 'border-purple-500/30',
      games: completedGames,
    },
  ]

  const renderGameGrid = (games: Game[], showPlaytime = false, showProgress = false) => {
    if (games.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Gamepad2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No games yet</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-3 gap-3">
        {games.slice(0, 6).map((game) => (
          <Link
            key={game.id}
            href={`/games/${game.slug}`}
            className="group relative"
          >
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted ring-1 ring-white/10 group-hover:ring-white/30 transition-all">
              {game.cover_url ? (
                <Image
                  src={game.cover_url}
                  alt={game.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 33vw, 120px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                  <Gamepad2 className="w-6 h-6 text-muted-foreground" />
                </div>
              )}

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Status badge */}
              {game.status && (
                <div className="absolute top-1.5 left-1.5">
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded ${
                    game.status === 'playing' ? 'bg-green-500/90 text-white' :
                    game.status === 'finished' ? 'bg-purple-500/90 text-white' :
                    game.status === 'paused' ? 'bg-zinc-500/90 text-white' :
                    'bg-amber-500/90 text-white'
                  }`}>
                    {game.status === 'finished' ? 'Done' : game.status}
                  </span>
                </div>
              )}

              {/* Progress bar */}
              {showProgress && game.progress !== undefined && game.progress > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${game.progress}%` }}
                  />
                </div>
              )}

              {/* Playtime */}
              {showPlaytime && game.playtime_minutes !== undefined && game.playtime_minutes > 0 && (
                <div className="absolute bottom-1.5 right-1.5">
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-black/70 text-white rounded flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {Math.round(game.playtime_minutes / 60)}h
                  </span>
                </div>
              )}
            </div>

            {/* Game name */}
            <p className="mt-1.5 text-xs font-medium text-center line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {game.name}
            </p>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-4">Gaming Stats</h3>

      {/* Primary stats - responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {primaryStats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => stat.games.length > 0 && toggleSection(stat.id)}
            disabled={stat.games.length === 0}
            className={`rounded-xl ${stat.bgColor} ${stat.games.length > 0 ? stat.hoverBg + ' cursor-pointer' : 'cursor-default'} p-3 sm:p-4 text-center transition-all active:scale-[0.98] relative group ${
              expanded === stat.id ? `ring-2 ${stat.borderColor}` : ''
            }`}
          >
            <stat.icon className={`h-5 w-5 mx-auto mb-1.5 ${stat.color}`} />
            <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{stat.label}</p>

            {/* Expand indicator */}
            {stat.games.length > 0 && (
              <div className={`absolute bottom-1 right-1 ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                {expanded === stat.id ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Expanded game grid for primary stats */}
      {expanded && expanded !== 'playtime' && (
        <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">
              {primaryStats.find(s => s.id === expanded)?.label} ({primaryStats.find(s => s.id === expanded)?.games.length})
            </h4>
            <button
              onClick={() => setExpanded(null)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          {renderGameGrid(
            primaryStats.find(s => s.id === expanded)?.games || [],
            false,
            expanded === 'playing' || expanded === 'backlog'
          )}
          {(primaryStats.find(s => s.id === expanded)?.games.length || 0) > 6 && (
            <Link
              href={expanded === 'following' ? '/backlog' : '/backlog'}
              className="mt-3 text-xs text-primary hover:underline flex items-center justify-center gap-1"
            >
              View all {primaryStats.find(s => s.id === expanded)?.games.length} games
            </Link>
          )}
        </div>
      )}

      {/* Secondary stats - horizontal scroll on mobile, inline on desktop */}
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 scrollbar-hide">
        {/* Paused stat */}
        <div
          className="flex-shrink-0 sm:flex-1 rounded-xl bg-zinc-500/10 p-3 flex items-center gap-3 min-w-[140px] sm:min-w-0"
        >
          <div className="w-10 h-10 rounded-lg bg-zinc-500/10 flex items-center justify-center">
            <Pause className="h-5 w-5 text-zinc-400" />
          </div>
          <div>
            <p className="text-lg font-bold">{pausedCount}</p>
            <p className="text-xs text-muted-foreground">Paused</p>
          </div>
        </div>

        {/* Playtime stat - clickable */}
        <button
          onClick={() => playtimeGames.length > 0 && toggleSection('playtime')}
          disabled={playtimeGames.length === 0}
          className={`flex-shrink-0 sm:flex-1 rounded-xl bg-cyan-500/10 ${playtimeGames.length > 0 ? 'hover:bg-cyan-500/20 cursor-pointer' : 'cursor-default'} p-3 flex items-center gap-3 min-w-[140px] sm:min-w-0 transition-all active:scale-[0.98] ${
            expanded === 'playtime' ? 'ring-2 border-cyan-500/30' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
            <Clock className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="text-left">
            <p className="text-lg font-bold">{playtimeHours}h</p>
            <p className="text-xs text-muted-foreground">Playtime</p>
          </div>
          {playtimeGames.length > 0 && (
            <div className="ml-auto text-cyan-400">
              {expanded === 'playtime' ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          )}
        </button>
      </div>

      {/* Expanded playtime games */}
      {expanded === 'playtime' && (
        <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">Games with Playtime ({playtimeGames.length})</h4>
            <button
              onClick={() => setExpanded(null)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          {renderGameGrid(playtimeGames, true, false)}
        </div>
      )}
    </section>
  )
}
