import { createClient } from '@/lib/supabase/server'

export type Notification = {
  id: string
  type: 'new_patch' | 'new_news' | 'game_release' | 'ai_digest' | 'price_drop' | 'system'
  title: string
  body: string | null
  priority: number
  game_id: string | null
  patch_id: string | null
  news_id: string | null
  metadata: Record<string, unknown>
  is_read: boolean
  read_at: string | null
  created_at: string
  game?: {
    id: string
    name: string
    slug: string
    cover_url: string | null
  } | null
}

export type NotificationStats = {
  unread_count: number
  high_priority_count: number
}

export async function getNotifications(limit = 20): Promise<Notification[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      id,
      type,
      title,
      body,
      priority,
      game_id,
      patch_id,
      news_id,
      metadata,
      is_read,
      read_at,
      created_at,
      games:game_id (
        id,
        name,
        slug,
        cover_url
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return (data || []).map(n => ({
    ...n,
    game: Array.isArray(n.games) ? n.games[0] : n.games,
  })) as Notification[]
}

export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return 0

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    console.error('Error fetching unread count:', error)
    return 0
  }

  return count || 0
}

export async function getNotificationStats(): Promise<NotificationStats> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { unread_count: 0, high_priority_count: 0 }

  // Get unread count
  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  // Get high priority unread count
  const { count: highPriorityCount } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)
    .gte('priority', 4)

  return {
    unread_count: unreadCount || 0,
    high_priority_count: highPriorityCount || 0,
  }
}

export async function markAsRead(notificationIds: string[]): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .in('id', notificationIds)

  if (error) {
    console.error('Error marking notifications as read:', error)
    return false
  }

  return true
}

export async function markAllAsRead(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    console.error('Error marking all notifications as read:', error)
    return false
  }

  return true
}
