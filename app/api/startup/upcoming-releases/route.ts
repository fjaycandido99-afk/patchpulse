import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/startup/upcoming-releases - Get upcoming releases for followed games (next 7 days)
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ releases: [] })
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
      return NextResponse.json({ releases: [] })
    }

    // Get games releasing in the next 7 days
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const { data: games, error } = await supabase
      .from('games')
      .select('id, name, slug, release_date')
      .in('id', uniqueGameIds)
      .gte('release_date', now.toISOString().split('T')[0])
      .lte('release_date', sevenDaysFromNow.toISOString().split('T')[0])
      .order('release_date', { ascending: true })
      .limit(5)

    if (error) {
      console.error('Error fetching upcoming releases:', error)
      return NextResponse.json({ releases: [] })
    }

    // Calculate days until release
    const releases = (games || []).map(game => {
      const releaseDate = new Date(game.release_date)
      const diffTime = releaseDate.getTime() - now.getTime()
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      return {
        id: game.id,
        name: game.name,
        slug: game.slug,
        releaseDate: game.release_date,
        daysUntil: Math.max(0, daysUntil),
      }
    })

    return NextResponse.json({ releases })
  } catch (error) {
    console.error('Error in upcoming-releases API:', error)
    return NextResponse.json({ releases: [] })
  }
}
