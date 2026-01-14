import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(request: Request) {
  // Rate limit: 20 requests per minute
  const rateLimit = checkRateLimit(request, RATE_LIMITS.search)
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit)
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim()

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  const supabase = await createClient()

  // Search games by name (fast, limited results)
  const { data: games } = await supabase
    .from('games')
    .select('id, name, cover_url')
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(6)

  const suggestions = games?.map(g => ({
    id: g.id,
    name: g.name,
    cover_url: g.cover_url,
    type: 'game' as const,
  })) || []

  return NextResponse.json({ suggestions })
}
