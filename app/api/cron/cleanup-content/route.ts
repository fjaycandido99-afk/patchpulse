import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCronAuth } from '@/lib/cron-auth'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: Request) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Extended retention: 7 days instead of 3
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const cutoffDate = sevenDaysAgo.toISOString()

  const results = {
    patches: { deleted: 0, kept: 0, followedGamesKept: 0 },
    news: { deleted: 0, kept: 0, followedGamesKept: 0 },
    recommendations: { deleted: 0, saved: 0 },
  }

  try {
    // Get bookmarked patch IDs to preserve
    const { data: bookmarkedPatches } = await supabase
      .from('bookmarks')
      .select('patch_id')
      .not('patch_id', 'is', null)

    const bookmarkedPatchIds = (bookmarkedPatches?.map(b => b.patch_id).filter(Boolean) || []) as string[]

    // Get all followed game IDs (games that ANY user follows)
    const { data: followedGames } = await supabase
      .from('user_games')
      .select('game_id')

    const followedGameIds = [...new Set(followedGames?.map(g => g.game_id).filter(Boolean) || [])] as string[]

    // Also get games in any user's backlog
    const { data: backlogGames } = await supabase
      .from('backlog_items')
      .select('game_id')

    const backlogGameIds = [...new Set(backlogGames?.map(g => g.game_id).filter(Boolean) || [])] as string[]

    // Combine followed and backlog game IDs
    const preservedGameIds = [...new Set([...followedGameIds, ...backlogGameIds])]

    // Count patches to delete (only for unfollowed games)
    const { count: patchCount } = await supabase
      .from('patch_notes')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', cutoffDate)

    // Delete old patches not in bookmarks AND not for followed/backlog games
    let patchQuery = supabase
      .from('patch_notes')
      .delete()
      .lt('created_at', cutoffDate)

    if (bookmarkedPatchIds.length > 0) {
      patchQuery = patchQuery.not('id', 'in', `(${bookmarkedPatchIds.join(',')})`)
    }

    if (preservedGameIds.length > 0) {
      patchQuery = patchQuery.not('game_id', 'in', `(${preservedGameIds.join(',')})`)
    }

    await patchQuery

    results.patches.deleted = patchCount || 0
    results.patches.kept = bookmarkedPatchIds.length
    results.patches.followedGamesKept = preservedGameIds.length

    // Get bookmarked news IDs to preserve
    const { data: bookmarkedNews } = await supabase
      .from('bookmarks')
      .select('news_id')
      .not('news_id', 'is', null)

    const bookmarkedNewsIds = (bookmarkedNews?.map(b => b.news_id).filter(Boolean) || []) as string[]

    // Count news to delete
    const { count: newsCount } = await supabase
      .from('news_items')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', cutoffDate)

    // Delete old news not in bookmarks AND not for followed/backlog games
    let newsQuery = supabase
      .from('news_items')
      .delete()
      .lt('created_at', cutoffDate)

    if (bookmarkedNewsIds.length > 0) {
      newsQuery = newsQuery.not('id', 'in', `(${bookmarkedNewsIds.join(',')})`)
    }

    if (preservedGameIds.length > 0) {
      newsQuery = newsQuery.not('game_id', 'in', `(${preservedGameIds.join(',')})`)
    }

    await newsQuery

    results.news.deleted = newsCount || 0
    results.news.kept = bookmarkedNewsIds.length
    results.news.followedGamesKept = preservedGameIds.length

    // Clean up old read notifications (older than 7 days)
    // Using same cutoffDate as above

    await supabase
      .from('notifications')
      .delete()
      .lt('created_at', cutoffDate)
      .eq('is_read', true)

    // Clean up expired recommendations (24-hour expiration)
    // Preserve recommendations that are saved/bookmarked by users
    const now = new Date().toISOString()

    // Get saved recommendation game IDs (entity_type = 'recommendation' in bookmarks)
    const { data: savedRecs } = await supabase
      .from('bookmarks')
      .select('entity_id, user_id')
      .eq('entity_type', 'recommendation')

    // Build a map of user_id -> saved game_ids for preserved recommendations
    const savedRecsByUser = new Map<string, Set<string>>()
    savedRecs?.forEach(r => {
      if (!savedRecsByUser.has(r.user_id)) {
        savedRecsByUser.set(r.user_id, new Set())
      }
      savedRecsByUser.get(r.user_id)!.add(r.entity_id)
    })

    results.recommendations.saved = savedRecs?.length || 0

    // Get expired recommendations
    const { data: expiredRecs } = await supabase
      .from('play_recommendations')
      .select('id, user_id, game_id')
      .lt('expires_at', now)
      .eq('is_dismissed', false)

    // Filter out saved recommendations and collect IDs to delete
    const idsToDelete: string[] = []
    expiredRecs?.forEach(rec => {
      const userSaved = savedRecsByUser.get(rec.user_id)
      if (!userSaved || !userSaved.has(rec.game_id)) {
        idsToDelete.push(rec.id)
      }
    })

    // Delete expired, non-saved recommendations in batches
    if (idsToDelete.length > 0) {
      const batchSize = 100
      for (let i = 0; i < idsToDelete.length; i += batchSize) {
        const batch = idsToDelete.slice(i, i + batchSize)
        await supabase
          .from('play_recommendations')
          .delete()
          .in('id', batch)
      }
      results.recommendations.deleted = idsToDelete.length
    }

  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    cutoffDate,
    ...results,
  })
}
