import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  // Simple auth check - require secret
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret')

  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    // Allow on Vercel without secret for admin use
    if (process.env.VERCEL !== '1') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const supabase = createAdminClient()

    // Delete all news items older than 1 hour (keeps very recent ones)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const { error, count } = await supabase
      .from('news_items')
      .delete()
      .lt('created_at', oneHourAgo)
      .select('id', { count: 'exact' })

    if (error) {
      console.error('Error clearing news:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[ADMIN] Cleared ${count} old news items`)

    return NextResponse.json({
      ok: true,
      cleared: count,
      message: `Cleared ${count} news items. New fetch will add fresh content.`
    })
  } catch (error) {
    console.error('Error in clear-news:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
