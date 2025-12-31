import { createClient } from '@/lib/supabase/server'

export type GameActivity = {
  id: string
  gameId: string
  gameName: string
  gameSlug: string
  gameCoverUrl: string | null
  gameLogoUrl: string | null
  gameBrandColor: string | null
  // Unread counts
  unreadPatchCount: number
  unreadNewsCount: number
  totalUnread: number
  // Latest activity
  latestPatchId: string | null
  latestPatchAt: string | null
  latestPatchTitle: string | null
  latestPatchSeverity: number
  latestNewsId: string | null
  latestNewsAt: string | null
  // Last seen timestamps
  lastSeenPatchAt: string | null
  lastSeenNewsAt: string | null
  // Backlog info
  backlogId: string | null
  backlogStatus: string | null
  // Settings
  notifyPatches: boolean
  notifyNews: boolean
}

/**
 * Get all followed games with their activity data
 * Sorted by: unread count DESC, latest activity DESC, name ASC
 */
export async function getLibraryWithActivity(): Promise<GameActivity[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('user_followed_games')
    .select(`
      id,
      game_id,
      notify_patches,
      notify_news,
      unread_patch_count,
      unread_news_count,
      latest_patch_id,
      latest_patch_at,
      latest_patch_title,
      latest_patch_severity,
      latest_news_id,
      latest_news_at,
      last_seen_patch_at,
      last_seen_news_at,
      games (
        id,
        name,
        slug,
        cover_url,
        logo_url,
        brand_color
      )
    `)
    .eq('user_id', user.id)
    .order('unread_patch_count', { ascending: false })

  if (error || !data) {
    console.error('Error fetching library activity:', error)
    return []
  }

  // Get backlog items for these games
  const gameIds = data.map(item => item.game_id)
  const { data: backlogItems } = await supabase
    .from('backlog_items')
    .select('id, game_id, status')
    .eq('user_id', user.id)
    .in('game_id', gameIds)

  const backlogMap = new Map(backlogItems?.map(b => [b.game_id, { id: b.id, status: b.status }]) || [])

  const results: GameActivity[] = data.map(item => {
    const game = item.games as unknown as { id: string; name: string; slug: string; cover_url: string | null; logo_url: string | null; brand_color: string | null } | null
    const backlog = backlogMap.get(item.game_id)

    return {
      id: item.id,
      gameId: item.game_id,
      gameName: game?.name || 'Unknown Game',
      gameSlug: game?.slug || '',
      gameCoverUrl: game?.cover_url || null,
      gameLogoUrl: game?.logo_url || null,
      gameBrandColor: game?.brand_color || null,
      unreadPatchCount: item.unread_patch_count || 0,
      unreadNewsCount: item.unread_news_count || 0,
      totalUnread: (item.unread_patch_count || 0) + (item.unread_news_count || 0),
      latestPatchId: item.latest_patch_id,
      latestPatchAt: item.latest_patch_at,
      latestPatchTitle: item.latest_patch_title,
      latestPatchSeverity: item.latest_patch_severity || 50,
      latestNewsId: item.latest_news_id,
      latestNewsAt: item.latest_news_at,
      lastSeenPatchAt: item.last_seen_patch_at,
      lastSeenNewsAt: item.last_seen_news_at,
      backlogId: backlog?.id || null,
      backlogStatus: backlog?.status || null,
      notifyPatches: item.notify_patches,
      notifyNews: item.notify_news,
    }
  })

  // Sort: unread first, then by latest activity, then alphabetically
  results.sort((a, b) => {
    // First by total unread (descending)
    if (a.totalUnread !== b.totalUnread) {
      return b.totalUnread - a.totalUnread
    }
    // Then by latest activity
    const aLatest = a.latestPatchAt || a.latestNewsAt || ''
    const bLatest = b.latestPatchAt || b.latestNewsAt || ''
    if (aLatest !== bLatest) {
      return bLatest.localeCompare(aLatest)
    }
    // Finally alphabetically
    return a.gameName.localeCompare(b.gameName)
  })

  return results
}

/**
 * Get total unread count across all followed games
 */
export async function getTotalUnreadCount(): Promise<{ patches: number; news: number; total: number }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { patches: 0, news: 0, total: 0 }

  const { data, error } = await supabase
    .from('user_followed_games')
    .select('unread_patch_count, unread_news_count')
    .eq('user_id', user.id)

  if (error || !data) {
    return { patches: 0, news: 0, total: 0 }
  }

  const patches = data.reduce((sum, item) => sum + (item.unread_patch_count || 0), 0)
  const news = data.reduce((sum, item) => sum + (item.unread_news_count || 0), 0)

  return { patches, news, total: patches + news }
}

/**
 * Get games that need attention (unread updates)
 */
export async function getGamesNeedingAttention(limit = 5): Promise<GameActivity[]> {
  const allGames = await getLibraryWithActivity()
  return allGames.filter(g => g.totalUnread > 0).slice(0, limit)
}
