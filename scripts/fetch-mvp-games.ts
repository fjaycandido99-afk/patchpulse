/**
 * MVP Games Fetcher
 * Fetches top games from Steam and IGDB to build the curated 500-650 game list
 *
 * Run with: npx tsx scripts/fetch-mvp-games.ts
 */

import * as fs from 'fs'
import * as path from 'path'

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Minimum peak concurrent players for auto-inclusion
  MIN_PEAK_PLAYERS: 10000,

  // Target number of games
  TARGET_GAMES: 600,

  // Output paths
  OUTPUT_DIR: path.join(process.cwd(), 'scripts', 'output'),
  OUTPUT_JSON: 'mvp-games.json',
  OUTPUT_SQL: 'mvp-games-insert.sql',
  OUTPUT_CSV: 'mvp-games.csv',
}

// ============================================================================
// TYPES
// ============================================================================

type SteamGame = {
  appid: number
  name: string
  peak_players?: number
  average_players?: number
  genre?: string
  developer?: string
  publisher?: string
}

type MVPGame = {
  name: string
  slug: string
  steam_app_id?: number
  platforms: string[]
  genre: string | null
  cover_url: string | null
  is_live_service: boolean
  mvp_eligible: boolean
  support_tier: 'full' | 'partial' | 'requested'
  curated_exception: boolean
  peak_players?: number
}

// ============================================================================
// STEAM API HELPERS
// ============================================================================

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      if (i === retries - 1) throw error
      console.log(`  Retry ${i + 1}/${retries}...`)
      await sleep(1000 * (i + 1))
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Fetch top games from SteamSpy (free, no API key needed)
 * Returns games sorted by peak players
 */
async function fetchSteamSpyTop(): Promise<SteamGame[]> {
  console.log('📊 Fetching top games from SteamSpy...')

  const games: SteamGame[] = []

  // SteamSpy pages (each has ~100 games)
  const pages = ['top100in2weeks', 'top100forever', 'top100owned']

  for (const page of pages) {
    try {
      console.log(`  Fetching ${page}...`)
      const data = await fetchWithRetry(`https://steamspy.com/api.php?request=${page}`)

      for (const [appid, game] of Object.entries(data)) {
        const g = game as any
        if (!games.find(existing => existing.appid === parseInt(appid))) {
          games.push({
            appid: parseInt(appid),
            name: g.name,
            peak_players: g.ccu || g.peak_ccu || 0,
            average_players: g.average_forever || 0,
            genre: g.genre || null,
            developer: g.developer || null,
            publisher: g.publisher || null,
          })
        }
      }

      await sleep(1500) // Rate limiting
    } catch (error) {
      console.error(`  Error fetching ${page}:`, error)
    }
  }

  // Also fetch by genre for broader coverage
  const genres = ['action', 'adventure', 'rpg', 'strategy', 'simulation', 'sports', 'racing']

  for (const genre of genres) {
    try {
      console.log(`  Fetching genre: ${genre}...`)
      const data = await fetchWithRetry(`https://steamspy.com/api.php?request=genre&genre=${genre}`)

      for (const [appid, game] of Object.entries(data)) {
        const g = game as any
        if (!games.find(existing => existing.appid === parseInt(appid))) {
          games.push({
            appid: parseInt(appid),
            name: g.name,
            peak_players: g.ccu || 0,
            average_players: g.average_forever || 0,
            genre: genre,
            developer: g.developer || null,
            publisher: g.publisher || null,
          })
        }
      }

      await sleep(1500) // Rate limiting
    } catch (error) {
      console.error(`  Error fetching genre ${genre}:`, error)
    }
  }

  console.log(`  Found ${games.length} unique games`)
  return games
}

/**
 * Get Steam store details for cover images
 */
async function fetchSteamDetails(appid: number): Promise<{ cover_url: string | null }> {
  try {
    const data = await fetchWithRetry(
      `https://store.steampowered.com/api/appdetails?appids=${appid}`
    )

    if (data[appid]?.success && data[appid]?.data) {
      const gameData = data[appid].data
      return {
        cover_url: gameData.header_image || null,
      }
    }
  } catch (error) {
    // Silently fail for individual game details
  }

  return { cover_url: null }
}

// ============================================================================
// DATA PROCESSING
// ============================================================================

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

function detectLiveService(name: string, genre: string | null): boolean {
  const liveServiceKeywords = [
    'fortnite', 'warzone', 'apex', 'valorant', 'league of legends', 'dota',
    'counter-strike', 'overwatch', 'destiny', 'rainbow six', 'call of duty',
    'fifa', 'nba 2k', 'madden', 'world of warcraft', 'final fantasy xiv',
    'genshin', 'path of exile', 'dead by daylight', 'sea of thieves',
    'rocket league', 'fall guys', 'pubg', 'battleground', 'rust', 'ark',
    'escape from tarkov', 'hunt: showdown', 'the division', 'diablo',
  ]

  const lowerName = name.toLowerCase()
  return liveServiceKeywords.some(kw => lowerName.includes(kw))
}

function detectPlatforms(name: string): string[] {
  // Default to PC since we're fetching from Steam
  // Could be enhanced with IGDB data for multi-platform detection
  const platforms = ['PC']

  // Some known multi-platform games
  const multiPlatformKeywords = [
    'fortnite', 'warzone', 'apex', 'overwatch', 'destiny', 'rocket league',
    'fall guys', 'pubg', 'fifa', 'nba', 'madden', 'call of duty',
  ]

  const lowerName = name.toLowerCase()
  if (multiPlatformKeywords.some(kw => lowerName.includes(kw))) {
    platforms.push('PlayStation', 'Xbox')
  }

  return platforms
}

async function processGames(steamGames: SteamGame[]): Promise<MVPGame[]> {
  console.log('\n🔄 Processing games...')

  // Filter by minimum players and sort
  const eligible = steamGames
    .filter(g => (g.peak_players || 0) >= CONFIG.MIN_PEAK_PLAYERS)
    .sort((a, b) => (b.peak_players || 0) - (a.peak_players || 0))
    .slice(0, CONFIG.TARGET_GAMES)

  console.log(`  ${eligible.length} games meet the ${CONFIG.MIN_PEAK_PLAYERS.toLocaleString()} player threshold`)

  const mvpGames: MVPGame[] = []

  for (let i = 0; i < eligible.length; i++) {
    const game = eligible[i]

    // Progress indicator
    if (i % 50 === 0) {
      console.log(`  Processing ${i + 1}/${eligible.length}...`)
    }

    mvpGames.push({
      name: game.name,
      slug: slugify(game.name),
      steam_app_id: game.appid,
      platforms: detectPlatforms(game.name),
      genre: game.genre || null,
      cover_url: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
      is_live_service: detectLiveService(game.name, game.genre || null),
      mvp_eligible: true,
      support_tier: 'full',
      curated_exception: false,
      peak_players: game.peak_players,
    })
  }

  return mvpGames
}

// ============================================================================
// OUTPUT GENERATORS
// ============================================================================

function generateSQL(games: MVPGame[]): string {
  const lines = [
    '-- MVP Games Insert',
    '-- Generated: ' + new Date().toISOString(),
    `-- Total games: ${games.length}`,
    '',
    '-- Insert games (on conflict update)',
    '',
  ]

  for (const game of games) {
    const platforms = `ARRAY[${game.platforms.map(p => `'${p}'`).join(', ')}]`
    const escapedName = game.name.replace(/'/g, "''")

    lines.push(`INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)`)
    lines.push(`VALUES ('${escapedName}', '${game.slug}', '${game.cover_url}', ${platforms}, ${game.genre ? `'${game.genre}'` : 'NULL'}, ${game.is_live_service}, true, 'full', false, now())`)
    lines.push(`ON CONFLICT (slug) DO UPDATE SET`)
    lines.push(`  mvp_eligible = true,`)
    lines.push(`  support_tier = 'full',`)
    lines.push(`  is_live_service = EXCLUDED.is_live_service,`)
    lines.push(`  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),`)
    lines.push(`  eligibility_checked_at = now();`)
    lines.push('')
  }

  return lines.join('\n')
}

function generateCSV(games: MVPGame[]): string {
  const headers = ['name', 'slug', 'steam_app_id', 'platforms', 'genre', 'cover_url', 'is_live_service', 'peak_players']
  const rows = games.map(g => [
    `"${g.name.replace(/"/g, '""')}"`,
    g.slug,
    g.steam_app_id || '',
    `"${g.platforms.join(', ')}"`,
    g.genre || '',
    g.cover_url || '',
    g.is_live_service,
    g.peak_players || '',
  ].join(','))

  return [headers.join(','), ...rows].join('\n')
}

// ============================================================================
// CURATED EXCEPTIONS (Major titles not on Steam or with special status)
// ============================================================================

function getCuratedExceptions(): MVPGame[] {
  return [
    {
      name: 'League of Legends',
      slug: 'league-of-legends',
      platforms: ['PC'],
      genre: 'MOBA',
      cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co49wj.jpg',
      is_live_service: true,
      mvp_eligible: true,
      support_tier: 'full',
      curated_exception: true,
    },
    {
      name: 'Valorant',
      slug: 'valorant',
      platforms: ['PC'],
      genre: 'FPS',
      cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2mvt.jpg',
      is_live_service: true,
      mvp_eligible: true,
      support_tier: 'full',
      curated_exception: true,
    },
    {
      name: 'Fortnite',
      slug: 'fortnite',
      platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'],
      genre: 'Battle Royale',
      cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3wk8.jpg',
      is_live_service: true,
      mvp_eligible: true,
      support_tier: 'full',
      curated_exception: true,
    },
    {
      name: 'Genshin Impact',
      slug: 'genshin-impact',
      platforms: ['PC', 'PlayStation', 'Mobile'],
      genre: 'Action RPG',
      cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2d.jpg',
      is_live_service: true,
      mvp_eligible: true,
      support_tier: 'full',
      curated_exception: true,
    },
    {
      name: 'Honkai: Star Rail',
      slug: 'honkai-star-rail',
      platforms: ['PC', 'PlayStation', 'Mobile'],
      genre: 'Turn-based RPG',
      cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5w3k.jpg',
      is_live_service: true,
      mvp_eligible: true,
      support_tier: 'full',
      curated_exception: true,
    },
    {
      name: 'Call of Duty: Warzone',
      slug: 'call-of-duty-warzone',
      platforms: ['PC', 'PlayStation', 'Xbox'],
      genre: 'Battle Royale',
      cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2ket.jpg',
      is_live_service: true,
      mvp_eligible: true,
      support_tier: 'full',
      curated_exception: true,
    },
    {
      name: 'Minecraft',
      slug: 'minecraft',
      platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'],
      genre: 'Sandbox',
      cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co49x5.jpg',
      is_live_service: true,
      mvp_eligible: true,
      support_tier: 'full',
      curated_exception: true,
    },
    {
      name: 'Roblox',
      slug: 'roblox',
      platforms: ['PC', 'Xbox', 'Mobile'],
      genre: 'Platform',
      cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rog.jpg',
      is_live_service: true,
      mvp_eligible: true,
      support_tier: 'full',
      curated_exception: true,
    },
  ]
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🎮 MVP Games Fetcher')
  console.log('====================\n')
  console.log(`Target: ${CONFIG.TARGET_GAMES} games with ≥${CONFIG.MIN_PEAK_PLAYERS.toLocaleString()} peak players\n`)

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true })
  }

  // Fetch from Steam
  const steamGames = await fetchSteamSpyTop()

  // Process and filter
  let mvpGames = await processGames(steamGames)

  // Add curated exceptions (avoiding duplicates)
  const exceptions = getCuratedExceptions()
  for (const exception of exceptions) {
    if (!mvpGames.find(g => g.slug === exception.slug)) {
      mvpGames.unshift(exception) // Add to beginning
    }
  }

  // Remove duplicates by slug
  const seen = new Set<string>()
  mvpGames = mvpGames.filter(g => {
    if (seen.has(g.slug)) return false
    seen.add(g.slug)
    return true
  })

  console.log(`\n✅ Final count: ${mvpGames.length} games`)

  // Generate outputs
  console.log('\n📁 Generating output files...')

  // JSON
  const jsonPath = path.join(CONFIG.OUTPUT_DIR, CONFIG.OUTPUT_JSON)
  fs.writeFileSync(jsonPath, JSON.stringify(mvpGames, null, 2))
  console.log(`  ✓ ${CONFIG.OUTPUT_JSON}`)

  // SQL
  const sqlPath = path.join(CONFIG.OUTPUT_DIR, CONFIG.OUTPUT_SQL)
  fs.writeFileSync(sqlPath, generateSQL(mvpGames))
  console.log(`  ✓ ${CONFIG.OUTPUT_SQL}`)

  // CSV
  const csvPath = path.join(CONFIG.OUTPUT_DIR, CONFIG.OUTPUT_CSV)
  fs.writeFileSync(csvPath, generateCSV(mvpGames))
  console.log(`  ✓ ${CONFIG.OUTPUT_CSV}`)

  // Summary
  console.log('\n📊 Summary:')
  console.log(`  Total games: ${mvpGames.length}`)
  console.log(`  Live service: ${mvpGames.filter(g => g.is_live_service).length}`)
  console.log(`  Curated exceptions: ${mvpGames.filter(g => g.curated_exception).length}`)
  console.log(`  Unique genres: ${new Set(mvpGames.map(g => g.genre).filter(Boolean)).size}`)

  console.log('\n🎯 Next steps:')
  console.log('  1. Review the generated files in scripts/output/')
  console.log('  2. Run the SQL in Supabase to insert games')
  console.log('  3. Or import the CSV via Supabase dashboard')
  console.log('')
}

main().catch(console.error)
