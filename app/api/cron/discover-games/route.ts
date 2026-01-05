import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  getNewReleasesFromIgdb,
  getUpcomingFromIgdb,
  getTBAGamesFromIgdb,
  getIndieGamesFromIgdb,
  igdbToGameRecord
} from '@/lib/fetchers/igdb'
import { discoverSteamGames } from '@/lib/fetchers/steam-discovery'
import { verifyCronAuth } from '@/lib/cron-auth'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes max

export async function GET(req: Request) {
  if (!verifyCronAuth(req)) {
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
    steam: { fetched: 0, added: 0, errors: [] as string[] },
  }

  // Helper to insert game if not exists
  async function insertGameIfNew(game: Awaited<ReturnType<typeof getNewReleasesFromIgdb>>[0], category: keyof typeof results) {
    try {
      // Check if game already exists (by slug OR name to prevent duplicates)
      const { data: existingBySlug } = await supabase
        .from('games')
        .select('id')
        .eq('slug', game.slug)
        .single()

      if (existingBySlug) return false // Skip existing games

      // Also check by name (case insensitive)
      const { data: existingByName } = await supabase
        .from('games')
        .select('id')
        .ilike('name', game.name)
        .single()

      if (existingByName) return false // Skip if name already exists

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

  // Fetch new releases from IGDB (last 90 days, more games)
  try {
    const newReleases = await getNewReleasesFromIgdb(100, 90)
    results.newReleases.fetched = newReleases.length

    for (const game of newReleases) {
      await insertGameIfNew(game, 'newReleases')
    }
  } catch (error) {
    results.newReleases.errors.push(`Fetch failed: ${error}`)
  }

  // Fetch upcoming games from IGDB (next 365 days - full year)
  try {
    const upcoming = await getUpcomingFromIgdb(100, 365)
    results.upcoming.fetched = upcoming.length

    for (const game of upcoming) {
      await insertGameIfNew(game, 'upcoming')
    }
  } catch (error) {
    results.upcoming.errors.push(`Fetch failed: ${error}`)
  }

  // Fetch TBA games (announced but no release date)
  try {
    const tbaGames = await getTBAGamesFromIgdb(50)
    results.tba.fetched = tbaGames.length

    for (const game of tbaGames) {
      await insertGameIfNew(game, 'tba')
    }
  } catch (error) {
    results.tba.errors.push(`Fetch failed: ${error}`)
  }

  // Fetch indie games specifically
  try {
    const indieGames = await getIndieGamesFromIgdb(50)
    results.indie.fetched = indieGames.length

    for (const game of indieGames) {
      await insertGameIfNew(game, 'indie')
    }
  } catch (error) {
    results.indie.errors.push(`Fetch failed: ${error}`)
  }

  // Fetch from Steam (featured, new releases, top sellers, coming soon)
  try {
    console.log('[discover-games] Fetching from Steam...')
    const steamResults = await discoverSteamGames()
    results.steam = {
      fetched: steamResults.fetched,
      added: steamResults.added,
      errors: steamResults.errors,
    }
    console.log(`[discover-games] Steam: fetched ${steamResults.fetched}, added ${steamResults.added}`)
  } catch (error) {
    results.steam.errors.push(`Fetch failed: ${error}`)
  }

  const totalAdded = results.newReleases.added + results.upcoming.added + results.tba.added + results.indie.added + results.steam.added

  return NextResponse.json({
    ok: true,
    totalAdded,
    newReleases: results.newReleases,
    upcoming: results.upcoming,
    tba: results.tba,
    indie: results.indie,
    steam: results.steam,
  })
}
