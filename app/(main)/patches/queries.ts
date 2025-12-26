import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

type Platform = {
  id: string
  name: string
  icon_url: string | null
}

type Game = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  brand_color: string | null
  cover_url: string | null
  hero_url?: string | null
  platforms: Platform[]
}

type PatchListItem = {
  id: string
  title: string
  published_at: string
  summary_tldr: string | null
  tags: string[]
  impact_score: number
  source_url: string | null
  game: Game
}

type PatchDetail = {
  id: string
  title: string
  published_at: string
  source_url: string | null
  raw_text: string | null
  summary_tldr: string | null
  key_changes: unknown
  ai_insight: string | null
  tags: string[]
  impact_score: number
  created_at: string
  game: Game
}

type PatchFiltersData = {
  followedGames: Game[]
  availableTags: string[]
}

type PatchesListParams = {
  gameId?: string
  tag?: string
  importance?: 'major' | 'medium' | 'minor'
  page?: number
}

type PatchesListResult = {
  items: PatchListItem[]
  page: number
  pageSize: number
  hasMore: boolean
  total: number
}

const PAGE_SIZE = 12

// Featured patches for carousel (most recent major patches)
export type FeaturedPatch = PatchListItem & {
  ai_insight?: string | null
}

export async function getFeaturedPatches(limit = 5): Promise<FeaturedPatch[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let query = supabase
    .from('patch_notes')
    .select(
      `
      id,
      title,
      published_at,
      summary_tldr,
      ai_insight,
      tags,
      impact_score,
      source_url,
      games!inner(
        id,
        name,
        slug,
        logo_url,
        brand_color,
        cover_url,
        hero_url,
        game_platforms(
          platforms(id, name, icon_url)
        )
      )
    `
    )
    .gte('impact_score', 7) // Only significant patches
    .order('published_at', { ascending: false })
    .limit(limit)

  if (user) {
    const { data: userGames } = await supabase
      .from('user_games')
      .select('game_id')
      .eq('user_id', user.id)

    if (userGames && userGames.length > 0) {
      const followedGameIds = userGames.map((ug) => ug.game_id)
      query = query.in('game_id', followedGameIds)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching featured patches:', error)
    return []
  }

  return (data || []).map((patch) => {
    const gameData = patch.games as unknown as {
      id: string
      name: string
      slug: string
      logo_url: string | null
      brand_color: string | null
      cover_url: string | null
      hero_url?: string | null
      game_platforms: Array<{ platforms: Platform | null }>
    }

    const platforms: Platform[] = gameData.game_platforms
      ?.map((gp) => gp.platforms)
      .filter((p): p is Platform => p !== null) || []

    return {
      id: patch.id,
      title: patch.title,
      published_at: patch.published_at,
      summary_tldr: patch.summary_tldr,
      tags: patch.tags || [],
      impact_score: patch.impact_score,
      source_url: patch.source_url,
      ai_insight: (patch as { ai_insight?: string | null }).ai_insight || null,
      game: {
        id: gameData.id,
        name: gameData.name,
        slug: gameData.slug,
        logo_url: gameData.logo_url,
        brand_color: gameData.brand_color,
        cover_url: gameData.cover_url,
        hero_url: gameData.hero_url,
        platforms,
      },
    }
  })
}

// Get biggest changes (major impact patches)
export async function getBiggestChanges(limit = 6): Promise<PatchListItem[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let query = supabase
    .from('patch_notes')
    .select(
      `
      id,
      title,
      published_at,
      summary_tldr,
      tags,
      impact_score,
      source_url,
      games!inner(
        id,
        name,
        slug,
        logo_url,
        brand_color,
        cover_url,
        game_platforms(
          platforms(id, name, icon_url)
        )
      )
    `
    )
    .gte('impact_score', 8) // Only major patches
    .order('published_at', { ascending: false })
    .limit(limit)

  if (user) {
    const { data: userGames } = await supabase
      .from('user_games')
      .select('game_id')
      .eq('user_id', user.id)

    if (userGames && userGames.length > 0) {
      const followedGameIds = userGames.map((ug) => ug.game_id)
      query = query.in('game_id', followedGameIds)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching biggest changes:', error)
    return []
  }

  return (data || []).map((patch) => {
    const gameData = patch.games as unknown as {
      id: string
      name: string
      slug: string
      logo_url: string | null
      brand_color: string | null
      cover_url: string | null
      game_platforms: Array<{ platforms: Platform | null }>
    }

    const platforms: Platform[] = gameData.game_platforms
      ?.map((gp) => gp.platforms)
      .filter((p): p is Platform => p !== null) || []

    return {
      id: patch.id,
      title: patch.title,
      published_at: patch.published_at,
      summary_tldr: patch.summary_tldr,
      tags: patch.tags || [],
      impact_score: patch.impact_score,
      source_url: patch.source_url,
      game: {
        id: gameData.id,
        name: gameData.name,
        slug: gameData.slug,
        logo_url: gameData.logo_url,
        brand_color: gameData.brand_color,
        cover_url: gameData.cover_url,
        platforms,
      },
    }
  })
}

function getImpactScoreRange(importance: 'major' | 'medium' | 'minor'): [number, number] {
  switch (importance) {
    case 'major':
      return [8, 10]
    case 'medium':
      return [5, 7]
    case 'minor':
      return [1, 4]
  }
}

export async function getPatchFiltersData(): Promise<PatchFiltersData> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let followedGames: Game[] = []

  if (user) {
    const { data: userGames } = await supabase
      .from('user_games')
      .select('games(id, name, slug)')
      .eq('user_id', user.id)
      .order('games(name)', { ascending: true })

    if (userGames && userGames.length > 0) {
      followedGames = userGames
        .map((ug) => (ug.games as unknown as Game))
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name))
    }
  }

  let tagsQuery = supabase
    .from('patch_notes')
    .select('tags')

  if (followedGames.length > 0) {
    const gameIds = followedGames.map((g) => g.id)
    tagsQuery = tagsQuery.in('game_id', gameIds)
  }

  const { data: patchesWithTags } = await tagsQuery

  const tagSet = new Set<string>()
  if (patchesWithTags) {
    for (const patch of patchesWithTags) {
      if (Array.isArray(patch.tags)) {
        for (const tag of patch.tags) {
          tagSet.add(tag)
        }
      }
    }
  }

  const availableTags = Array.from(tagSet).sort()

  return {
    followedGames,
    availableTags,
  }
}

export async function getPatchesList(
  params: PatchesListParams = {}
): Promise<PatchesListResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { gameId, tag, importance, page = 1 } = params
  const offset = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('patch_notes')
    .select(
      `
      id,
      title,
      published_at,
      summary_tldr,
      tags,
      impact_score,
      source_url,
      games!inner(
        id,
        name,
        slug,
        logo_url,
        brand_color,
        cover_url,
        game_platforms(
          platforms(id, name, icon_url)
        )
      )
    `,
      { count: 'exact' }
    )

  if (gameId) {
    query = query.eq('game_id', gameId)
  } else if (user) {
    const { data: userGames } = await supabase
      .from('user_games')
      .select('game_id')
      .eq('user_id', user.id)

    if (userGames && userGames.length > 0) {
      const followedGameIds = userGames.map((ug) => ug.game_id)
      query = query.in('game_id', followedGameIds)
    }
  }

  if (tag) {
    query = query.contains('tags', [tag])
  }

  if (importance) {
    const [minScore, maxScore] = getImpactScoreRange(importance)
    query = query.gte('impact_score', minScore).lte('impact_score', maxScore)
  }

  query = query
    .order('published_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE)

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching patches:', error)
    return {
      items: [],
      page,
      pageSize: PAGE_SIZE,
      hasMore: false,
      total: 0,
    }
  }

  const items: PatchListItem[] = (data || []).map((patch) => {
    const gameData = patch.games as unknown as {
      id: string
      name: string
      slug: string
      logo_url: string | null
      brand_color: string | null
      cover_url: string | null
      game_platforms: Array<{ platforms: Platform | null }>
    }

    // Extract platforms from the nested junction table
    const platforms: Platform[] = gameData.game_platforms
      ?.map((gp) => gp.platforms)
      .filter((p): p is Platform => p !== null) || []

    return {
      id: patch.id,
      title: patch.title,
      published_at: patch.published_at,
      summary_tldr: patch.summary_tldr,
      tags: patch.tags,
      impact_score: patch.impact_score,
      source_url: patch.source_url,
      game: {
        id: gameData.id,
        name: gameData.name,
        slug: gameData.slug,
        logo_url: gameData.logo_url,
        brand_color: gameData.brand_color,
        cover_url: gameData.cover_url,
        platforms,
      },
    }
  })

  const totalCount = count || 0
  const hasMore = offset + items.length < totalCount

  return {
    items,
    page,
    pageSize: PAGE_SIZE,
    hasMore,
    total: totalCount,
  }
}

export async function getPatchById(patchId: string): Promise<PatchDetail> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('patch_notes')
    .select(
      `
      id,
      title,
      published_at,
      source_url,
      raw_text,
      summary_tldr,
      key_changes,
      ai_insight,
      tags,
      impact_score,
      created_at,
      games!inner(id, name, slug, logo_url, brand_color, cover_url, hero_url)
    `
    )
    .eq('id', patchId)
    .single()

  if (error || !data) {
    notFound()
  }

  return {
    id: data.id,
    title: data.title,
    published_at: data.published_at,
    source_url: data.source_url,
    raw_text: data.raw_text,
    summary_tldr: data.summary_tldr,
    key_changes: data.key_changes,
    ai_insight: (data as { ai_insight?: string | null }).ai_insight || null,
    tags: data.tags,
    impact_score: data.impact_score,
    created_at: data.created_at,
    game: data.games as unknown as Game,
  }
}

export type RelatedPatch = {
  id: string
  title: string
  published_at: string
  impact_score: number
  game_name: string
}

export async function getRelatedPatches(
  patchId: string,
  gameId: string,
  tags: string[],
  limit = 4
): Promise<RelatedPatch[]> {
  const supabase = await createClient()

  // Get patches from the same game
  const { data } = await supabase
    .from('patch_notes')
    .select('id, title, published_at, impact_score, games!inner(name)')
    .eq('game_id', gameId)
    .neq('id', patchId)
    .order('published_at', { ascending: false })
    .limit(limit)

  return (data || []).map((item) => ({
    id: item.id,
    title: item.title,
    published_at: item.published_at,
    impact_score: item.impact_score,
    game_name: (item.games as unknown as { name: string }).name,
  }))
}
