import { NextResponse } from 'next/server'
import { getNotifications, getNotificationStats, markAsRead, markAllAsRead } from '@/lib/notifications'

// GET /api/notifications - Fetch notifications
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const statsOnly = searchParams.get('stats') === 'true'

  if (statsOnly) {
    const stats = await getNotificationStats()
    return NextResponse.json(stats)
  }

  const notifications = await getNotifications(limit)
  const stats = await getNotificationStats()

  return NextResponse.json({
    notifications,
    stats,
  })
}

// POST /api/notifications - Mark notifications as read
export async function POST(request: Request) {
  const body = await request.json()
  const { action, notificationIds } = body

  if (action === 'mark_read' && Array.isArray(notificationIds)) {
    const success = await markAsRead(notificationIds)
    return NextResponse.json({ success })
  }

  if (action === 'mark_all_read') {
    const success = await markAllAsRead()
    return NextResponse.json({ success })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
