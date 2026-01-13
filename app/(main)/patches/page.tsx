import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PatchesList } from './PatchesList'

export const metadata: Metadata = {
  title: 'All Patches | PatchPulse',
  description: 'Browse all game patches and updates',
}

async function getPatches(limit = 50) {
  const supabase = await createClient()

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
  const [patches, followedGameIds, backlogGameIds] = await Promise.all([
    getPatches(),
    getFollowedGameIds(),
    getBacklogGameIds(),
  ])

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

      <PatchesList initialPatches={patches} followedGameIds={followedGameIds} backlogGameIds={backlogGameIds} />
    </div>
  )
}
