'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { queueAIJob } from '@/lib/ai/jobs'

// Map game slugs to their official subreddits
const GAME_SUBREDDITS: Record<string, { subreddit: string; flairFilter?: string }> = {
  // Riot Games
  'league-of-legends': { subreddit: 'leagueoflegends', flairFilter: 'Riot Official' },
  'valorant': { subreddit: 'VALORANT', flairFilter: 'Riot Official' },
  'teamfight-tactics': { subreddit: 'TeamfightTactics' },
  'tft': { subreddit: 'TeamfightTactics' },

  // Blizzard
  'world-of-warcraft': { subreddit: 'wow', flairFilter: 'Blizzard Official' },
  'diablo-4': { subreddit: 'diablo4' },
  'diablo-iv': { subreddit: 'diablo4' },
  'overwatch-2': { subreddit: 'Overwatch' },
  'hearthstone': { subreddit: 'hearthstone' },

  // Epic Games
  'fortnite': { subreddit: 'FortNiteBR' },
  'rocket-league': { subreddit: 'RocketLeague' },
  'fall-guys': { subreddit: 'FallGuysGame' },

  // Valve
  'counter-strike-2': { subreddit: 'cs2' },
  'cs2': { subreddit: 'cs2' },
  'dota-2': { subreddit: 'DotA2' },

  // Popular Live Service Games
  'apex-legends': { subreddit: 'apexlegends' },
  'destiny-2': { subreddit: 'DestinyTheGame' },
  'call-of-duty-warzone': { subreddit: 'CODWarzone' },
  'warzone': { subreddit: 'CODWarzone' },
  'rainbow-six-siege': { subreddit: 'Rainbow6' },
  'genshin-impact': { subreddit: 'Genshin_Impact' },
  'honkai-star-rail': { subreddit: 'HonkaiStarRail' },
  'path-of-exile': { subreddit: 'pathofexile' },
  'escape-from-tarkov': { subreddit: 'EscapefromTarkov' },
  'dead-by-daylight': { subreddit: 'deadbydaylight' },
  'monster-hunter': { subreddit: 'MonsterHunter' },
  'final-fantasy-xiv': { subreddit: 'ffxiv' },
  'ffxiv': { subreddit: 'ffxiv' },
  'elder-scrolls-online': { subreddit: 'elderscrollsonline' },
  'sea-of-thieves': { subreddit: 'Seaofthieves' },
  'no-mans-sky': { subreddit: 'NoMansSkyTheGame' },
  'deep-rock-galactic': { subreddit: 'DeepRockGalactic' },
  'helldivers-2': { subreddit: 'Helldivers' },
  'the-finals': { subreddit: 'thefinals' },
  'xdefiant': { subreddit: 'XDefiant' },
}

// Keywords that indicate a patch/update post
const PATCH_KEYWORDS = [
  'patch', 'update', 'hotfix', 'notes', 'changelog', 'maintenance',
  'balance', 'fix', 'bug fix', 'version', 'release notes'
]

// Keywords for official dev posts
const OFFICIAL_KEYWORDS = [
  'dev', 'official', 'riot', 'blizzard', 'epic', 'valve', 'ubisoft',
  'respawn', 'bungie', 'developer', 'studio'
]

type RedditPost = {
  data: {
    id: string
    title: string
    selftext: string
    url: string
    permalink: string
    created_utc: number
    link_flair_text?: string
    author: string
    is_self: boolean
    domain: string
  }
}

async function fetchSubredditPatches(
  subreddit: string,
  gameId: string,
  gameName: string,
  flairFilter?: string
): Promise<{ success: boolean; addedCount: number; error?: string }> {
  try {
    // Fetch recent posts from subreddit (sorted by new)
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/new.json?limit=25`,
      {
        headers: {
          'User-Agent': 'PatchPulse/1.0 (Gaming Patch Tracker)',
        },
      }
    )

    if (!response.ok) {
      return { success: false, addedCount: 0, error: `Reddit API returned ${response.status}` }
    }

    const data = await response.json()
    const posts: RedditPost[] = data?.data?.children || []
    const supabase = createAdminClient()
    let addedCount = 0

    for (const post of posts) {
      const { title, selftext, permalink, created_utc, link_flair_text, author, is_self, domain, url } = post.data
      const titleLower = title.toLowerCase()

      // Check if this looks like a patch post
      const isPatchTitle = PATCH_KEYWORDS.some(keyword => titleLower.includes(keyword))

      // Check for official flair if specified
      const hasOfficialFlair = flairFilter
        ? link_flair_text?.toLowerCase().includes(flairFilter.toLowerCase())
        : true

      // Check if author looks official or if it's a mod/dev post
      const isOfficialAuthor = OFFICIAL_KEYWORDS.some(keyword =>
        author.toLowerCase().includes(keyword) ||
        (link_flair_text?.toLowerCase() || '').includes(keyword)
      )

      // Skip non-patch posts
      if (!isPatchTitle) continue

      // Prefer official sources
      if (flairFilter && !hasOfficialFlair && !isOfficialAuthor) continue

      // Build source URL - use permalink for self posts, or the linked URL
      const sourceUrl = is_self || domain.includes('reddit')
        ? `https://www.reddit.com${permalink}`
        : url

      if (!sourceUrl) continue

      // Check for duplicates by source URL
      const { data: existingByUrl } = await supabase
        .from('patch_notes')
        .select('id')
        .eq('source_url', sourceUrl)
        .single()

      if (existingByUrl) continue

      // Check for similar title
      const { data: existingByTitle } = await supabase
        .from('patch_notes')
        .select('id')
        .eq('game_id', gameId)
        .ilike('title', `%${title.slice(0, 50)}%`)
        .limit(1)

      if (existingByTitle && existingByTitle.length > 0) continue

      // Use selftext for content, or title if it's a link post
      const rawText = selftext || title
      if (rawText.length < 20) continue

      // Insert patch with source URL
      const { data: newPatch, error } = await supabase
        .from('patch_notes')
        .insert({
          game_id: gameId,
          title: title.slice(0, 500),
          source_url: sourceUrl,
          raw_text: rawText.slice(0, 10000),
          published_at: new Date(created_utc * 1000).toISOString(),
          summary_tldr: 'Processing...',
          impact_score: 5,
          tags: [],
          key_changes: [],
        })
        .select('id')
        .single()

      if (error) {
        console.error(`Failed to insert Reddit patch for ${gameName}:`, error)
        continue
      }

      if (newPatch) {
        await queueAIJob('PATCH_SUMMARY', newPatch.id)
        addedCount++
      }
    }

    return { success: true, addedCount }
  } catch (error) {
    return {
      success: false,
      addedCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function fetchRedditPatches(gameSlug: string, gameId: string, gameName: string) {
  // Find matching subreddit
  const config = Object.entries(GAME_SUBREDDITS).find(([slug]) =>
    gameSlug.includes(slug) || slug.includes(gameSlug)
  )?.[1]

  if (!config) {
    return { success: false, error: 'No Reddit subreddit configured for this game', addedCount: 0 }
  }

  return fetchSubredditPatches(config.subreddit, gameId, gameName, config.flairFilter)
}

// Fetch patches from all configured game subreddits
export async function fetchAllRedditPatches() {
  const supabase = createAdminClient()

  // Get games that match our configured subreddits
  const gameSlugs = Object.keys(GAME_SUBREDDITS)
  const { data: games, error } = await supabase
    .from('games')
    .select('id, name, slug')
    .or(gameSlugs.map(s => `slug.ilike.%${s}%`).join(','))
    .limit(50)

  if (error || !games || games.length === 0) {
    return { success: true, totalAdded: 0, gamesChecked: 0 }
  }

  let totalAdded = 0
  const errors: string[] = []

  for (const game of games) {
    const result = await fetchRedditPatches(game.slug, game.id, game.name)

    if (result.success) {
      totalAdded += result.addedCount || 0
    } else if (result.error && result.error !== 'No Reddit subreddit configured for this game') {
      errors.push(`${game.name}: ${result.error}`)
    }

    // Reddit rate limit: 60 requests per minute, so add delay
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  return {
    success: true,
    totalAdded,
    gamesChecked: games.length,
    errors: errors.length > 0 ? errors : undefined,
  }
}
