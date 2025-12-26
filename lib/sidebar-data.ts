import { createClient } from '@/lib/supabase/server'

export type SidebarCounts = {
  newPatchesToday: number
  newNewsToday: number
  unreadBacklog: number
  savedUpdates: number
}

export async function getSidebarCounts(): Promise<SidebarCounts | null> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    // Get user's followed games first
    const { data: userGames } = await supabase
      .from('user_games')
      .select('game_id')
      .eq('user_id', user.id)

    const gameIds = userGames?.map(g => g.game_id) || []

    if (gameIds.length === 0) {
      return {
        newPatchesToday: 0,
        newNewsToday: 0,
        unreadBacklog: 0,
        savedUpdates: 0,
      }
    }

    // Count new patches today for followed games
    const { count: patchCount } = await supabase
      .from('patch_notes')
      .select('*', { count: 'exact', head: true })
      .in('game_id', gameIds)
      .gte('published_at', todayISO)

    // Count new news today for followed games
    const { count: newsCount } = await supabase
      .from('news_items')
      .select('*', { count: 'exact', head: true })
      .in('game_id', gameIds)
      .gte('published_at', todayISO)

    // Count unread backlog items (playing/paused with no recent activity)
    const { count: backlogCount } = await supabase
      .from('backlog_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['backlog', 'paused'])

    // Count saved items (bookmarks)
    const { count: savedCount } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return {
      newPatchesToday: patchCount || 0,
      newNewsToday: newsCount || 0,
      unreadBacklog: backlogCount || 0,
      savedUpdates: savedCount || 0,
    }
  } catch {
    return null
  }
}
