'use client'

import { useEffect, useState, useRef } from 'react'
import { Trophy, Sparkles } from 'lucide-react'
import Image from 'next/image'

type Achievement = {
  id: string
  name: string
  description: string | null
  icon: string
  percent: number
  unlocked?: boolean
  unlockTime?: number
}

type GlobalAchievementsProps = {
  steamAppId: number
}

type AchievementsData = {
  achievements: Achievement[]
  totalCount: number
  unlockedCount: number | null
  isUserData: boolean
}

export function GlobalAchievements({ steamAppId }: GlobalAchievementsProps) {
  const [data, setData] = useState<AchievementsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch(`/api/steam/achievements?appId=${steamAppId}`)
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch achievements:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAchievements()
  }, [steamAppId])

  const achievements = data?.achievements || []

  // Auto-cycle through achievements
  useEffect(() => {
    if (achievements.length <= 5) return

    intervalRef.current = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % (achievements.length - 4))
        setIsAnimating(false)
      }, 300)
    }, 3000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [achievements.length])

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Trophy className="h-4 w-4 text-amber-400 animate-pulse" />
          </div>
          <span className="text-sm font-medium">Loading achievements...</span>
        </div>
      </div>
    )
  }

  if (achievements.length === 0) {
    return null
  }

  // Get 5 achievements starting from current index
  const displayAchievements = achievements.slice(currentIndex, currentIndex + 5)
  // If we're near the end, wrap around
  if (displayAchievements.length < 5) {
    displayAchievements.push(...achievements.slice(0, 5 - displayAchievements.length))
  }

  const isUserAchievements = data?.isUserData || false
  const totalCount = data?.totalCount || achievements.length
  const completionPercent = isUserAchievements ? Math.round((achievements.length / totalCount) * 100) : 0
  const rarest = achievements[achievements.length - 1]

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header with progress */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-3">
          {/* Trophy with completion ring */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-amber-400" />
            </div>
            {isUserAchievements && (
              <svg className="absolute inset-0 w-10 h-10 -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-amber-500/20"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${completionPercent * 1.13} 113`}
                  className="text-amber-400"
                />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{isUserAchievements ? 'Your Achievements' : 'Achievements'}</h3>
              {isUserAchievements && completionPercent === 100 && (
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {isUserAchievements ? `${achievements.length} of ${totalCount}` : `${totalCount} total`}
              </span>
              {isUserAchievements && (
                <span className="text-xs font-medium text-amber-400">{completionPercent}%</span>
              )}
            </div>
          </div>

          {/* Progress dots */}
          {achievements.length > 5 && (
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, Math.ceil(achievements.length / 5)) }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    Math.floor(currentIndex / 5) % Math.ceil(achievements.length / 5) === i
                      ? 'bg-amber-400'
                      : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Progress bar */}
        {isUserAchievements && (
          <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Achievement list */}
      <div className={`px-4 pb-4 space-y-1 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        {displayAchievements.map((achievement, index) => {
          const rarity = getRarity(achievement.percent)
          return (
            <div
              key={`${achievement.id}-${currentIndex}-${index}`}
              className={`flex items-center gap-2.5 p-2 rounded-lg transition-colors ${rarity.bg}`}
            >
              {/* Achievement icon with glow for rare */}
              <div className={`relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 ${rarity.ring}`}>
                {achievement.icon ? (
                  <Image
                    src={achievement.icon}
                    alt={achievement.name}
                    fill
                    className="object-cover"
                    sizes="32px"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Name and rarity */}
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium line-clamp-1">{achievement.name}</span>
                {achievement.description && (
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{achievement.description}</p>
                )}
              </div>

              {/* Rarity badge */}
              <div className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${rarity.badge}`}>
                {achievement.percent}%
              </div>
            </div>
          )
        })}
      </div>

      {/* Rarest achievement highlight */}
      {rarest && rarest.percent < 15 && (
        <div className="px-4 py-3 bg-gradient-to-r from-purple-500/10 to-transparent border-t border-purple-500/20">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 rounded overflow-hidden flex-shrink-0 ring-1 ring-purple-500/50">
              {rarest.icon ? (
                <Image src={rarest.icon} alt={rarest.name} fill className="object-cover" sizes="24px" unoptimized />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-purple-500/20">
                  <Trophy className="h-3 w-3 text-purple-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-purple-400 font-medium uppercase tracking-wide">
                {isUserAchievements ? 'Rarest Unlocked' : 'Rarest'}
              </div>
              <div className="text-xs truncate">{rarest.name}</div>
            </div>
            <span className="text-xs font-bold text-purple-400">{rarest.percent}%</span>
          </div>
        </div>
      )}
    </div>
  )
}

function getRarity(percent: number) {
  if (percent < 5) return {
    bg: 'bg-purple-500/10 hover:bg-purple-500/15',
    badge: 'bg-purple-500/20 text-purple-400',
    ring: 'ring-2 ring-purple-500/50',
  }
  if (percent < 10) return {
    bg: 'bg-amber-500/10 hover:bg-amber-500/15',
    badge: 'bg-amber-500/20 text-amber-400',
    ring: 'ring-2 ring-amber-500/50',
  }
  if (percent < 25) return {
    bg: 'bg-blue-500/5 hover:bg-blue-500/10',
    badge: 'bg-blue-500/20 text-blue-400',
    ring: 'ring-1 ring-blue-500/30',
  }
  return {
    bg: 'hover:bg-muted/50',
    badge: 'bg-muted text-muted-foreground',
    ring: '',
  }
}
