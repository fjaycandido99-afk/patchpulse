'use client'

import { Trophy, Sword, Target, Star, TrendingUp } from 'lucide-react'

type RiotMetadata = {
  gameName?: string
  tagLine?: string
  lol?: {
    summonerLevel: number
    profileIconId: number
    rankedSolo?: {
      tier: string
      rank: string
      leaguePoints: number
      wins: number
      losses: number
    }
    rankedFlex?: {
      tier: string
      rank: string
      leaguePoints: number
      wins: number
      losses: number
    }
    topChampions?: Array<{
      championId: number
      championName: string
      masteryLevel: number
      masteryPoints: number
    }>
  }
  valorant?: {
    currentTier: number
    currentTierName: string
    ranking: number
    gamesPlayed: number
    wins: number
  }
}

type Props = {
  metadata: RiotMetadata | null
}

// LoL tier colors
const LOL_TIER_COLORS: Record<string, string> = {
  IRON: 'text-gray-400',
  BRONZE: 'text-amber-600',
  SILVER: 'text-gray-300',
  GOLD: 'text-yellow-400',
  PLATINUM: 'text-cyan-400',
  EMERALD: 'text-emerald-400',
  DIAMOND: 'text-blue-400',
  MASTER: 'text-purple-400',
  GRANDMASTER: 'text-red-400',
  CHALLENGER: 'text-amber-300',
}

// Valorant tier colors
const VAL_TIER_COLORS: Record<string, string> = {
  'Unranked': 'text-gray-400',
  'Iron': 'text-gray-400',
  'Bronze': 'text-amber-600',
  'Silver': 'text-gray-300',
  'Gold': 'text-yellow-400',
  'Platinum': 'text-cyan-400',
  'Diamond': 'text-blue-400',
  'Ascendant': 'text-emerald-400',
  'Immortal': 'text-red-400',
  'Radiant': 'text-amber-300',
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function getWinRate(wins: number, losses: number): number {
  const total = wins + losses
  if (total === 0) return 0
  return Math.round((wins / total) * 100)
}

export function RiotStatsDisplay({ metadata }: Props) {
  if (!metadata) return null

  const { lol, valorant } = metadata
  const hasStats = lol || valorant

  if (!hasStats) {
    return (
      <div className="text-xs text-muted-foreground text-center py-2">
        No game stats found. Play some games to see your stats!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* League of Legends */}
      {lol && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sword className="h-3.5 w-3.5 text-yellow-500" />
            <span className="text-xs font-medium">League of Legends</span>
            <span className="text-[10px] text-muted-foreground">Lvl {lol.summonerLevel}</span>
          </div>

          {/* Ranked Info */}
          <div className="flex flex-wrap gap-2">
            {lol.rankedSolo && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5">
                <Trophy className="h-3 w-3 text-yellow-500" />
                <span className={`text-xs font-medium ${LOL_TIER_COLORS[lol.rankedSolo.tier] || 'text-foreground'}`}>
                  {lol.rankedSolo.tier} {lol.rankedSolo.rank}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {lol.rankedSolo.leaguePoints} LP
                </span>
                <span className="text-[10px] text-muted-foreground">
                  ({getWinRate(lol.rankedSolo.wins, lol.rankedSolo.losses)}% WR)
                </span>
              </div>
            )}
            {lol.rankedFlex && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5">
                <span className="text-[10px] text-muted-foreground">Flex:</span>
                <span className={`text-xs font-medium ${LOL_TIER_COLORS[lol.rankedFlex.tier] || 'text-foreground'}`}>
                  {lol.rankedFlex.tier} {lol.rankedFlex.rank}
                </span>
              </div>
            )}
            {!lol.rankedSolo && !lol.rankedFlex && (
              <span className="text-xs text-muted-foreground">Unranked</span>
            )}
          </div>

          {/* Top Champions */}
          {lol.topChampions && lol.topChampions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {lol.topChampions.slice(0, 3).map((champ) => (
                <div
                  key={champ.championId}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400"
                >
                  <Star className="h-2.5 w-2.5" />
                  <span className="text-[10px] font-medium">{champ.championName}</span>
                  <span className="text-[10px] opacity-70">M{champ.masteryLevel}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Valorant */}
      {valorant && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-red-500" />
            <span className="text-xs font-medium">Valorant</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5">
              <TrendingUp className="h-3 w-3 text-red-500" />
              <span className={`text-xs font-medium ${VAL_TIER_COLORS[valorant.currentTierName.split(' ')[0]] || 'text-foreground'}`}>
                {valorant.currentTierName}
              </span>
              {valorant.ranking > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  {valorant.ranking} RR
                </span>
              )}
            </div>
            {valorant.gamesPlayed > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5">
                <span className="text-[10px] text-muted-foreground">
                  {valorant.wins}W / {valorant.gamesPlayed}G
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
