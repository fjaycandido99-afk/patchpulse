import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Cache global achievements for 1 hour
const globalCache = new Map<number, { data: Achievement[]; timestamp: number }>()
const CACHE_TTL = 60 * 60 * 1000

type SteamAchievement = {
  name: string
  percent: number
}

type SteamSchemaAchievement = {
  name: string
  displayName: string
  description?: string
  icon: string
  icongray: string
}

type SteamPlayerAchievement = {
  apiname: string
  achieved: number
  unlocktime: number
}

type Achievement = {
  id: string
  name: string
  description: string | null
  icon: string
  percent: number
  unlocked?: boolean
  unlockTime?: number
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const appId = searchParams.get('appId')

  if (!appId) {
    return NextResponse.json({ error: 'appId is required' }, { status: 400 })
  }

  const appIdNum = parseInt(appId)

  try {
    // Get user's Steam ID from connected accounts
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let steamId: string | null = null
    if (user) {
      const { data: connectedAccount } = await supabase
        .from('connected_accounts')
        .select('external_user_id')
        .eq('user_id', user.id)
        .eq('provider', 'steam')
        .single()

      steamId = connectedAccount?.external_user_id || null
    }

    // Fetch global percentages, schema, and optionally user achievements in parallel
    const fetchPromises: Promise<Response>[] = [
      fetch(
        `https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=${appId}`
      ),
      fetch(
        `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${process.env.STEAM_API_KEY}&appid=${appId}`
      ),
    ]

    // Add user achievements fetch if we have a Steam ID
    if (steamId) {
      fetchPromises.push(
        fetch(
          `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?appid=${appId}&key=${process.env.STEAM_API_KEY}&steamid=${steamId}`
        )
      )
    }

    const responses = await Promise.all(fetchPromises)
    const [percentagesRes, schemaRes] = responses
    const playerAchievementsRes = responses[2]

    if (!percentagesRes.ok) {
      return NextResponse.json([])
    }

    const percentagesData = await percentagesRes.json()
    const schemaData = schemaRes.ok ? await schemaRes.json() : null

    // Parse player achievements - Steam returns success: false if profile is private or game not owned
    let playerData = null
    if (playerAchievementsRes) {
      try {
        const rawPlayerData = await playerAchievementsRes.json()
        // Only use player data if Steam returns success: true
        if (rawPlayerData?.playerstats?.success === true) {
          playerData = rawPlayerData
        }
      } catch {
        // Ignore parse errors
      }
    }

    const percentages: SteamAchievement[] =
      percentagesData?.achievementpercentages?.achievements || []

    const schema: SteamSchemaAchievement[] =
      schemaData?.game?.availableGameStats?.achievements || []

    const playerAchievements: SteamPlayerAchievement[] =
      playerData?.playerstats?.achievements || []

    // Count how many the user has unlocked
    const unlockedCount = playerAchievements.filter(a => a.achieved === 1).length

    // Create maps for quick lookup
    const schemaMap = new Map<string, SteamSchemaAchievement>()
    for (const ach of schema) {
      schemaMap.set(ach.name, ach)
    }

    const unlockedMap = new Map<string, SteamPlayerAchievement>()
    for (const ach of playerAchievements) {
      if (ach.achieved === 1) {
        unlockedMap.set(ach.apiname, ach)
      }
    }

    // Merge percentages with schema data
    let achievements: Achievement[] = percentages.map((p) => {
      const schemaInfo = schemaMap.get(p.name)
      const unlocked = unlockedMap.get(p.name)
      return {
        id: p.name,
        name: schemaInfo?.displayName || p.name,
        description: schemaInfo?.description || null,
        icon: schemaInfo?.icon || '',
        percent: Math.round(p.percent * 10) / 10,
        unlocked: !!unlocked,
        unlockTime: unlocked?.unlocktime,
      }
    })

    const totalCount = achievements.length
    const hasUserData = steamId && unlockedCount > 0

    // If user has achievements, filter to only show unlocked ones
    if (hasUserData) {
      achievements = achievements.filter((a) => a.unlocked)
    }

    // Sort by percent ascending (rarest first)
    achievements.sort((a, b) => a.percent - b.percent)

    return NextResponse.json({
      achievements,
      totalCount,
      unlockedCount: hasUserData ? unlockedCount : null,
      isUserData: hasUserData,
    })
  } catch (error) {
    console.error('Failed to fetch Steam achievements:', error)
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 })
  }
}
