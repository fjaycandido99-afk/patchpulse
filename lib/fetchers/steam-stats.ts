// Steam player count API - no API key required
// Endpoint: https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=XXX

type SteamPlayerCountResponse = {
  response: {
    player_count?: number
    result: number // 1 = success
  }
}

// Simple in-memory cache with 5-minute TTL
const playerCountCache = new Map<number, { count: number; timestamp: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export async function getSteamPlayerCount(steamAppId: number): Promise<number | null> {
  // Check cache first
  const cached = playerCountCache.get(steamAppId)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.count
  }

  try {
    const response = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${steamAppId}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    )

    if (!response.ok) {
      return null
    }

    const data: SteamPlayerCountResponse = await response.json()

    if (data.response.result !== 1 || data.response.player_count === undefined) {
      return null
    }

    const count = data.response.player_count

    // Update cache
    playerCountCache.set(steamAppId, { count, timestamp: Date.now() })

    return count
  } catch (error) {
    console.error(`Failed to fetch player count for Steam app ${steamAppId}:`, error)
    return null
  }
}

// Batch fetch player counts for multiple games
export async function getSteamPlayerCounts(
  steamAppIds: number[]
): Promise<Map<number, number>> {
  const results = new Map<number, number>()

  // Fetch in parallel with a limit to avoid rate limiting
  const batchSize = 10
  for (let i = 0; i < steamAppIds.length; i += batchSize) {
    const batch = steamAppIds.slice(i, i + batchSize)
    const promises = batch.map(async (appId) => {
      const count = await getSteamPlayerCount(appId)
      if (count !== null) {
        results.set(appId, count)
      }
    })
    await Promise.all(promises)
  }

  return results
}

// Format player count for display
export function formatPlayerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}
