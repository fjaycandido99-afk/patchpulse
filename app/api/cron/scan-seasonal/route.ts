import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { queueAIJob } from '@/lib/ai/jobs'
import { verifyCronAuth } from '@/lib/cron-auth'

export const runtime = 'nodejs'
export const maxDuration = 60 // 1 minute max for seasonal scan

export async function GET(req: Request) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await scanForSeasonalArtwork()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('Seasonal scan failed:', error)
    return NextResponse.json(
      { ok: false, error: 'Scan failed' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  return GET(req)
}

async function scanForSeasonalArtwork(): Promise<{
  scanned: number
  queued: number
}> {
  const supabase = createAdminClient()

  // Get games that need seasonal scanning
  // Priority: live service games, games with recent activity, popular games
  const { data: games, error } = await supabase
    .from('games')
    .select('id, name')
    .or('is_live_service.eq.true,mvp_eligible.eq.true')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error || !games) {
    console.error('Failed to fetch games for seasonal scan:', error)
    return { scanned: 0, queued: 0 }
  }

  let queued = 0

  for (const game of games) {
    // Check if we already have a pending discovery job
    const { data: existingJob } = await supabase
      .from('ai_jobs')
      .select('id')
      .eq('job_type', 'DISCOVER_SEASONAL')
      .eq('entity_id', game.id)
      .in('status', ['pending', 'running'])
      .single()

    if (existingJob) continue

    // Check if we recently scanned this game (within 7 days)
    const { data: recentScan } = await supabase
      .from('seasonal_discovery_queue')
      .select('id')
      .eq('game_id', game.id)
      .gte('last_attempt_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .single()

    if (recentScan) continue

    // Create discovery queue entry
    await supabase.from('seasonal_discovery_queue').upsert(
      {
        game_id: game.id,
        trigger_reason: 'scheduled_scan',
        status: 'searching',
        attempts: 0,
      },
      { onConflict: 'game_id' }
    )

    // Queue the AI job
    const result = await queueAIJob('DISCOVER_SEASONAL', game.id)
    if ('id' in result) {
      queued++
    }
  }

  return {
    scanned: games.length,
    queued,
  }
}
