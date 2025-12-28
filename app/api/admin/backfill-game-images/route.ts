import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { backfillSteamImages, discoverAndUpdateGameImages, discoverAllGameImages, updateAllGamesFromIgdb } from '@/lib/fetchers/steam-images'

export const maxDuration = 300 // 5 minutes max

/**
 * Backfill images for games from Steam/IGDB
 * GET /api/admin/backfill-game-images?limit=50
 * GET /api/admin/backfill-game-images?refresh=true - Force refresh all game images
 * GET /api/admin/backfill-game-images?gameId=xxx - Update specific game
 * GET /api/admin/backfill-game-images?discover=true - Auto-discover Steam IDs and update ALL games
 * GET /api/admin/backfill-game-images?igdb=true - Force IGDB-only updates (more accurate covers)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const gameId = searchParams.get('gameId')
    const forceRefresh = searchParams.get('refresh') === 'true'
    const discoverAll = searchParams.get('discover') === 'true'
    const igdbOnly = searchParams.get('igdb') === 'true'

    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - please log in first' }, { status: 401 })
    }

    // If IGDB-only mode - use IGDB API for all games (most accurate)
    if (igdbOnly) {
      const result = await updateAllGamesFromIgdb(limit)
      return NextResponse.json(result)
    }

    // If discover mode - find Steam IDs and update ALL games
    if (discoverAll) {
      const result = await discoverAllGameImages(limit)
      return NextResponse.json(result)
    }

    // If specific game requested
    if (gameId) {
      // Get game name
      const { data: game } = await supabase
        .from('games')
        .select('name')
        .eq('id', gameId)
        .single()

      if (!game) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 })
      }

      const result = await discoverAndUpdateGameImages(gameId, game.name)
      return NextResponse.json(result)
    }

    // Backfill multiple games (only those with existing steam_app_id)
    const result = await backfillSteamImages(limit, forceRefresh)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Backfill error:', error)
    return NextResponse.json({
      error: 'Backfill failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
