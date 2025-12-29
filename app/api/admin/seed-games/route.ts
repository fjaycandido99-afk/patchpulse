import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const maxDuration = 60

function verifyAuth(req: Request): boolean {
  if (req.headers.get('x-vercel-cron') === '1') return true
  const cronSecret = req.headers.get('x-cron-secret')
  if (process.env.CRON_SECRET && cronSecret === process.env.CRON_SECRET) return true
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (process.env.INTERNAL_API_SECRET && token === process.env.INTERNAL_API_SECRET) return true
  return false
}

// Popular games with their Steam App IDs
const POPULAR_GAMES = [
  { name: 'Counter-Strike 2', slug: 'counter-strike-2', steam_app_id: 730, genre: 'FPS', platforms: ['PC'] },
  { name: 'Dota 2', slug: 'dota-2', steam_app_id: 570, genre: 'MOBA', platforms: ['PC'] },
  { name: 'PUBG: Battlegrounds', slug: 'pubg', steam_app_id: 578080, genre: 'Battle Royale', platforms: ['PC'] },
  { name: 'Apex Legends', slug: 'apex-legends', steam_app_id: 1172470, genre: 'Battle Royale', platforms: ['PC', 'PS5', 'Xbox Series X|S'] },
  { name: 'Destiny 2', slug: 'destiny-2', steam_app_id: 1085660, genre: 'MMO Shooter', platforms: ['PC', 'PS5', 'Xbox Series X|S'] },
  { name: 'Elden Ring', slug: 'elden-ring', steam_app_id: 1245620, genre: 'Action RPG', platforms: ['PC', 'PS5', 'Xbox Series X|S'] },
  { name: 'Baldur\'s Gate 3', slug: 'baldurs-gate-3', steam_app_id: 1086940, genre: 'RPG', platforms: ['PC', 'PS5', 'Xbox Series X|S'] },
  { name: 'Cyberpunk 2077', slug: 'cyberpunk-2077', steam_app_id: 1091500, genre: 'Action RPG', platforms: ['PC', 'PS5', 'Xbox Series X|S'] },
  { name: 'Helldivers 2', slug: 'helldivers-2', steam_app_id: 553850, genre: 'Third-person Shooter', platforms: ['PC', 'PS5'] },
  { name: 'Path of Exile', slug: 'path-of-exile', steam_app_id: 238960, genre: 'Action RPG', platforms: ['PC', 'PS5', 'Xbox Series X|S'] },
  { name: 'Path of Exile 2', slug: 'path-of-exile-2', steam_app_id: 2694490, genre: 'Action RPG', platforms: ['PC', 'PS5', 'Xbox Series X|S'] },
  { name: 'Rust', slug: 'rust', steam_app_id: 252490, genre: 'Survival', platforms: ['PC'] },
  { name: 'ARK: Survival Ascended', slug: 'ark-survival-ascended', steam_app_id: 2399830, genre: 'Survival', platforms: ['PC', 'PS5', 'Xbox Series X|S'] },
  { name: 'Terraria', slug: 'terraria', steam_app_id: 105600, genre: 'Sandbox', platforms: ['PC'] },
  { name: 'Stardew Valley', slug: 'stardew-valley', steam_app_id: 413150, genre: 'Farming Sim', platforms: ['PC', 'Nintendo Switch'] },
  { name: 'Valheim', slug: 'valheim', steam_app_id: 892970, genre: 'Survival', platforms: ['PC'] },
  { name: 'No Man\'s Sky', slug: 'no-mans-sky', steam_app_id: 275850, genre: 'Exploration', platforms: ['PC', 'PS5', 'Xbox Series X|S'] },
  { name: 'Deep Rock Galactic', slug: 'deep-rock-galactic', steam_app_id: 548430, genre: 'Co-op Shooter', platforms: ['PC', 'PS5', 'Xbox Series X|S'] },
  { name: 'Dead by Daylight', slug: 'dead-by-daylight', steam_app_id: 381210, genre: 'Horror', platforms: ['PC', 'PS5', 'Xbox Series X|S'] },
  { name: 'Rainbow Six Siege', slug: 'rainbow-six-siege', steam_app_id: 359550, genre: 'Tactical Shooter', platforms: ['PC', 'PS5', 'Xbox Series X|S'] },
  { name: 'Escape from Tarkov', slug: 'escape-from-tarkov', steam_app_id: 0, genre: 'Tactical Shooter', platforms: ['PC'] }, // Not on Steam
  { name: 'The Finals', slug: 'the-finals', steam_app_id: 2073850, genre: 'FPS', platforms: ['PC', 'PS5', 'Xbox Series X|S'] },
  { name: 'Marvel Rivals', slug: 'marvel-rivals', steam_app_id: 2767030, genre: 'Hero Shooter', platforms: ['PC', 'PS5', 'Xbox Series X|S'] },
  { name: 'Black Myth: Wukong', slug: 'black-myth-wukong', steam_app_id: 2358720, genre: 'Action RPG', platforms: ['PC', 'PS5'] },
  { name: 'Monster Hunter Wilds', slug: 'monster-hunter-wilds', steam_app_id: 2246340, genre: 'Action RPG', platforms: ['PC', 'PS5', 'Xbox Series X|S'] },
  { name: 'Fortnite', slug: 'fortnite', steam_app_id: 0, genre: 'Battle Royale', platforms: ['PC', 'PS5', 'Xbox Series X|S', 'Nintendo Switch'] }, // Not on Steam
  { name: 'Valorant', slug: 'valorant', steam_app_id: 0, genre: 'Tactical Shooter', platforms: ['PC'] }, // Not on Steam
  { name: 'League of Legends', slug: 'league-of-legends', steam_app_id: 0, genre: 'MOBA', platforms: ['PC'] }, // Not on Steam
  { name: 'Overwatch 2', slug: 'overwatch-2', steam_app_id: 2357570, genre: 'Hero Shooter', platforms: ['PC', 'PS5', 'Xbox Series X|S', 'Nintendo Switch'] },
  { name: 'Diablo IV', slug: 'diablo-iv', steam_app_id: 2344520, genre: 'Action RPG', platforms: ['PC', 'PS5', 'Xbox Series X|S'] },
  { name: 'World of Warcraft', slug: 'world-of-warcraft', steam_app_id: 0, genre: 'MMORPG', platforms: ['PC'] }, // Not on Steam
  { name: 'Final Fantasy XIV', slug: 'final-fantasy-xiv', steam_app_id: 39210, genre: 'MMORPG', platforms: ['PC', 'PS5'] },
  { name: 'Grand Theft Auto V', slug: 'gta-v', steam_app_id: 271590, genre: 'Action', platforms: ['PC', 'PS5', 'Xbox Series X|S'] },
  { name: 'Red Dead Redemption 2', slug: 'red-dead-redemption-2', steam_app_id: 1174180, genre: 'Action', platforms: ['PC', 'PS5', 'Xbox Series X|S'] },
  { name: 'The Witcher 3: Wild Hunt', slug: 'witcher-3', steam_app_id: 292030, genre: 'RPG', platforms: ['PC', 'PS5', 'Xbox Series X|S', 'Nintendo Switch'] },
  { name: 'Hades II', slug: 'hades-2', steam_app_id: 1145350, genre: 'Roguelike', platforms: ['PC'] },
  { name: 'Sea of Thieves', slug: 'sea-of-thieves', steam_app_id: 1172620, genre: 'Adventure', platforms: ['PC', 'PS5', 'Xbox Series X|S'] },
  { name: 'Palworld', slug: 'palworld', steam_app_id: 1623730, genre: 'Survival', platforms: ['PC', 'Xbox Series X|S'] },
  { name: 'Lethal Company', slug: 'lethal-company', steam_app_id: 1966720, genre: 'Horror', platforms: ['PC'] },
  { name: 'Content Warning', slug: 'content-warning', steam_app_id: 2881650, genre: 'Horror', platforms: ['PC'] },
]

export async function GET(req: Request) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  let added = 0
  let updated = 0
  const errors: string[] = []

  for (const game of POPULAR_GAMES) {
    try {
      // Check if game exists
      const { data: existing } = await supabase
        .from('games')
        .select('id, steam_app_id')
        .eq('slug', game.slug)
        .single()

      if (existing) {
        // Update steam_app_id if missing
        if (!existing.steam_app_id && game.steam_app_id > 0) {
          await supabase
            .from('games')
            .update({ steam_app_id: game.steam_app_id })
            .eq('id', existing.id)
          updated++
        }
      } else {
        // Insert new game
        const { error } = await supabase
          .from('games')
          .insert({
            name: game.name,
            slug: game.slug,
            steam_app_id: game.steam_app_id > 0 ? game.steam_app_id : null,
            genre: game.genre,
            platforms: game.platforms,
          })

        if (error) {
          errors.push(`${game.name}: ${error.message}`)
        } else {
          added++
        }
      }
    } catch (err) {
      errors.push(`${game.name}: ${err}`)
    }
  }

  return NextResponse.json({
    ok: true,
    added,
    updated,
    total: POPULAR_GAMES.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}
