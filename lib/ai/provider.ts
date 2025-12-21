import Anthropic from '@anthropic-ai/sdk'
import {
  PATCH_SUMMARY_SYSTEM,
  NEWS_SUMMARY_SYSTEM,
  getPatchSummaryPrompt,
  getNewsSummaryPrompt,
} from './prompts'

// ============================================================================
// TYPES
// ============================================================================

export type PatchAIResult = {
  summary_tldr: string
  key_changes: Array<{ category: string; change: string }>
  tags: string[]
  impact_score: number
  who_it_affects?: string[]
  confidence?: number
}

export type NewsAIResult = {
  summary: string
  why_it_matters: string
  topics: string[]
  is_rumor: boolean
  confidence?: number
}

// ============================================================================
// PROVIDER IMPLEMENTATION (Anthropic Claude)
// ============================================================================

const anthropic = new Anthropic()
const MODEL = 'claude-sonnet-4-20250514'

async function callClaude(system: string, userPrompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
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
  // Strip markdown code blocks if present
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

// ============================================================================
// PUBLIC API
// ============================================================================

export async function runPatchAI(input: {
  gameName: string
  patchTitle: string
  rawText: string
}): Promise<PatchAIResult> {
  const prompt = getPatchSummaryPrompt(input.gameName, input.patchTitle, input.rawText)
  const raw = await callClaude(PATCH_SUMMARY_SYSTEM, prompt)
  return parseJSON<PatchAIResult>(raw)
}

export async function runNewsAI(input: {
  gameNameOrGeneral: string
  title: string
  rawText: string
  sourceName?: string | null
  sourceUrl?: string | null
}): Promise<NewsAIResult> {
  const prompt = getNewsSummaryPrompt(
    input.gameNameOrGeneral,
    input.title,
    input.rawText,
    input.sourceName ?? null
  )
  const raw = await callClaude(NEWS_SUMMARY_SYSTEM, prompt)
  return parseJSON<NewsAIResult>(raw)
}
