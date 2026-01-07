import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { backfillSteamImages, discoverAndUpdateGameImages, discoverAllGameImages, updateAllGamesFromIgdb } from '@/lib/fetchers/steam-images'
import { verifyCronAuth } from '@/lib/cron-auth'

export const maxDuration = 300 // 5 minutes max

/**
 * Backfill images for games from Steam/IGDB
 * GET /api/admin/backfill-game-images?limit=50
 * GET /api/admin/backfill-game-images?refresh=true - Force refresh all game images
 * GET /api/admin/backfill-game-images?gameId=xxx - Update specific game by ID
 * GET /api/admin/backfill-game-images?gameName=xxx - Update specific game by name (e.g. "Path of Exile 2")
 * GET /api/admin/backfill-game-images?discover=true - Auto-discover Steam IDs and update ALL games
 * GET /api/admin/backfill-game-images?refreshAll=true&offset=0&limit=100 - Refresh ALL games with pagination
 * GET /api/admin/backfill-game-images?igdb=true - Force IGDB-only updates (more accurate covers)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const gameId = searchParams.get('gameId')
    const gameName = searchParams.get('gameName')
    const forceRefresh = searchParams.get('refresh') === 'true'
    const discoverAll = searchParams.get('discover') === 'true'
    const refreshAll = searchParams.get('refreshAll') === 'true'
    const igdbOnly = searchParams.get('igdb') === 'true'

    // Allow cron auth OR user auth
    const hasCronAuth = verifyCronAuth(request)

    if (!hasCronAuth) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized - please log in or use cron auth' }, { status: 401 })
      }
    }

    // If IGDB-only mode - use IGDB API for all games (most accurate)
    if (igdbOnly) {
      const result = await updateAllGamesFromIgdb(limit)
      return NextResponse.json(result)
    }

    // If discover mode - find Steam IDs and update ALL games
    if (discoverAll || refreshAll) {
      const result = await discoverAllGameImages(limit, offset, refreshAll)
      return NextResponse.json(result)
    }

    // If specific game requested by ID or name
    if (gameId || gameName) {
      const supabase = await createClient()

      let game: { id: string; name: string } | null = null

      if (gameId) {
        const { data } = await supabase
          .from('games')
          .select('id, name')
          .eq('id', gameId)
          .single()
        game = data
      } else if (gameName) {
        // Search by name (case insensitive)
        const { data } = await supabase
          .from('games')
          .select('id, name')
          .ilike('name', gameName)
          .single()
        game = data
      }

      if (!game) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 })
      }

      const result = await discoverAndUpdateGameImages(game.id, game.name)
      return NextResponse.json({ ...result, gameName: game.name })
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
