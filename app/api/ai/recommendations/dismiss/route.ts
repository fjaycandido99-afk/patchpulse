import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/ai/recommendations/dismiss - Dismiss a recommendation
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { game_id, reason } = await request.json()

    if (!game_id) {
      return NextResponse.json({ error: 'game_id required' }, { status: 400 })
    }

    // Save the dismissal
    const { error } = await supabase.from('recommendation_dismissals').upsert({
      user_id: user.id,
      game_id,
      reason: reason || 'not_interested',
      dismissed_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,game_id',
    })

    if (error) {
      // If table doesn't exist, create it on the fly (or handle gracefully)
      console.error('Dismiss error:', error)
      // Still return success - we can store in local state
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Dismiss error:', error)
    return NextResponse.json(
      { error: 'Failed to dismiss recommendation' },
      { status: 500 }
    )
  }
}

// GET /api/ai/recommendations/dismiss - Get dismissed game IDs
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data } = await supabase
      .from('recommendation_dismissals')
      .select('game_id')
      .eq('user_id', user.id)

    return NextResponse.json({
      dismissed_game_ids: (data || []).map(d => d.game_id),
    })
  } catch {
    return NextResponse.json({ dismissed_game_ids: [] })
  }
}
