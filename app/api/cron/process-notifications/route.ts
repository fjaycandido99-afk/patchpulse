import { NextResponse } from 'next/server'
import { processSmartNotificationQueue } from '@/lib/smart-notification-processor'
import { verifyCronAuth } from '@/lib/cron-auth'

export const runtime = 'nodejs'
export const maxDuration = 60 // 1 minute max

export async function GET(req: Request) {
  console.log('[CRON] process-notifications hit at', new Date().toISOString())

  if (!verifyCronAuth(req)) {
    console.log('[CRON] process-notifications UNAUTHORIZED')
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[CRON] process-notifications AUTHORIZED - processing queue')

  try {
    const result = await processSmartNotificationQueue(20) // Process up to 20 tasks per run

    console.log('[CRON] process-notifications complete:', {
      processed: result.processed,
      notified: result.results.reduce((sum, r) => sum + r.notified, 0),
      skipped: result.results.reduce((sum, r) => sum + r.skipped, 0),
      errors: result.results.filter(r => r.error).length,
    })

    return NextResponse.json({
      ok: true,
      processed: result.processed,
      results: result.results.map(r => ({
        taskId: r.taskId,
        notified: r.notified,
        skipped: r.skipped,
        error: r.error || null,
      })),
      summary: {
        totalNotified: result.results.reduce((sum, r) => sum + r.notified, 0),
        totalSkipped: result.results.reduce((sum, r) => sum + r.skipped, 0),
        errors: result.results.filter(r => r.error).length,
      },
    })
  } catch (error) {
    console.error('[CRON] process-notifications error:', error)
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
