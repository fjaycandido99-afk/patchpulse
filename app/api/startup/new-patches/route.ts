import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/startup/new-patches - Get count of new patches for followed games since last visit
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const since = searchParams.get('since')

  if (!since) {
    return NextResponse.json({ count: 0 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ count: 0 })
  }

  try {
    // Get user's followed game IDs
    const [followedResult, backlogResult] = await Promise.all([
      supabase.from('user_games').select('game_id').eq('user_id', user.id),
      supabase.from('backlog_items').select('game_id').eq('user_id', user.id),
    ])

    const gameIds = [
      ...(followedResult.data || []).map(ug => ug.game_id),
      ...(backlogResult.data || []).map(bi => bi.game_id),
    ]
    const uniqueGameIds = [...new Set(gameIds)]

    if (uniqueGameIds.length === 0) {
      return NextResponse.json({ count: 0 })
    }

    // Count patches for followed games since the given date
    const { count, error } = await supabase
      .from('patch_notes')
      .select('id', { count: 'exact', head: true })
      .in('game_id', uniqueGameIds)
      .gte('published_at', since)

    if (error) {
      console.error('Error counting new patches:', error)
      return NextResponse.json({ count: 0 })
    }

    return NextResponse.json({ count: count || 0 })
  } catch (error) {
    console.error('Error in new-patches API:', error)
    return NextResponse.json({ count: 0 })
  }
}
