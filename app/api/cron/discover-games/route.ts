import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  getNewReleasesFromIgdb,
  getUpcomingFromIgdb,
  getTBAGamesFromIgdb,
  getIndieGamesFromIgdb,
  igdbToGameRecord
} from '@/lib/fetchers/igdb'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes max

function verifyAuth(req: Request): boolean {
  const vercelCron = req.headers.get('x-vercel-cron')
  const cronSecret = req.headers.get('x-cron-secret')
  const authHeader = req.headers.get('authorization')

  // Debug logging
  console.log('[discover-games] Auth check:', {
    hasVercelCron: vercelCron === '1',
    hasCronSecret: !!cronSecret,
    hasAuthHeader: !!authHeader,
  })

  // Vercel cron
  if (vercelCron === '1') return true
  // Manual call with CRON_SECRET
  if (process.env.CRON_SECRET && cronSecret === process.env.CRON_SECRET) return true
  // Manual call with INTERNAL_API_SECRET
  const token = authHeader?.replace('Bearer ', '')
  if (process.env.INTERNAL_API_SECRET && token === process.env.INTERNAL_API_SECRET) return true
  return false
}

export async function GET(req: Request) {
  if (!verifyAuth(req)) {
    console.log('[discover-games] Unauthorized request')
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[discover-games] Starting game discovery...')

  const supabase = createAdminClient()
  const results = {
    newReleases: { fetched: 0, added: 0, errors: [] as string[] },
    upcoming: { fetched: 0, added: 0, errors: [] as string[] },
    tba: { fetched: 0, added: 0, errors: [] as string[] },
    indie: { fetched: 0, added: 0, errors: [] as string[] },
  }

  // Helper to insert game if not exists
  async function insertGameIfNew(game: Awaited<ReturnType<typeof getNewReleasesFromIgdb>>[0], category: keyof typeof results) {
    try {
      // Check if game already exists (by slug)
      const { data: existing } = await supabase
        .from('games')
        .select('id')
        .eq('slug', game.slug)
        .single()

      if (existing) return false // Skip existing games

      // Insert new game
      const record = igdbToGameRecord(game)
      const { error } = await supabase
        .from('games')
        .insert(record)

      if (error) {
        results[category].errors.push(`${game.name}: ${error.message}`)
        return false
      }

      results[category].added++
      return true
    } catch (err) {
      results[category].errors.push(`${game.name}: ${err}`)
      return false
    }
  }

  // Fetch new releases from IGDB (last 60 days to catch more)
  try {
    const newReleases = await getNewReleasesFromIgdb(40, 60)
    results.newReleases.fetched = newReleases.length

    for (const game of newReleases) {
      await insertGameIfNew(game, 'newReleases')
    }
  } catch (error) {
    results.newReleases.errors.push(`Fetch failed: ${error}`)
  }

  // Fetch upcoming games from IGDB (next 365 days - full year)
  try {
    const upcoming = await getUpcomingFromIgdb(50, 365)
    results.upcoming.fetched = upcoming.length

    for (const game of upcoming) {
      await insertGameIfNew(game, 'upcoming')
    }
  } catch (error) {
    results.upcoming.errors.push(`Fetch failed: ${error}`)
  }

  // Fetch TBA games (announced but no release date)
  try {
    const tbaGames = await getTBAGamesFromIgdb(30)
    results.tba.fetched = tbaGames.length

    for (const game of tbaGames) {
      await insertGameIfNew(game, 'tba')
    }
  } catch (error) {
    results.tba.errors.push(`Fetch failed: ${error}`)
  }

  // Fetch indie games specifically
  try {
    const indieGames = await getIndieGamesFromIgdb(30)
    results.indie.fetched = indieGames.length

    for (const game of indieGames) {
      await insertGameIfNew(game, 'indie')
    }
  } catch (error) {
    results.indie.errors.push(`Fetch failed: ${error}`)
  }

  const totalAdded = results.newReleases.added + results.upcoming.added + results.tba.added + results.indie.added

  return NextResponse.json({
    ok: true,
    totalAdded,
    newReleases: results.newReleases,
    upcoming: results.upcoming,
    tba: results.tba,
    indie: results.indie,
  })
}
