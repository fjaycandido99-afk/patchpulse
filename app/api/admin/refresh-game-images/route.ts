import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { searchIgdbGame } from '@/lib/fetchers/igdb'

export const runtime = 'nodejs'
export const maxDuration = 300

// Admin-only endpoint to refresh game images from IGDB
export async function POST(req: Request) {
  // Verify admin user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const body = await req.json()
  const { gameIds, refreshAll } = body as { gameIds?: string[]; refreshAll?: boolean }

  const adminClient = createAdminClient()
  const results = {
    processed: 0,
    updated: 0,
    failed: [] as string[],
  }

  try {
    let games: { id: string; name: string }[] = []

    if (refreshAll) {
      // Get all games (limit to 50 per run to avoid timeouts)
      const { data } = await adminClient
        .from('games')
        .select('id, name')
        .order('name')
        .limit(50)
      games = data || []
    } else if (gameIds && gameIds.length > 0) {
      // Get specific games
      const { data } = await adminClient
        .from('games')
        .select('id, name')
        .in('id', gameIds)
      games = data || []
    } else {
      return NextResponse.json({ error: 'No games specified' }, { status: 400 })
    }

    results.processed = games.length

    for (const game of games) {
      try {
        const igdbResult = await searchIgdbGame(game.name)

        if (igdbResult?.cover_url) {
          const { error } = await adminClient
            .from('games')
            .update({ cover_url: igdbResult.cover_url })
            .eq('id', game.id)

          if (error) {
            results.failed.push(`${game.name}: ${error.message}`)
          } else {
            results.updated++
          }
        } else {
          results.failed.push(`${game.name}: No cover found on IGDB`)
        }

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (err) {
        results.failed.push(`${game.name}: ${err}`)
      }
    }

    return NextResponse.json({
      ok: true,
      ...results,
    })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: `Failed: ${error}`,
      ...results,
    }, { status: 500 })
  }
}
