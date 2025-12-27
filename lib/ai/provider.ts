import OpenAI from 'openai'
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
// OPENAI PROVIDER (for summaries - cheaper and reliable)
// ============================================================================

let _openai: OpenAI | null = null
function getOpenAIClient() {
  if (!_openai) _openai = new OpenAI()
  return _openai
}
const OPENAI_MODEL = 'gpt-4o'

async function callOpenAI(system: string, userPrompt: string): Promise<string> {
  const response = await getOpenAIClient().chat.completions.create({
    model: OPENAI_MODEL,
    max_tokens: 1024,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userPrompt },
    ],
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from OpenAI')
  }

  return content
}

// ============================================================================
// ANTHROPIC PROVIDER (for web search features)
// ============================================================================

let _anthropic: Anthropic | null = null
function getAnthropicClient() {
  if (!_anthropic) _anthropic = new Anthropic()
  return _anthropic
}
const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514'

// ============================================================================
// HELPERS
// ============================================================================

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

// Uses OpenAI GPT-4o for patch summaries
export async function runPatchAI(input: {
  gameName: string
  patchTitle: string
  rawText: string
}): Promise<PatchAIResult> {
  const prompt = getPatchSummaryPrompt(input.gameName, input.patchTitle, input.rawText)
  const raw = await callOpenAI(PATCH_SUMMARY_SYSTEM, prompt)
  return parseJSON<PatchAIResult>(raw)
}

// Uses OpenAI GPT-4o for news summaries
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
  const raw = await callOpenAI(NEWS_SUMMARY_SYSTEM, prompt)
  return parseJSON<NewsAIResult>(raw)
}

// Uses Anthropic Claude with web search for URL discovery
export async function discoverPatchSourceUrl(input: {
  gameName: string
  patchTitle: string
  publishedDate?: string
}): Promise<SourceUrlDiscoveryResult> {
  // Check if Anthropic API key is available
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('Anthropic API key not available, skipping source URL discovery')
    return { source_url: null, source_name: null, confidence: 0 }
  }

  const prompt = getSourceUrlDiscoveryPrompt(
    input.gameName,
    input.patchTitle,
    input.publishedDate
  )

  try {
    // Use web search to find the official patch notes URL
    const response = await getAnthropicClient().messages.create({
      model: ANTHROPIC_MODEL,
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

    return parseJSON<SourceUrlDiscoveryResult>(textBlock.text)
  } catch (error) {
    console.warn('Source URL discovery failed:', error)
    return { source_url: null, source_name: null, confidence: 0 }
  }
}
