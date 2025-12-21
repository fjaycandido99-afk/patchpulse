import { runPatchAI, runNewsAI, PatchAIResult, NewsAIResult } from './provider'

// Re-export types for convenience
export type { PatchAIResult, NewsAIResult }

export async function processPatchSummary(
  gameName: string,
  patchTitle: string,
  rawText: string
): Promise<PatchAIResult> {
  if (!rawText || rawText.trim().length < 10) {
    throw new Error('Raw text is too short to summarize')
  }

  const result = await runPatchAI({ gameName, patchTitle, rawText })

  // Validate and clamp values
  return {
    summary_tldr: (result.summary_tldr || '').slice(0, 280),
    key_changes: (result.key_changes || []).slice(0, 8).map((kc) => ({
      category: (kc.category || 'General').slice(0, 50),
      change: (kc.change || '').slice(0, 100),
    })),
    tags: (result.tags || []).slice(0, 4),
    impact_score: Math.min(10, Math.max(1, Math.round(result.impact_score || 5))),
    who_it_affects: result.who_it_affects || ['all'],
    confidence: Math.min(1, Math.max(0, result.confidence || 0.8)),
  }
}

export async function processNewsSummary(
  gameName: string | null,
  headline: string,
  rawText: string,
  sourceName: string | null
): Promise<NewsAIResult> {
  if (!rawText || rawText.trim().length < 10) {
    throw new Error('Raw text is too short to summarize')
  }

  const result = await runNewsAI({
    gameNameOrGeneral: gameName || 'General Gaming',
    title: headline,
    rawText,
    sourceName,
  })

  // Validate and clamp values
  return {
    summary: (result.summary || '').slice(0, 450),
    why_it_matters: (result.why_it_matters || '').slice(0, 300),
    topics: (result.topics || []).slice(0, 3),
    is_rumor: Boolean(result.is_rumor),
    confidence: Math.min(1, Math.max(0, result.confidence || 0.8)),
  }
}
