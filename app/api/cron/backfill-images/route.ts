import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { searchIgdbGame } from '@/lib/fetchers/igdb'

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
    processed: 0,
    updated: 0,
    errors: [] as string[],
  }

  try {
    // Get games missing cover images (limit to 20 per run to avoid timeouts)
    const { data: games } = await supabase
      .from('games')
      .select('id, name')
      .is('cover_url', null)
      .limit(20)

    if (!games || games.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'No games need image backfill',
        ...results,
      })
    }

    results.processed = games.length

    for (const game of games) {
      try {
        // Search IGDB for cover
        const igdbResult = await searchIgdbGame(game.name)

        if (igdbResult?.cover_url) {
          const { error } = await supabase
            .from('games')
            .update({ cover_url: igdbResult.cover_url })
            .eq('id', game.id)

          if (error) {
            results.errors.push(`${game.name}: ${error.message}`)
          } else {
            results.updated++
          }
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (err) {
        results.errors.push(`${game.name}: ${err}`)
      }
    }
  } catch (error) {
    results.errors.push(`Query failed: ${error}`)
  }

  return NextResponse.json({
    ok: true,
    ...results,
  })
}
