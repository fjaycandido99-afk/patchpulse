import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PatchesList } from './PatchesList'

export const metadata: Metadata = {
  title: 'All Patches | PatchPulse',
  description: 'Browse all game patches and updates',
}

type PatchData = {
  id: string
  title: string
  published_at: string
  summary_tldr: string | null
  impact_score: number
  game: {
    id: string
    name: string
    slug: string
    cover_url: string | null
  }
}

async function getPatches(limit = 50): Promise<PatchData[]> {
  const supabase = await createClient()

  // Only show patches from the last 2 months to stay relevant
  const twoMonthsAgo = new Date()
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

  const { data, error } = await supabase
    .from('patch_notes')
    .select(`
      id,
      title,
      published_at,
      summary_tldr,
      impact_score,
      games!inner(
        id,
        name,
        slug,
        cover_url
      )
    `)
    .gte('published_at', twoMonthsAgo.toISOString())
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching patches:', error)
    return []
  }

  return (data || []).map((patch) => {
    const gameData = patch.games as unknown as {
      id: string
      name: string
      slug: string
      cover_url: string | null
    }
    return {
      id: patch.id,
      title: patch.title,
      published_at: patch.published_at,
      summary_tldr: patch.summary_tldr,
      impact_score: patch.impact_score,
      game: gameData,
    }
  })
}

// Fetch ALL patches for user's followed games (no limit)
async function getFollowedGamesPatches(): Promise<PatchData[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Get all followed game IDs (from both user_games and backlog_items)
  const [followedResult, backlogResult] = await Promise.all([
    supabase.from('user_games').select('game_id').eq('user_id', user.id),
    supabase.from('backlog_items').select('game_id').eq('user_id', user.id),
  ])

  const gameIds = [
    ...(followedResult.data || []).map(ug => ug.game_id),
    ...(backlogResult.data || []).map(bi => bi.game_id),
  ]
  const uniqueGameIds = [...new Set(gameIds)]

  if (uniqueGameIds.length === 0) return []

  // Only show patches from the last 2 months to stay relevant
  const twoMonthsAgo = new Date()
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

  // Fetch patches for followed games (limit 200 for performance)
  const { data, error } = await supabase
    .from('patch_notes')
    .select(`
      id,
      title,
      published_at,
      summary_tldr,
      impact_score,
      games!inner(
        id,
        name,
        slug,
        cover_url
      )
    `)
    .in('game_id', uniqueGameIds)
    .gte('published_at', twoMonthsAgo.toISOString())
    .order('published_at', { ascending: false })
    .limit(200)

  if (error) {
    console.error('Error fetching followed games patches:', error)
    return []
  }

  return (data || []).map((patch) => {
    const gameData = patch.games as unknown as {
      id: string
      name: string
      slug: string
      cover_url: string | null
    }
    return {
      id: patch.id,
      title: patch.title,
      published_at: patch.published_at,
      summary_tldr: patch.summary_tldr,
      impact_score: patch.impact_score,
      game: gameData,
    }
  })
}

async function getFollowedGameIds(): Promise<string[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('user_games')
    .select('game_id')
    .eq('user_id', user.id)

  return (data || []).map(ug => ug.game_id)
}

async function getBacklogGameIds(): Promise<string[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('backlog_items')
    .select('game_id')
    .eq('user_id', user.id)

  return (data || []).map(item => item.game_id)
}

export default async function PatchesPage() {
  const [patches, followedGamesPatches, followedGameIds, backlogGameIds] = await Promise.all([
    getPatches(100), // Get more general patches
    getFollowedGamesPatches(), // Get ALL patches for followed games
    getFollowedGameIds(),
    getBacklogGameIds(),
  ])

  // Merge patches - followed games patches take priority, then fill with general patches
  const followedPatchIds = new Set(followedGamesPatches.map(p => p.id))
  const uniqueGeneralPatches = patches.filter(p => !followedPatchIds.has(p.id))
  const allPatches = [...followedGamesPatches, ...uniqueGeneralPatches]
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Patches</h1>
        <p className="mt-2 text-muted-foreground">
          Browse the latest patches and updates from all games.
        </p>
        {/* Glow divider */}
        <div className="relative h-0.5 w-full overflow-visible mt-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />
          <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-md" />
        </div>
      </div>

      <PatchesList initialPatches={allPatches} followedGameIds={followedGameIds} backlogGameIds={backlogGameIds} />
    </div>
  )
}
