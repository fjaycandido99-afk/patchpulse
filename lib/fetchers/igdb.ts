// IGDB API Integration
// Uses Twitch OAuth for authentication

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!

let accessToken: string | null = null
let tokenExpiry: number = 0

// Get Twitch OAuth token for IGDB
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken
  }

  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' }
  )

  if (!response.ok) {
    throw new Error(`Failed to get Twitch token: ${response.status}`)
  }

  const data = await response.json()
  accessToken = data.access_token
  // Token expires in ~60 days, but refresh after 50 days to be safe
  tokenExpiry = Date.now() + (data.expires_in - 864000) * 1000

  return accessToken!
}

// Search IGDB for a game and get its cover
export async function searchIgdbGame(gameName: string): Promise<{
  id: number
  name: string
  cover_id: string | null
  cover_url: string | null
} | null> {
  try {
    const token = await getAccessToken()

    // Search for the game
    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: `search "${gameName}"; fields id, name, cover.image_id; limit 5;`,
    })

    if (!response.ok) {
      console.error('IGDB search failed:', response.status)
      return null
    }

    const games = await response.json()

    if (!games || games.length === 0) {
      return null
    }

    // Find best match (exact or closest)
    const lowerName = gameName.toLowerCase()
    let bestMatch = games[0]

    for (const game of games) {
      if (game.name.toLowerCase() === lowerName) {
        bestMatch = game
        break
      }
      // Prefer games with covers
      if (game.cover && !bestMatch.cover) {
        bestMatch = game
      }
    }

    const coverId = bestMatch.cover?.image_id || null
    const coverUrl = coverId
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${coverId}.jpg`
      : null

    return {
      id: bestMatch.id,
      name: bestMatch.name,
      cover_id: coverId,
      cover_url: coverUrl,
    }
  } catch (error) {
    console.error('IGDB search error:', error)
    return null
  }
}

// Get cover for a specific IGDB game ID
export async function getIgdbCover(igdbGameId: number): Promise<string | null> {
  try {
    const token = await getAccessToken()

    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: `where id = ${igdbGameId}; fields cover.image_id; limit 1;`,
    })

    if (!response.ok) {
      return null
    }

    const games = await response.json()

    if (!games || games.length === 0 || !games[0].cover) {
      return null
    }

    const coverId = games[0].cover.image_id
    return `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${coverId}.jpg`
  } catch (error) {
    console.error('IGDB cover error:', error)
    return null
  }
}

// Batch search multiple games
export async function batchSearchIgdb(gameNames: string[]): Promise<Map<string, string>> {
  const results = new Map<string, string>()

  for (const name of gameNames) {
    const result = await searchIgdbGame(name)
    if (result?.cover_url) {
      results.set(name, result.cover_url)
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 250))
  }

  return results
}
