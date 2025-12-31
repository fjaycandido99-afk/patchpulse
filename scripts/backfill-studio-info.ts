import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!

let accessToken: string | null = null
let tokenExpiry: number = 0

// Known AAA studios
const AAA_STUDIOS = new Set([
  'rockstar games', 'rockstar north', 'rockstar san diego',
  'activision', 'infinity ward', 'treyarch', 'sledgehammer games',
  'electronic arts', 'ea', 'dice', 'ea sports', 'bioware', 'respawn entertainment',
  'ubisoft', 'ubisoft montreal', 'ubisoft toronto', 'ubisoft quebec',
  'bethesda game studios', 'bethesda softworks', 'id software',
  'square enix', 'crystal dynamics', 'eidos montreal',
  'sony interactive entertainment', 'naughty dog', 'santa monica studio', 'guerrilla games', 'insomniac games', 'sucker punch',
  'microsoft', 'xbox game studios', '343 industries', 'turn 10 studios', 'the coalition', 'playground games',
  'nintendo', 'nintendo epd',
  'capcom', 'bandai namco', 'sega', 'konami', 'take-two interactive', '2k games',
  'warner bros', 'wb games', 'netherealm studios',
  'cd projekt red', 'fromsoftware', 'from software',
  'blizzard entertainment', 'blizzard', 'riot games',
  'valve', 'valve corporation',
  'epic games',
])

// Known indie studios
const INDIE_STUDIOS = new Set([
  'team cherry', 'motion twin', 'supergiant games', 'devolver digital',
  'concerned ape', 're-logic', 'mojang', 'innersloth',
  'klei entertainment', 'subset games', 'hopoo games',
  'coffee stain studios', 'ghost ship games', 'iron gate ab',
  'tobyfox', 'studio mdhr', 'annapurna interactive',
])

function getStudioType(developer: string, publisher: string): 'AAA' | 'AA' | 'indie' {
  const devLower = developer?.toLowerCase() || ''
  const pubLower = publisher?.toLowerCase() || ''

  // Check if AAA
  for (const studio of AAA_STUDIOS) {
    if (devLower.includes(studio) || pubLower.includes(studio)) {
      return 'AAA'
    }
  }

  // Check if indie
  for (const studio of INDIE_STUDIOS) {
    if (devLower.includes(studio) || pubLower.includes(studio)) {
      return 'indie'
    }
  }

  // Default to AA (mid-tier)
  return 'AA'
}

async function getAccessToken(): Promise<string> {
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
  tokenExpiry = Date.now() + (data.expires_in - 864000) * 1000

  return accessToken!
}

async function fetchGameDetails(gameName: string): Promise<{
  igdb_id: number
  developer: string | null
  publisher: string | null
  similar_games: string[]
  developer_notable_games: string[]
} | null> {
  try {
    const token = await getAccessToken()

    // Search for the game with involved companies and similar games
    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: `
        search "${gameName}";
        fields id, name,
          involved_companies.company.name,
          involved_companies.developer,
          involved_companies.publisher,
          similar_games.name;
        limit 5;
      `,
    })

    if (!response.ok) {
      console.error('IGDB search failed:', response.status)
      return null
    }

    const games = await response.json()

    if (!games || games.length === 0) {
      return null
    }

    // Find best match
    const lowerName = gameName.toLowerCase()
    let bestMatch = games[0]
    for (const game of games) {
      if (game.name.toLowerCase() === lowerName) {
        bestMatch = game
        break
      }
    }

    // Extract developer and publisher
    let developer: string | null = null
    let publisher: string | null = null

    if (bestMatch.involved_companies) {
      for (const ic of bestMatch.involved_companies) {
        if (ic.developer && ic.company?.name) {
          developer = ic.company.name
        }
        if (ic.publisher && ic.company?.name) {
          publisher = ic.company.name
        }
      }
    }

    // Get similar games names
    const similar_games = bestMatch.similar_games
      ?.slice(0, 5)
      .map((g: { name: string }) => g.name) || []

    // Get developer's notable games
    let developer_notable_games: string[] = []
    if (developer) {
      developer_notable_games = await fetchDeveloperNotableGames(developer, gameName)
    }

    return {
      igdb_id: bestMatch.id,
      developer,
      publisher,
      similar_games,
      developer_notable_games,
    }
  } catch (error) {
    console.error('IGDB fetch error:', error)
    return null
  }
}

async function fetchDeveloperNotableGames(developerName: string, excludeGame: string): Promise<string[]> {
  try {
    const token = await getAccessToken()

    // First find the company
    const companyResponse = await fetch('https://api.igdb.com/v4/companies', {
      method: 'POST',
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: `search "${developerName}"; fields id, name, developed.name, developed.total_rating, developed.total_rating_count; limit 1;`,
    })

    if (!companyResponse.ok) return []

    const companies = await companyResponse.json()
    if (!companies || companies.length === 0 || !companies[0].developed) return []

    // Get top rated games by this developer
    const notableGames = companies[0].developed
      .filter((g: { name: string; total_rating_count?: number }) =>
        g.name.toLowerCase() !== excludeGame.toLowerCase() &&
        (g.total_rating_count || 0) > 50
      )
      .sort((a: { total_rating?: number }, b: { total_rating?: number }) =>
        (b.total_rating || 0) - (a.total_rating || 0)
      )
      .slice(0, 4)
      .map((g: { name: string }) => g.name)

    return notableGames
  } catch {
    return []
  }
}

async function main() {
  console.log('Fetching games that need studio info...\n')

  // Get games without developer info
  const { data: games, error } = await supabase
    .from('games')
    .select('id, name, developer')
    .is('developer', null)
    .order('name')

  if (error) {
    console.error('Failed to fetch games:', error)
    return
  }

  console.log(`Found ${games?.length || 0} games to update\n`)

  let updated = 0
  let failed = 0

  for (const game of games || []) {
    console.log(`Processing: ${game.name}`)

    const details = await fetchGameDetails(game.name)

    if (details) {
      const studioType = getStudioType(details.developer || '', details.publisher || '')

      const { error: updateError } = await supabase
        .from('games')
        .update({
          igdb_id: details.igdb_id,
          developer: details.developer,
          publisher: details.publisher,
          studio_type: studioType,
          similar_games: details.similar_games.length > 0 ? details.similar_games : null,
          developer_notable_games: details.developer_notable_games.length > 0 ? details.developer_notable_games : null,
        })
        .eq('id', game.id)

      if (updateError) {
        console.log(`  ✗ Failed to update: ${updateError.message}`)
        failed++
      } else {
        console.log(`  ✓ ${details.developer || 'Unknown'} (${studioType})`)
        if (details.similar_games.length > 0) {
          console.log(`    Similar: ${details.similar_games.slice(0, 3).join(', ')}`)
        }
        if (details.developer_notable_games.length > 0) {
          console.log(`    Also made: ${details.developer_notable_games.slice(0, 3).join(', ')}`)
        }
        updated++
      }
    } else {
      console.log(`  - No data found`)
      failed++
    }

    // Rate limit: 4 requests per second for IGDB
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  console.log(`\nDone! Updated: ${updated}, Failed: ${failed}`)
}

main().catch(console.error)
