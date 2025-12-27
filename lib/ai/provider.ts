import Anthropic from '@anthropic-ai/sdk'
import {
  PATCH_SUMMARY_SYSTEM,
  NEWS_SUMMARY_SYSTEM,
  SOURCE_URL_DISCOVERY_SYSTEM,
  getPatchSummaryPrompt,
  getNewsSummaryPrompt,
  getSourceUrlDiscoveryPrompt,
} from './prompts'

// ============================================================================
// TYPES
// ============================================================================

export type PatchAIResult = {
  summary_tldr: string
  ai_insight: string
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

export type SourceUrlDiscoveryResult = {
  source_url: string | null
  source_name: string | null
  confidence: number
}

// ============================================================================
// PROVIDER IMPLEMENTATION (Anthropic Claude)
// ============================================================================

let _anthropic: Anthropic | null = null
function getClient() {
  if (!_anthropic) _anthropic = new Anthropic()
  return _anthropic
}
const MODEL = 'claude-sonnet-4-20250514'

async function callClaude(system: string, userPrompt: string): Promise<string> {
  const response = await getClient().messages.create({
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

export async function discoverPatchSourceUrl(input: {
  gameName: string
  patchTitle: string
  publishedDate?: string
}): Promise<SourceUrlDiscoveryResult> {
  const prompt = getSourceUrlDiscoveryPrompt(
    input.gameName,
    input.patchTitle,
    input.publishedDate
  )

  // Use web search to find the official patch notes URL
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 512,
    system: SOURCE_URL_DISCOVERY_SYSTEM,
    tools: [
      {
        type: 'web_search_20250305',
        name: 'web_search',
        max_uses: 3,
      },
    ],
    messages: [{ role: 'user', content: prompt }],
  })

  // Extract text response
  const textBlock = response.content.find((c) => c.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    return { source_url: null, source_name: null, confidence: 0 }
  }

  try {
    return parseJSON<SourceUrlDiscoveryResult>(textBlock.text)
  } catch {
    return { source_url: null, source_name: null, confidence: 0 }
  }
}
