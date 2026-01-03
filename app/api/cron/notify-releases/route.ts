import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyCronAuth } from '@/lib/cron-auth'

export const runtime = 'nodejs'
export const maxDuration = 120 // Extended for both release + saved reminders

export async function GET(req: Request) {
  console.log('[CRON] notify-releases hit at', new Date().toISOString())

  if (!verifyCronAuth(req)) {
    console.log('[CRON] notify-releases UNAUTHORIZED')
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const MAX_DAILY_NOTIFICATIONS = 5 // Don't spam users with too many notifications per day

  try {
    // Get today's date range (start of today to end of today)
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)

    // Find games that released today
    const { data: releasedGames, error: gamesError } = await supabase
      .from('games')
      .select('id, name, slug, cover_url, release_date')
      .gte('release_date', startOfToday.toISOString().split('T')[0])
      .lt('release_date', endOfToday.toISOString().split('T')[0])

    if (gamesError) {
      console.error('[CRON] Error fetching released games:', gamesError)
      throw gamesError
    }

    if (!releasedGames || releasedGames.length === 0) {
      console.log('[CRON] No games released today')
      return NextResponse.json({
        ok: true,
        games_released: 0,
        notifications_sent: 0,
      })
    }

    console.log(`[CRON] Found ${releasedGames.length} games released today:`, releasedGames.map(g => g.name))

    // Get all pro users with active subscriptions
    const { data: proUsers, error: proError } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('plan', 'pro')
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString())

    if (proError) {
      console.error('[CRON] Error fetching pro users:', proError)
      throw proError
    }

    if (!proUsers || proUsers.length === 0) {
      console.log('[CRON] No pro users to notify')
      return NextResponse.json({
        ok: true,
        games_released: releasedGames.length,
        notifications_sent: 0,
      })
    }

    const proUserIds = proUsers.map(u => u.user_id)
    console.log(`[CRON] Found ${proUserIds.length} pro users`)

    // Get games that pro users are following
    const gameIds = releasedGames.map(g => g.id)

    const { data: followers, error: followError } = await supabase
      .from('user_followed_games')
      .select('user_id, game_id')
      .in('user_id', proUserIds)
      .in('game_id', gameIds)

    // Also check backlog items (users tracking these games)
    const { data: backlogUsers, error: backlogError } = await supabase
      .from('backlog_items')
      .select('user_id, game_id')
      .in('user_id', proUserIds)
      .in('game_id', gameIds)

    // Combine followers and backlog users (deduplicate)
    const userGameMap = new Map<string, Set<string>>()

    for (const f of followers || []) {
      if (!userGameMap.has(f.user_id)) {
        userGameMap.set(f.user_id, new Set())
      }
      userGameMap.get(f.user_id)!.add(f.game_id)
    }

    for (const b of backlogUsers || []) {
      if (!userGameMap.has(b.user_id)) {
        userGameMap.set(b.user_id, new Set())
      }
      userGameMap.get(b.user_id)!.add(b.game_id)
    }

    // Create game lookup map
    const gameMap = new Map(releasedGames.map(g => [g.id, g]))

    // Check for existing notifications to avoid duplicates (from last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: existingNotifications } = await supabase
      .from('notifications')
      .select('user_id, game_id')
      .eq('type', 'game_release')
      .gte('created_at', oneDayAgo)

    const existingKeys = new Set(
      (existingNotifications || []).map(n => `${n.user_id}-${n.game_id}`)
    )

    // Check daily notification count per user to avoid spam
    const { data: todayNotifications } = await supabase
      .from('notifications')
      .select('user_id')
      .gte('created_at', startOfToday.toISOString())

    const userDailyCount = new Map<string, number>()
    for (const n of todayNotifications || []) {
      userDailyCount.set(n.user_id, (userDailyCount.get(n.user_id) || 0) + 1)
    }

    // Create notifications
    const notificationsToCreate: Array<{
      user_id: string
      type: string
      title: string
      body: string
      priority: number
      game_id: string
      metadata: Record<string, unknown>
    }> = []

    for (const [userId, gameIds] of userGameMap.entries()) {
      // Skip users who have already hit daily cap
      const currentCount = userDailyCount.get(userId) || 0
      if (currentCount >= MAX_DAILY_NOTIFICATIONS) continue

      for (const gameId of gameIds) {
        // Re-check cap as we add more
        const updatedCount = userDailyCount.get(userId) || 0
        if (updatedCount >= MAX_DAILY_NOTIFICATIONS) break

        const notifyKey = `${userId}-${gameId}`
        if (existingKeys.has(notifyKey)) continue

        const game = gameMap.get(gameId)
        if (!game) continue

        // Track that we're adding one
        userDailyCount.set(userId, updatedCount + 1)

        notificationsToCreate.push({
          user_id: userId,
          type: 'game_release',
          title: `${game.name} is out now!`,
          body: `A game you're tracking just released. Time to dive in!`,
          priority: 5, // High priority for releases
          game_id: gameId,
          metadata: {
            game_name: game.name,
            game_slug: game.slug,
            cover_url: game.cover_url,
            release_date: game.release_date,
          },
        })
      }
    }

    let notificationsSent = 0
    if (notificationsToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notificationsToCreate)

      if (insertError) {
        console.error('[CRON] Error creating release notifications:', insertError)
        throw insertError
      }

      notificationsSent = notificationsToCreate.length
      console.log(`[CRON] Created ${notificationsSent} game release notifications`)
    }

    // === SAVED CONTENT REMINDERS FOR PRO USERS ===
    // Only remind every 14 days to avoid being annoying
    // Priority 1 = won't trigger push notifications or toasts, just shows in notification list
    let savedReminders = 0
    try {
      // Find pro users with bookmarks who haven't been reminded in last 14 days
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

      // Get pro users who have bookmarks
      const { data: usersWithBookmarks } = await supabase
        .from('bookmarks')
        .select('user_id')
        .in('user_id', proUserIds)

      if (usersWithBookmarks && usersWithBookmarks.length > 0) {
        // Get unique user IDs
        const usersWithSaved = [...new Set(usersWithBookmarks.map(b => b.user_id))]

        // Check which users already got a saved_reminder in the last 14 days
        const { data: recentReminders } = await supabase
          .from('notifications')
          .select('user_id')
          .eq('type', 'saved_reminder')
          .gte('created_at', fourteenDaysAgo)
          .in('user_id', usersWithSaved)

        const alreadyReminded = new Set((recentReminders || []).map(r => r.user_id))

        // Get bookmark counts for users who haven't been reminded
        const usersToRemind = usersWithSaved.filter(uid => !alreadyReminded.has(uid))

        if (usersToRemind.length > 0) {
          // Get bookmark counts per user
          const { data: bookmarkCounts } = await supabase
            .from('bookmarks')
            .select('user_id, entity_type')
            .in('user_id', usersToRemind)

          // Group by user
          const userBookmarkInfo = new Map<string, { patches: number; news: number; deals: number; total: number }>()

          for (const b of bookmarkCounts || []) {
            if (!userBookmarkInfo.has(b.user_id)) {
              userBookmarkInfo.set(b.user_id, { patches: 0, news: 0, deals: 0, total: 0 })
            }
            const info = userBookmarkInfo.get(b.user_id)!
            info.total++
            if (b.entity_type === 'patch') info.patches++
            if (b.entity_type === 'news') info.news++
            if (b.entity_type === 'deal') info.deals++
          }

          // Create reminders for users with 3+ bookmarks
          const savedRemindersToCreate: Array<{
            user_id: string
            type: string
            title: string
            body: string
            priority: number
            metadata: Record<string, unknown>
          }> = []

          for (const [userId, info] of userBookmarkInfo.entries()) {
            // Skip if user hit daily notification cap
            const currentCount = userDailyCount.get(userId) || 0
            if (currentCount >= MAX_DAILY_NOTIFICATIONS) continue

            if (info.total >= 3) {
              const parts = []
              if (info.patches > 0) parts.push(`${info.patches} patch${info.patches > 1 ? 'es' : ''}`)
              if (info.news > 0) parts.push(`${info.news} article${info.news > 1 ? 's' : ''}`)
              if (info.deals > 0) parts.push(`${info.deals} deal${info.deals > 1 ? 's' : ''}`)

              savedRemindersToCreate.push({
                user_id: userId,
                type: 'saved_reminder',
                title: `You have ${info.total} saved items`,
                body: `Check your saved ${parts.join(', ')} when you have time.`,
                priority: 1, // Lowest priority - no push/toast, just in-app
                metadata: {
                  bookmark_count: info.total,
                  patches: info.patches,
                  news: info.news,
                  deals: info.deals,
                },
              })
            }
          }

          if (savedRemindersToCreate.length > 0) {
            const { error: reminderError } = await supabase
              .from('notifications')
              .insert(savedRemindersToCreate)

            if (reminderError) {
              console.error('[CRON] Error creating saved reminders:', reminderError)
            } else {
              savedReminders = savedRemindersToCreate.length
              console.log(`[CRON] Created ${savedReminders} saved content reminders`)
            }
          }
        }
      }
    } catch (savedError) {
      console.error('[CRON] Error in saved reminders:', savedError)
      // Don't fail the whole job
    }

    return NextResponse.json({
      ok: true,
      games_released: releasedGames.length,
      games: releasedGames.map(g => g.name),
      release_notifications: notificationsSent,
      saved_reminders: savedReminders,
    })
  } catch (error) {
    console.error('[CRON] notify-releases error:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
