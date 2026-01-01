import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enrichMissingGameData } from '@/lib/ai/game-discovery'

// POST /api/admin/enrich-games - Backfill missing game data (developer, publisher, similar games)
export async function POST(request: Request) {
  // Check admin auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const limit = Math.min(body.limit || 20, 50) // Max 50 at a time

    const result = await enrichMissingGameData(limit)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('Enrich games error:', error)
    return NextResponse.json(
      { error: 'Failed to enrich games' },
      { status: 500 }
    )
  }
}
