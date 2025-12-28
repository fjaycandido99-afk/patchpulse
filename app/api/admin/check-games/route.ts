import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/admin/check-games - See current game data
export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get games that are upcoming or recent
  const today = new Date()
  const oneYearFromNow = new Date(today)
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: games } = await supabase
    .from('games')
    .select('id, name, slug, cover_url, release_date')
    .or(`release_date.gte.${thirtyDaysAgo.toISOString().split('T')[0]},release_date.lte.${oneYearFromNow.toISOString().split('T')[0]}`)
    .order('name')

  return NextResponse.json({
    count: games?.length || 0,
    games: games?.map(g => ({
      name: g.name,
      slug: g.slug,
      cover_url: g.cover_url,
      release_date: g.release_date
    }))
  })
}
