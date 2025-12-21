import { createClient } from '@/lib/supabase/server'

type FollowedGame = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  platforms: string[]
}

type PatchNote = {
  id: string
  game_id: string
  title: string
  published_at: string
  source_url: string | null
  summary_tldr: string | null
  key_changes: any
  tags: string[]
  impact_score: number
  games: {
    name: string
    slug: string
    cover_url: string | null
  } | null
}

type NewsItem = {
  id: string
  game_id: string | null
  title: string
  published_at: string
  source_name: string | null
  source_url: string | null
  summary: string | null
  why_it_matters: string | null
  topics: string[]
  is_rumor: boolean
  games: {
    name: string
    slug: string
    cover_url: string | null
  } | null
}

type BacklogItem = {
  id: string
  game_id: string
  status: string
  progress: number
  last_played_at: string | null
  games: {
    name: string
    slug: string
    cover_url: string | null
  } | null
}

type WishlistItem = {
  id: string
  game_id: string
  games: {
    name: string
    slug: string
    cover_url: string | null
    release_date: string
  } | null
}

export type HomeFeed = {
  followedGames: FollowedGame[]
  topPatches: PatchNote[]
  latestNews: NewsItem[]
  backlogNudge: BacklogItem | null
  upcomingWishlist: WishlistItem[]
}

export async function getHomeFeed(): Promise<HomeFeed> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      followedGames: [],
      topPatches: [],
      latestNews: [],
      backlogNudge: null,
      upcomingWishlist: [],
    }
  }

  const { data: userGames } = await supabase
    .from('user_games')
    .select('game_id, games!inner(id, name, slug, cover_url, platforms)')
    .eq('user_id', user.id)

  const followedGames: FollowedGame[] =
    userGames
      ?.map((ug: any) => ug.games as FollowedGame)
      .filter((g): g is FollowedGame => g !== null) || []

  const followedGameIds = followedGames.map((g) => g.id)

  if (followedGameIds.length === 0) {
    return {
      followedGames: [],
      topPatches: [],
      latestNews: [],
      backlogNudge: null,
      upcomingWishlist: [],
    }
  }

  const { data: patches } = await supabase
    .from('patch_notes')
    .select('*, games(name, slug, cover_url)')
    .in('game_id', followedGameIds)
    .order('impact_score', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(6)

  const { data: news } = await supabase
    .from('news_items')
    .select('*, games(name, slug, cover_url)')
    .in('game_id', followedGameIds)
    .order('is_rumor', { ascending: true })
    .order('published_at', { ascending: false })
    .limit(8)

  const { data: backlogData } = await (supabase as any)
    .from('backlog_items')
    .select('*, games(name, slug, cover_url)')
    .eq('user_id', user.id)
    .in('status', ['playing', 'paused'])
    .order('last_played_at', { ascending: true, nullsFirst: false })
    .order('progress', { ascending: false })
    .limit(1)
    .single()

  const { data: wishlistData } = await (supabase as any)
    .from('wishlist_items')
    .select('id, game_id, games!inner(name, slug, cover_url, release_date)')
    .eq('user_id', user.id)
    .not('games.release_date', 'is', null)
    .limit(5)

  return {
    followedGames,
    topPatches: patches || [],
    latestNews: news || [],
    backlogNudge: backlogData || null,
    upcomingWishlist: wishlistData || [],
  }
}
