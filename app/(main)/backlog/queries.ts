import { createClient } from '@/lib/supabase/server'

type BacklogStatus = 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped'

type Game = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  steam_app_id?: number | null
  genre?: string | null
}

type SteamStats = {
  playtime_minutes: number | null
  last_played_at: string | null
}

type PatchInfo = {
  id: string
  title: string
  published_at: string
  summary_tldr: string | null
}

type BacklogItem = {
  id: string
  game_id: string
  status: BacklogStatus
  progress: number
  next_note: string | null
  pause_reason: string | null
  last_played_at: string | null
  started_at: string | null
  finished_at: string | null
  created_at: string
  game: Game
  latestPatch: PatchInfo | null
  recentPatches: PatchInfo[]
  steamStats?: SteamStats | null
}

type BacklogBoard = {
  playing: BacklogItem[]
  paused: BacklogItem[]
  backlog: BacklogItem[]
  finished: BacklogItem[]
  dropped: BacklogItem[]
}

type FollowedGameForPicker = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  inBacklog: boolean
  backlogStatus: BacklogStatus | null
}

export async function getBacklogBoard(): Promise<BacklogBoard> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      playing: [],
      paused: [],
      backlog: [],
      finished: [],
      dropped: [],
    }
  }

  const { data, error } = await supabase
    .from('backlog_items')
    .select(
      `
      id,
      game_id,
      status,
      progress,
      next_note,
      pause_reason,
      last_played_at,
      started_at,
      finished_at,
      created_at,
      games(id, name, slug, cover_url, steam_app_id, genre)
    `
    )
    .eq('user_id', user.id)

  if (error || !data) {
    return {
      playing: [],
      paused: [],
      backlog: [],
      finished: [],
      dropped: [],
    }
  }

  // Fetch Steam stats for games with steam_app_id
  const steamAppIds = data
    .map((item) => (item.games as unknown as Game)?.steam_app_id)
    .filter((id): id is number => typeof id === 'number')

  let steamStatsMap = new Map<number, SteamStats>()
  if (steamAppIds.length > 0) {
    const { data: steamData } = await supabase
      .from('user_library_games')
      .select('provider_game_id, playtime_minutes, last_played_at')
      .eq('user_id', user.id)
      .eq('provider', 'steam')
      .in('provider_game_id', steamAppIds.map(String))

    if (steamData) {
      for (const stat of steamData) {
        steamStatsMap.set(parseInt(stat.provider_game_id), {
          playtime_minutes: stat.playtime_minutes,
          last_played_at: stat.last_played_at,
        })
      }
    }
  }

  // Get all game IDs to fetch latest patches
  const gameIds = data.map((item) => item.game_id)

  // Create a map of game_id -> patches array (ordered by date desc)
  const patchesMap = new Map<string, PatchInfo[]>()

  // Only fetch patches if we have games
  if (gameIds.length > 0) {
    const { data: patchesData, error: patchError } = await supabase
      .from('patch_notes')
      .select('id, game_id, title, published_at, summary_tldr')
      .in('game_id', gameIds)
      .order('published_at', { ascending: false })

    if (patchError) {
      console.error('Error fetching patches for backlog:', patchError)
    }

    if (patchesData) {
      for (const patch of patchesData) {
        const patchInfo: PatchInfo = {
          id: patch.id,
          title: patch.title,
          published_at: patch.published_at,
          summary_tldr: patch.summary_tldr,
        }
        const existing = patchesMap.get(patch.game_id) || []
        existing.push(patchInfo)
        patchesMap.set(patch.game_id, existing)
      }
    }
  }

  const items: BacklogItem[] = data.map((item) => {
    const patches = patchesMap.get(item.game_id) || []
    const game = item.games as unknown as Game
    const steamStats = game?.steam_app_id
      ? steamStatsMap.get(game.steam_app_id) ?? null
      : null
    return {
      id: item.id,
      game_id: item.game_id,
      status: item.status as BacklogStatus,
      progress: item.progress,
      next_note: item.next_note,
      pause_reason: item.pause_reason,
      last_played_at: item.last_played_at,
      started_at: item.started_at,
      finished_at: item.finished_at,
      created_at: item.created_at,
      game,
      latestPatch: patches[0] ?? null,
      recentPatches: patches.slice(0, 5), // Keep last 5 patches
      steamStats,
    }
  })

  const board: BacklogBoard = {
    playing: [],
    paused: [],
    backlog: [],
    finished: [],
    dropped: [],
  }

  for (const item of items) {
    board[item.status].push(item)
  }

  // Sort playing/paused: last_played_at asc nulls last, then progress desc
  const sortPlayingPaused = (a: BacklogItem, b: BacklogItem) => {
    if (a.last_played_at && b.last_played_at) {
      const diff =
        new Date(a.last_played_at).getTime() -
        new Date(b.last_played_at).getTime()
      if (diff !== 0) return diff
    } else if (a.last_played_at && !b.last_played_at) {
      return -1
    } else if (!a.last_played_at && b.last_played_at) {
      return 1
    }
    return b.progress - a.progress
  }

  board.playing.sort(sortPlayingPaused)
  board.paused.sort(sortPlayingPaused)

  // Sort backlog: created_at desc
  board.backlog.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Sort finished: finished_at desc nulls last
  board.finished.sort((a, b) => {
    if (a.finished_at && b.finished_at) {
      return (
        new Date(b.finished_at).getTime() - new Date(a.finished_at).getTime()
      )
    }
    if (a.finished_at && !b.finished_at) return -1
    if (!a.finished_at && b.finished_at) return 1
    return 0
  })

  // Sort dropped: created_at desc
  board.dropped.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return board
}

export async function getBacklogItem(
  gameId: string
): Promise<BacklogItem | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('backlog_items')
    .select(
      `
      id,
      game_id,
      status,
      progress,
      next_note,
      pause_reason,
      last_played_at,
      started_at,
      finished_at,
      created_at,
      games(id, name, slug, cover_url, steam_app_id, genre)
    `
    )
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  if (error || !data) {
    return null
  }

  const game = data.games as unknown as Game

  // Fetch recent patches for this game
  const { data: patchesData } = await supabase
    .from('patch_notes')
    .select('id, title, published_at, summary_tldr')
    .eq('game_id', gameId)
    .order('published_at', { ascending: false })
    .limit(10)

  const recentPatches: PatchInfo[] = (patchesData || []).map(p => ({
    id: p.id,
    title: p.title,
    published_at: p.published_at,
    summary_tldr: p.summary_tldr,
  }))

  // Fetch Steam stats if game has steam_app_id
  let steamStats: SteamStats | null = null
  if (game?.steam_app_id) {
    const { data: steamData } = await supabase
      .from('user_library_games')
      .select('playtime_minutes, last_played_at')
      .eq('user_id', user.id)
      .eq('provider', 'steam')
      .eq('provider_game_id', game.steam_app_id.toString())
      .single()

    if (steamData) {
      steamStats = {
        playtime_minutes: steamData.playtime_minutes,
        last_played_at: steamData.last_played_at,
      }
    }
  }

  return {
    id: data.id,
    game_id: data.game_id,
    status: data.status as BacklogStatus,
    progress: data.progress,
    next_note: data.next_note,
    pause_reason: data.pause_reason,
    last_played_at: data.last_played_at,
    started_at: data.started_at,
    finished_at: data.finished_at,
    created_at: data.created_at,
    game,
    latestPatch: recentPatches[0] ?? null,
    recentPatches,
    steamStats,
  }
}

export type StaleGame = {
  backlogItemId: string
  gameId: string
  gameName: string
  coverUrl: string | null
  lastPlayedAt: string
  daysSincePlayed: number
}

export async function getStalePlayingGames(daysThreshold = 14): Promise<StaleGame[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const thresholdDate = new Date()
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold)

  const { data, error } = await supabase
    .from('backlog_items')
    .select(`
      id,
      game_id,
      last_played_at,
      games(name, cover_url)
    `)
    .eq('user_id', user.id)
    .eq('status', 'playing')
    .not('last_played_at', 'is', null)
    .lt('last_played_at', thresholdDate.toISOString())
    .order('last_played_at', { ascending: true })

  if (error || !data) {
    return []
  }

  return data.map((item) => {
    const game = item.games as unknown as { name: string; cover_url: string | null }
    const lastPlayed = new Date(item.last_played_at!)
    const now = new Date()
    const daysSincePlayed = Math.floor((now.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24))

    return {
      backlogItemId: item.id,
      gameId: item.game_id,
      gameName: game.name,
      coverUrl: game.cover_url,
      lastPlayedAt: item.last_played_at!,
      daysSincePlayed,
    }
  })
}

export async function searchAllGames(query: string): Promise<
  { id: string; name: string; slug: string; cover_url: string | null }[]
> {
  if (!query || query.length < 2) return []

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('games')
    .select('id, name, slug, cover_url')
    .ilike('name', `%${query}%`)
    .limit(20)

  if (error || !data) return []
  return data
}

export type ReturnSuggestion = {
  id: string
  gameId: string
  gameName: string
  coverUrl: string | null
  patchTitle: string
  pauseReason: string
  matchReason: string
  confidence: number
  patchPublishedAt: string
}

export async function getReturnSuggestions(): Promise<ReturnSuggestion[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('return_suggestions')
    .select(`
      id,
      game_id,
      pause_reason,
      match_reason,
      confidence,
      games(name, cover_url),
      patch_notes(title, published_at)
    `)
    .eq('user_id', user.id)
    .eq('is_dismissed', false)
    .eq('is_acted_on', false)
    .order('confidence', { ascending: false })
    .limit(5)

  if (error || !data) {
    return []
  }

  return data.map((item) => {
    const game = item.games as unknown as { name: string; cover_url: string | null } | null
    const patch = item.patch_notes as unknown as { title: string; published_at: string } | null
    return {
      id: item.id,
      gameId: item.game_id,
      gameName: game?.name || 'Unknown Game',
      coverUrl: game?.cover_url || null,
      patchTitle: patch?.title || 'Recent Patch',
      pauseReason: item.pause_reason || '',
      matchReason: item.match_reason,
      confidence: item.confidence,
      patchPublishedAt: patch?.published_at || '',
    }
  })
}

export type FollowedGameWithActivity = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  steam_app_id?: number | null
  latestPatch: {
    id: string
    title: string
    published_at: string
  } | null
  patchCount: number
  inBacklog: boolean
  unreadPatchCount?: number
  unreadNewsCount?: number
  steamStats?: SteamStats | null
}

export async function getFollowedGamesWithActivity(): Promise<FollowedGameWithActivity[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Get followed games
  const { data: userGamesData, error: userGamesError } = await supabase
    .from('user_games')
    .select('games(id, name, slug, cover_url, steam_app_id, genre)')
    .eq('user_id', user.id)

  if (userGamesError || !userGamesData) {
    return []
  }

  const games = userGamesData
    .map((ug) => ug.games as unknown as Game)
    .filter(Boolean)

  if (games.length === 0) {
    return []
  }

  const gameIds = games.map((g) => g.id)

  // Fetch Steam stats for games with steam_app_id
  const steamAppIds = games
    .map((g) => g.steam_app_id)
    .filter((id): id is number => typeof id === 'number')

  let steamStatsMap = new Map<number, SteamStats>()
  if (steamAppIds.length > 0) {
    const { data: steamData } = await supabase
      .from('user_library_games')
      .select('provider_game_id, playtime_minutes, last_played_at')
      .eq('user_id', user.id)
      .eq('provider', 'steam')
      .in('provider_game_id', steamAppIds.map(String))

    if (steamData) {
      for (const stat of steamData) {
        steamStatsMap.set(parseInt(stat.provider_game_id), {
          playtime_minutes: stat.playtime_minutes,
          last_played_at: stat.last_played_at,
        })
      }
    }
  }

  // Get backlog status
  const { data: backlogData } = await supabase
    .from('backlog_items')
    .select('game_id')
    .eq('user_id', user.id)
    .in('game_id', gameIds)

  const backlogGameIds = new Set(backlogData?.map((b) => b.game_id) || [])

  // Get latest patches for each game (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: patchesData } = await supabase
    .from('patch_notes')
    .select('id, game_id, title, published_at')
    .in('game_id', gameIds)
    .gte('published_at', thirtyDaysAgo.toISOString())
    .order('published_at', { ascending: false })

  // Create patch map
  const patchMap = new Map<string, { latest: { id: string; title: string; published_at: string } | null; count: number }>()

  for (const gameId of gameIds) {
    patchMap.set(gameId, { latest: null, count: 0 })
  }

  if (patchesData) {
    for (const patch of patchesData) {
      const existing = patchMap.get(patch.game_id)!
      if (!existing.latest) {
        existing.latest = {
          id: patch.id,
          title: patch.title,
          published_at: patch.published_at,
        }
      }
      existing.count++
    }
  }

  // Build result with activity
  const result: FollowedGameWithActivity[] = games.map((game) => {
    const patchInfo = patchMap.get(game.id) || { latest: null, count: 0 }
    const steamStats = game.steam_app_id
      ? steamStatsMap.get(game.steam_app_id) ?? null
      : null
    return {
      id: game.id,
      name: game.name,
      slug: game.slug,
      cover_url: game.cover_url,
      steam_app_id: game.steam_app_id,
      latestPatch: patchInfo.latest,
      patchCount: patchInfo.count,
      inBacklog: backlogGameIds.has(game.id),
      steamStats,
    }
  })

  // Sort: games with recent patches first, then by name
  result.sort((a, b) => {
    if (a.latestPatch && !b.latestPatch) return -1
    if (!a.latestPatch && b.latestPatch) return 1
    if (a.latestPatch && b.latestPatch) {
      return new Date(b.latestPatch.published_at).getTime() - new Date(a.latestPatch.published_at).getTime()
    }
    return a.name.localeCompare(b.name)
  })

  return result
}

export type GameActivity = {
  recentPatches: {
    id: string
    title: string
    published_at: string
    summary_tldr: string | null
  }[]
  recentNews: {
    id: string
    title: string
    published_at: string
    summary: string | null
  }[]
}

export async function getGameActivity(gameId: string): Promise<GameActivity> {
  const supabase = await createClient()

  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const [patchesResult, newsResult] = await Promise.all([
    supabase
      .from('patch_notes')
      .select('id, title, published_at, summary_tldr')
      .eq('game_id', gameId)
      .gte('published_at', ninetyDaysAgo.toISOString())
      .order('published_at', { ascending: false })
      .limit(10),
    supabase
      .from('news')
      .select('id, title, published_at, summary')
      .eq('game_id', gameId)
      .gte('published_at', ninetyDaysAgo.toISOString())
      .order('published_at', { ascending: false })
      .limit(10),
  ])

  return {
    recentPatches: patchesResult.data || [],
    recentNews: newsResult.data || [],
  }
}

export async function getFollowedGamesForBacklogPicker(): Promise<
  FollowedGameForPicker[]
> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const [userGamesResult, backlogResult] = await Promise.all([
    supabase
      .from('user_games')
      .select('games(id, name, slug, cover_url)')
      .eq('user_id', user.id),
    supabase
      .from('backlog_items')
      .select('game_id, status')
      .eq('user_id', user.id),
  ])

  if (userGamesResult.error || !userGamesResult.data) {
    return []
  }

  const backlogMap = new Map<string, BacklogStatus>()
  if (backlogResult.data) {
    for (const item of backlogResult.data) {
      backlogMap.set(item.game_id, item.status as BacklogStatus)
    }
  }

  const games: FollowedGameForPicker[] = userGamesResult.data
    .map((ug) => {
      const game = ug.games as unknown as Game
      if (!game) return null
      return {
        id: game.id,
        name: game.name,
        slug: game.slug,
        cover_url: game.cover_url,
        inBacklog: backlogMap.has(game.id),
        backlogStatus: backlogMap.get(game.id) ?? null,
      }
    })
    .filter((g): g is FollowedGameForPicker => g !== null)
    .sort((a, b) => a.name.localeCompare(b.name))

  return games
}

export async function isFollowingGame(gameId: string): Promise<boolean> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data } = await supabase
    .from('user_games')
    .select('id')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  return !!data
}
