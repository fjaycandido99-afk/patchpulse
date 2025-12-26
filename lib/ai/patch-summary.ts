import { generateJSON } from './client'
import { createAdminClient } from '@/lib/supabase/admin'

type PatchSummaryResult = {
  tldr: string
  key_changes: Array<{
    type: 'buff' | 'nerf' | 'fix' | 'feature' | 'balance' | 'content' | 'performance' | 'other'
    description: string
    importance: 'high' | 'medium' | 'low'
  }>
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
  impact_score: number
}

const SYSTEM_PROMPT = `You are a gaming patch notes analyst. Your job is to summarize patch notes for gamers who want the TL;DR.

Analyze the patch notes and provide:
1. tldr: A 1-2 sentence summary of the most important changes
2. key_changes: Array of important changes with type, description, and importance
3. sentiment: Overall community sentiment this patch will likely generate
4. impact_score: 1-10 rating of how significant this patch is (10 = major expansion, 1 = tiny hotfix)

Change types:
- buff: Something got stronger/better
- nerf: Something got weaker/worse
- fix: Bug fix
- feature: New feature or content
- balance: General balance adjustment
- content: New maps, items, characters, etc.
- performance: Performance improvements
- other: Miscellaneous

Be concise and gamer-friendly. Use gaming terminology appropriately.`

/**
 * Generate a summary for a patch
 */
export async function generatePatchSummary(
  gameName: string,
  patchVersion: string,
  patchNotes: string
): Promise<PatchSummaryResult> {
  const userPrompt = `Game: ${gameName}
Patch Version: ${patchVersion}

Patch Notes:
${patchNotes.slice(0, 8000)}` // Limit to avoid token limits

  const result = await generateJSON<PatchSummaryResult>(SYSTEM_PROMPT, userPrompt, {
    
    maxTokens: 1500,
    temperature: 0.3,
  })

  return result
}

/**
 * Process a patch from the queue and save summary
 */
export async function processPatchSummary(patchId: string): Promise<void> {
  const supabase = createAdminClient()

  // Get the patch with game info
  const { data: patch, error: patchError } = await supabase
    .from('patch_notes')
    .select(`
      id,
      title,
      raw_text,
      games!inner(name)
    `)
    .eq('id', patchId)
    .single()

  if (patchError || !patch) {
    throw new Error(`Patch not found: ${patchId}`)
  }

  // Check if summary already exists
  const { data: existing } = await supabase
    .from('patch_summaries')
    .select('id')
    .eq('patch_id', patchId)
    .single()

  if (existing) {
    return // Already processed
  }

  const gameName = (patch.games as unknown as { name: string }).name
  const summary = await generatePatchSummary(
    gameName,
    patch.title || 'Unknown',
    patch.raw_text || ''
  )

  // Save the summary
  await supabase.from('patch_summaries').insert({
    patch_id: patchId,
    tldr: summary.tldr,
    key_changes: summary.key_changes,
    sentiment: summary.sentiment,
    impact_score: summary.impact_score,
    model_version: 'claude-3-haiku',
  })
}

/**
 * Get summary for a patch (generate if missing)
 */
export async function getPatchSummary(patchId: string): Promise<PatchSummaryResult | null> {
  const supabase = createAdminClient()

  // Try to get cached summary
  const { data: cached } = await supabase
    .from('patch_summaries')
    .select('tldr, key_changes, sentiment, impact_score')
    .eq('patch_id', patchId)
    .single()

  if (cached) {
    return cached as PatchSummaryResult
  }

  // Generate new summary
  try {
    await processPatchSummary(patchId)

    const { data: newSummary } = await supabase
      .from('patch_summaries')
      .select('tldr, key_changes, sentiment, impact_score')
      .eq('patch_id', patchId)
      .single()

    return newSummary as PatchSummaryResult | null
  } catch (error) {
    console.error('Failed to generate patch summary:', error)
    return null
  }
}
