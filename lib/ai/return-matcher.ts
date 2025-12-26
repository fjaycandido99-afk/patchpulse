import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  RETURN_MATCH_SYSTEM,
  getReturnMatchPrompt,
  type ReturnMatchResult,
} from './prompts'

const anthropic = new Anthropic()
const MODEL = 'claude-sonnet-4-20250514'

// Confidence threshold for auto-suggestions
const AUTO_SUGGEST_THRESHOLD = 0.6

async function callClaude(system: string, userPrompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
    system,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const textBlock = response.content.find((c) => c.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from AI')
  }

  return textBlock.text
}

function parseJSON<T>(text: string): T {
  let cleaned = text.trim()
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7)
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3)
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3)
  }
  return JSON.parse(cleaned.trim()) as T
}

// Run AI matching for a single pause reason vs patch
export async function runReturnMatcher(input: {
  gameName: string
  pauseReason: string
  patchTitle: string
  patchSummary: string
  keyChanges: Array<{ category: string; change: string }> | null
}): Promise<ReturnMatchResult> {
  const prompt = getReturnMatchPrompt(
    input.gameName,
    input.pauseReason,
    input.patchTitle,
    input.patchSummary,
    input.keyChanges
  )
  const raw = await callClaude(RETURN_MATCH_SYSTEM, prompt)
  return parseJSON<ReturnMatchResult>(raw)
}

// Process a new patch and check against all paused games
export async function processReturnMatchesForPatch(patchId: string): Promise<{
  matchesCreated: number
  errors: string[]
}> {
  const supabase = createAdminClient()
  const errors: string[] = []
  let matchesCreated = 0

  // 1. Get the patch with its game info
  const { data: patch, error: patchError } = await supabase
    .from('patch_notes')
    .select(`
      id,
      game_id,
      title,
      summary_tldr,
      key_changes,
      games(name)
    `)
    .eq('id', patchId)
    .single()

  if (patchError || !patch) {
    return { matchesCreated: 0, errors: ['Patch not found'] }
  }

  const patchGame = patch.games as unknown as { name: string } | null
  const gameName = patchGame?.name || 'Unknown Game'

  // 2. Find all users with this game paused or dropped AND a pause_reason
  const { data: pausedItems, error: pausedError } = await supabase
    .from('backlog_items')
    .select('id, user_id, game_id, pause_reason, status')
    .eq('game_id', patch.game_id)
    .in('status', ['paused', 'dropped'])
    .not('pause_reason', 'is', null)

  if (pausedError || !pausedItems || pausedItems.length === 0) {
    return { matchesCreated: 0, errors: [] }
  }

  // 3. For each paused item, run the AI matcher
  for (const item of pausedItems) {
    try {
      // Skip reasons that AI can't help with
      if (item.pause_reason?.toLowerCase().includes('not enough time')) {
        continue
      }

      const result = await runReturnMatcher({
        gameName,
        pauseReason: item.pause_reason!,
        patchTitle: patch.title,
        patchSummary: patch.summary_tldr || '',
        keyChanges: patch.key_changes as Array<{ category: string; change: string }> | null,
      })

      // Only create suggestion if confidence is high enough and it's a match
      if (result.is_match && result.confidence >= AUTO_SUGGEST_THRESHOLD) {
        // Check if we already have a suggestion for this user/game/patch combo
        const { data: existing } = await supabase
          .from('return_suggestions')
          .select('id')
          .eq('user_id', item.user_id)
          .eq('game_id', item.game_id)
          .eq('patch_id', patchId)
          .single()

        if (!existing) {
          const { error: insertError } = await supabase
            .from('return_suggestions')
            .insert({
              user_id: item.user_id,
              game_id: item.game_id,
              backlog_item_id: item.id,
              patch_id: patchId,
              pause_reason: item.pause_reason,
              match_reason: result.reason,
              confidence: result.confidence,
            })

          if (insertError) {
            errors.push(`Failed to insert suggestion for user ${item.user_id}: ${insertError.message}`)
          } else {
            matchesCreated++
          }
        }
      }
    } catch (err) {
      errors.push(`AI matching failed for item ${item.id}: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return { matchesCreated, errors }
}

// Get pending return suggestions for a user
export async function getReturnSuggestionsForUser(userId: string): Promise<Array<{
  id: string
  gameId: string
  gameName: string
  coverUrl: string | null
  patchTitle: string
  pauseReason: string
  matchReason: string
  confidence: number
  patchPublishedAt: string
}>> {
  const supabase = createAdminClient()

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
    .eq('user_id', userId)
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

// Mark a suggestion as dismissed or acted on
export async function updateReturnSuggestion(
  suggestionId: string,
  action: 'dismiss' | 'return'
): Promise<void> {
  const supabase = createAdminClient()

  await supabase
    .from('return_suggestions')
    .update({
      is_dismissed: action === 'dismiss',
      is_acted_on: action === 'return',
    })
    .eq('id', suggestionId)
}
