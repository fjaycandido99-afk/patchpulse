import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getNewReleasesFromIgdb, getUpcomingFromIgdb, igdbToGameRecord } from '@/lib/fetchers/igdb'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes max

function verifyAuth(req: Request): boolean {
  // Vercel cron
  if (req.headers.get('x-vercel-cron') === '1') return true
  // Manual call with CRON_SECRET
  const cronSecret = req.headers.get('x-cron-secret')
  if (process.env.CRON_SECRET && cronSecret === process.env.CRON_SECRET) return true
  // Manual call with INTERNAL_API_SECRET
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (process.env.INTERNAL_API_SECRET && token === process.env.INTERNAL_API_SECRET) return true
  return false
}

export async function GET(req: Request) {
  if (!verifyAuth(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const results = {
    newReleases: { fetched: 0, added: 0, errors: [] as string[] },
    upcoming: { fetched: 0, added: 0, errors: [] as string[] },
  }

  // Fetch new releases from IGDB
  try {
    const newReleases = await getNewReleasesFromIgdb(30)
    results.newReleases.fetched = newReleases.length

    for (const game of newReleases) {
      try {
        // Check if game already exists (by slug)
        const { data: existing } = await supabase
          .from('games')
          .select('id')
          .eq('slug', game.slug)
          .single()

        if (existing) continue // Skip existing games

        // Insert new game
        const record = igdbToGameRecord(game)
        const { error } = await supabase
          .from('games')
          .insert(record)

        if (error) {
          results.newReleases.errors.push(`${game.name}: ${error.message}`)
        } else {
          results.newReleases.added++
        }
      } catch (err) {
        results.newReleases.errors.push(`${game.name}: ${err}`)
      }
    }
  } catch (error) {
    results.newReleases.errors.push(`Fetch failed: ${error}`)
  }

  // Fetch upcoming games from IGDB
  try {
    const upcoming = await getUpcomingFromIgdb(30)
    results.upcoming.fetched = upcoming.length

    for (const game of upcoming) {
      try {
        // Check if game already exists (by slug)
        const { data: existing } = await supabase
          .from('games')
          .select('id')
          .eq('slug', game.slug)
          .single()

        if (existing) continue

        // Insert new game
        const record = igdbToGameRecord(game)
        const { error } = await supabase
          .from('games')
          .insert(record)

        if (error) {
          results.upcoming.errors.push(`${game.name}: ${error.message}`)
        } else {
          results.upcoming.added++
        }
      } catch (err) {
        results.upcoming.errors.push(`${game.name}: ${err}`)
      }
    }
  } catch (error) {
    results.upcoming.errors.push(`Fetch failed: ${error}`)
  }

  return NextResponse.json({
    ok: true,
    totalAdded: results.newReleases.added + results.upcoming.added,
    newReleases: results.newReleases,
    upcoming: results.upcoming,
  })
}
