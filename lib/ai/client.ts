import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export type AIModel = 'claude-3-haiku-20240307' | 'claude-sonnet-4-20250514'

type CompletionOptions = {
  model?: AIModel
  maxTokens?: number
  temperature?: number
}

/**
 * Generate a text completion using Claude
 */
export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  options: CompletionOptions = {}
): Promise<string> {
  const {
    model = 'claude-3-haiku-20240307',
    maxTokens = 1000,
    temperature = 0.7
  } = options

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt },
    ],
  })

  const content = response.content[0]
  return content.type === 'text' ? content.text : ''
}

/**
 * Generate a structured JSON response
 */
export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  options: CompletionOptions = {}
): Promise<T> {
  const {
    model = 'claude-3-haiku-20240307',
    maxTokens = 1000,
    temperature = 0.3
  } = options

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt + '\n\nRespond with valid JSON only. No markdown, no explanation, just the JSON object.',
    messages: [
      { role: 'user', content: userPrompt },
    ],
  })

  const content = response.content[0]
  const text = content.type === 'text' ? content.text : '{}'

  // Clean up potential markdown formatting
  const cleanJson = text
    .replace(/^```json\n?/i, '')
    .replace(/^```\n?/, '')
    .replace(/\n?```$/i, '')
    .trim()

  return JSON.parse(cleanJson) as T
}

/**
 * Generate embeddings for semantic search
 * Note: Anthropic doesn't have embeddings, so we'll use a simple hash for now
 * In production, you'd want to use a dedicated embeddings service
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Placeholder - for real embeddings, use OpenAI or another service
  const hash = Array.from(text).reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0)
  }, 0)

  // Return a simple 8-dimensional pseudo-embedding
  return Array(8).fill(0).map((_, i) => Math.sin(hash * (i + 1)) * 0.5 + 0.5)
}

export { anthropic }
