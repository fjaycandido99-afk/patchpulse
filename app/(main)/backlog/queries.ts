import { createClient } from '@/lib/supabase/server'

type BacklogStatus = 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped'

type Game = {
  id: string
  name: string
  slug: string
  cover_url: string | null
}

type BacklogItem = {
  id: string
  game_id: string
  status: BacklogStatus
  progress: number
  next_note: string | null
  last_played_at: string | null
  started_at: string | null
  finished_at: string | null
  created_at: string
  game: Game
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
      last_played_at,
      started_at,
      finished_at,
      created_at,
      games(id, name, slug, cover_url)
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

  const items: BacklogItem[] = data.map((item) => ({
    id: item.id,
    game_id: item.game_id,
    status: item.status as BacklogStatus,
    progress: item.progress,
    next_note: item.next_note,
    last_played_at: item.last_played_at,
    started_at: item.started_at,
    finished_at: item.finished_at,
    created_at: item.created_at,
    game: item.games as unknown as Game,
  }))

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
      last_played_at,
      started_at,
      finished_at,
      created_at,
      games(id, name, slug, cover_url)
    `
    )
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    game_id: data.game_id,
    status: data.status as BacklogStatus,
    progress: data.progress,
    next_note: data.next_note,
    last_played_at: data.last_played_at,
    started_at: data.started_at,
    finished_at: data.finished_at,
    created_at: data.created_at,
    game: data.games as unknown as Game,
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
