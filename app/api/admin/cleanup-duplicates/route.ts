import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  // Verify admin access
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is admin (you can adjust this check)
  const { data: profile } = await supabaseAuth
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const supabase = createAdminClient()

  try {
    // Find duplicate games by name (case insensitive)
    const { data: allGames } = await supabase
      .from('games')
      .select('id, name, slug, created_at')
      .order('created_at', { ascending: true })

    if (!allGames) {
      return NextResponse.json({ ok: true, message: 'No games found', duplicates: 0 })
    }

    // Group games by lowercase name
    const gamesByName = new Map<string, typeof allGames>()
    for (const game of allGames) {
      const key = game.name.toLowerCase().trim()
      if (!gamesByName.has(key)) {
        gamesByName.set(key, [])
      }
      gamesByName.get(key)!.push(game)
    }

    // Find duplicates (names with more than one game)
    const duplicates: { name: string; keepId: string; deleteIds: string[] }[] = []

    for (const [name, games] of gamesByName) {
      if (games.length > 1) {
        // Get usage counts for each duplicate
        const gamesWithUsage = await Promise.all(
          games.map(async (g) => {
            const [backlogCount, patchCount, newsCount] = await Promise.all([
              supabase
                .from('backlog_items')
                .select('id', { count: 'exact', head: true })
                .eq('game_id', g.id),
              supabase
                .from('patch_notes')
                .select('id', { count: 'exact', head: true })
                .eq('game_id', g.id),
              supabase
                .from('news_items')
                .select('id', { count: 'exact', head: true })
                .eq('game_id', g.id),
            ])

            return {
              ...g,
              usage: (backlogCount.count || 0) + (patchCount.count || 0) + (newsCount.count || 0),
            }
          })
        )

        // Sort by usage (highest first), then by created_at (oldest first as tiebreaker)
        gamesWithUsage.sort((a, b) => {
          if (b.usage !== a.usage) return b.usage - a.usage
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        })

        // Keep the first one (most used or oldest), delete the rest
        const [keep, ...toDelete] = gamesWithUsage

        duplicates.push({
          name,
          keepId: keep.id,
          deleteIds: toDelete.map(g => g.id),
        })
      }
    }

    // Get dry run param
    const { searchParams } = new URL(request.url)
    const dryRun = searchParams.get('dryRun') !== 'false'

    if (dryRun) {
      return NextResponse.json({
        ok: true,
        dryRun: true,
        message: `Found ${duplicates.length} duplicate game names. Run with dryRun=false to delete.`,
        duplicates: duplicates.map(d => ({
          name: d.name,
          keepId: d.keepId,
          deleteCount: d.deleteIds.length,
        })),
      })
    }

    // Actually delete duplicates
    let deleted = 0
    for (const dup of duplicates) {
      for (const deleteId of dup.deleteIds) {
        // Delete the duplicate game (cascade should handle related records)
        const { error } = await supabase
          .from('games')
          .delete()
          .eq('id', deleteId)

        if (!error) {
          deleted++
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Deleted ${deleted} duplicate games`,
      duplicates: duplicates.length,
      deleted,
    })
  } catch (error) {
    console.error('Cleanup duplicates error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup duplicates' },
      { status: 500 }
    )
  }
}

// GET to check duplicates without deleting
export async function GET(request: Request) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Find duplicate games by name
  const { data: allGames } = await supabase
    .from('games')
    .select('id, name, slug')

  if (!allGames) {
    return NextResponse.json({ duplicates: [] })
  }

  // Group by lowercase name
  const gamesByName = new Map<string, typeof allGames>()
  for (const game of allGames) {
    const key = game.name.toLowerCase().trim()
    if (!gamesByName.has(key)) {
      gamesByName.set(key, [])
    }
    gamesByName.get(key)!.push(game)
  }

  // Find duplicates
  const duplicates = []
  for (const [name, games] of gamesByName) {
    if (games.length > 1) {
      duplicates.push({
        name,
        count: games.length,
        games: games.map(g => ({ id: g.id, slug: g.slug })),
      })
    }
  }

  return NextResponse.json({
    totalDuplicateNames: duplicates.length,
    totalDuplicateGames: duplicates.reduce((sum, d) => sum + d.count - 1, 0),
    duplicates,
  })
}
