import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    // Check for admin auth
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const daysBack = parseInt(searchParams.get('days') || '30')

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysBack)

    // Find patches that don't have diff_stats yet
    const { data: patches, error: fetchError } = await supabase
      .from('patch_notes')
      .select('id, title')
      .is('diff_stats', null)
      .not('raw_text', 'is', null)
      .gte('published_at', cutoffDate.toISOString())
      .order('published_at', { ascending: false })
      .limit(limit)

    if (fetchError) {
      console.error('Error fetching patches:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch patches' }, { status: 500 })
    }

    if (!patches || patches.length === 0) {
      return NextResponse.json({
        message: 'No patches need backfill',
        queued: 0,
      })
    }

    // Queue AI jobs for these patches
    let queued = 0
    const errors: string[] = []

    for (const patch of patches) {
      const { error: queueError } = await supabase
        .from('ai_jobs')
        .upsert(
          {
            job_type: 'PATCH_SUMMARY',
            entity_id: patch.id,
            status: 'pending',
          },
          {
            onConflict: 'job_type,entity_id',
            ignoreDuplicates: true,
          }
        )

      if (queueError) {
        errors.push(`Failed to queue ${patch.id}: ${queueError.message}`)
      } else {
        queued++
      }
    }

    return NextResponse.json({
      message: `Queued ${queued} patches for diff_stats backfill`,
      queued,
      total_found: patches.length,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
    })
  } catch (error) {
    console.error('Backfill error:', error)
    return NextResponse.json(
      { error: 'Failed to backfill diff stats' },
      { status: 500 }
    )
  }
}

// Also support GET for easy testing
export async function GET(request: Request) {
  return POST(request)
}
