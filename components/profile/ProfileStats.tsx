import { Gamepad2, Clock, Layers, Trophy, BookOpen, Pause } from 'lucide-react'

type ProfileStatsProps = {
  followedCount: number
  backlogCount: number
  playingCount: number
  completedCount: number
  pausedCount: number
  totalPlaytime: number
}

export function ProfileStats({
  followedCount,
  backlogCount,
  playingCount,
  completedCount,
  pausedCount,
  totalPlaytime,
}: ProfileStatsProps) {
  const playtimeHours = Math.round(totalPlaytime / 60)

  // Primary stats (always visible in grid)
  const primaryStats = [
    {
      label: 'Following',
      value: followedCount,
      icon: Gamepad2,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'In Backlog',
      value: backlogCount,
      icon: BookOpen,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Playing',
      value: playingCount,
      icon: Layers,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Completed',
      value: completedCount,
      icon: Trophy,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ]

  // Secondary stats (horizontal scroll on mobile)
  const secondaryStats = [
    {
      label: 'Paused',
      value: pausedCount,
      icon: Pause,
      color: 'text-zinc-400',
      bgColor: 'bg-zinc-500/10',
    },
    {
      label: 'Playtime',
      value: `${playtimeHours}h`,
      icon: Clock,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
  ]

  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-4">Gaming Stats</h3>

      {/* Primary stats - responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {primaryStats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-lg ${stat.bgColor} p-3 sm:p-4 text-center`}
          >
            <stat.icon className={`h-5 w-5 mx-auto mb-1.5 ${stat.color}`} />
            <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Secondary stats - horizontal scroll on mobile, inline on desktop */}
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 scrollbar-hide">
        {secondaryStats.map((stat) => (
          <div
            key={stat.label}
            className={`flex-shrink-0 sm:flex-1 rounded-lg ${stat.bgColor} p-3 flex items-center gap-3 min-w-[140px] sm:min-w-0`}
          >
            <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
