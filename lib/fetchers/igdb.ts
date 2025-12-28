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

export type IgdbGame = {
  id: number
  name: string
  slug: string
  summary?: string
  first_release_date?: number
  cover?: { image_id: string }
  screenshots?: { image_id: string }[]
  genres?: { name: string }[]
  platforms?: { name: string; abbreviation?: string }[]
  involved_companies?: { company: { name: string }; developer: boolean }[]
  category?: number
}

// Get newly released games from IGDB (last 30 days)
export async function getNewReleasesFromIgdb(limit = 20): Promise<IgdbGame[]> {
  try {
    const token = await getAccessToken()

    const now = Math.floor(Date.now() / 1000)
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60)

    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: `
        fields id, name, slug, summary, first_release_date,
               cover.image_id, screenshots.image_id,
               genres.name, platforms.name, platforms.abbreviation,
               involved_companies.company.name, involved_companies.developer,
               category;
        where first_release_date >= ${thirtyDaysAgo}
          & first_release_date <= ${now}
          & category = 0
          & cover != null
          & hypes > 5;
        sort first_release_date desc;
        limit ${limit};
      `,
    })

    if (!response.ok) {
      console.error('IGDB new releases failed:', response.status)
      return []
    }

    return await response.json()
  } catch (error) {
    console.error('IGDB new releases error:', error)
    return []
  }
}

// Get upcoming games from IGDB (next 90 days)
export async function getUpcomingFromIgdb(limit = 20): Promise<IgdbGame[]> {
  try {
    const token = await getAccessToken()

    const now = Math.floor(Date.now() / 1000)
    const ninetyDaysLater = now + (90 * 24 * 60 * 60)

    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: `
        fields id, name, slug, summary, first_release_date,
               cover.image_id, screenshots.image_id,
               genres.name, platforms.name, platforms.abbreviation,
               involved_companies.company.name, involved_companies.developer,
               category;
        where first_release_date >= ${now}
          & first_release_date <= ${ninetyDaysLater}
          & category = 0
          & cover != null
          & hypes > 10;
        sort first_release_date asc;
        limit ${limit};
      `,
    })

    if (!response.ok) {
      console.error('IGDB upcoming failed:', response.status)
      return []
    }

    return await response.json()
  } catch (error) {
    console.error('IGDB upcoming error:', error)
    return []
  }
}

// Convert IGDB game to our database format
export function igdbToGameRecord(igdb: IgdbGame) {
  const developer = igdb.involved_companies?.find(c => c.developer)?.company?.name || null
  const genres = igdb.genres?.map(g => g.name) || []
  const platforms = igdb.platforms?.map(p => p.abbreviation || p.name) || []

  // Normalize platform names
  const normalizedPlatforms = platforms.map(p => {
    const lower = p.toLowerCase()
    if (lower.includes('pc') || lower === 'win' || lower === 'windows') return 'PC'
    if (lower.includes('ps5') || lower.includes('playstation 5')) return 'PS5'
    if (lower.includes('ps4') || lower.includes('playstation 4')) return 'PS4'
    if (lower.includes('xbox') && lower.includes('x')) return 'Xbox Series X|S'
    if (lower.includes('xbox') && lower.includes('one')) return 'Xbox One'
    if (lower.includes('switch')) return 'Nintendo Switch'
    return p
  }).filter((v, i, a) => a.indexOf(v) === i) // unique

  return {
    name: igdb.name,
    slug: igdb.slug,
    description: igdb.summary || null,
    developer,
    genre: genres[0] || null,
    platforms: normalizedPlatforms,
    release_date: igdb.first_release_date
      ? new Date(igdb.first_release_date * 1000).toISOString().split('T')[0]
      : null,
    cover_url: igdb.cover?.image_id
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${igdb.cover.image_id}.jpg`
      : null,
    hero_url: igdb.screenshots?.[0]?.image_id
      ? `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${igdb.screenshots[0].image_id}.jpg`
      : null,
    igdb_id: igdb.id,
  }
}
