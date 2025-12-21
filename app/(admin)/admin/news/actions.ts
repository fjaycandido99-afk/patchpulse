'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { queueAIJob } from '@/lib/ai/jobs'

// Validation helpers
function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function sanitizeString(str: string): string {
  return str.trim().replace(/\s+/g, ' ')
}

function parseTopics(topics: string | string[]): string[] {
  if (Array.isArray(topics)) {
    return topics.map(t => sanitizeString(t)).filter(Boolean)
  }
  return topics
    .split(',')
    .map(t => sanitizeString(t))
    .filter(Boolean)
}

// Types
export type CreateNewsInput = {
  gameId?: string
  title: string
  publishedAt?: string
  summary: string
  whyItMatters?: string
  topics: string[] | string
  isRumor: boolean
  sourceName?: string
  sourceUrl?: string
}

export type NewsItemWithGame = {
  id: string
  game_id: string | null
  title: string
  published_at: string
  source_name: string | null
  source_url: string | null
  summary: string | null
  why_it_matters: string | null
  topics: string[]
  is_rumor: boolean
  created_at: string
  game: { id: string; name: string } | null
}

// Server Actions
export async function createNewsItem(input: CreateNewsInput) {
  // Validate required fields
  const title = sanitizeString(input.title)
  if (!title) {
    return { error: 'Title is required' }
  }
  if (title.length > 200) {
    return { error: 'Title must be 200 characters or less' }
  }

  const summary = sanitizeString(input.summary)
  if (!summary) {
    return { error: 'Summary is required' }
  }
  if (summary.length > 2000) {
    return { error: 'Summary must be 2000 characters or less' }
  }

  // Validate optional fields
  const whyItMatters = input.whyItMatters ? sanitizeString(input.whyItMatters) : null
  if (whyItMatters && whyItMatters.length > 1000) {
    return { error: 'Why it matters must be 1000 characters or less' }
  }

  const sourceName = input.sourceName ? sanitizeString(input.sourceName) : null
  if (sourceName && sourceName.length > 100) {
    return { error: 'Source name must be 100 characters or less' }
  }

  const sourceUrl = input.sourceUrl?.trim() || null
  if (sourceUrl && !validateUrl(sourceUrl)) {
    return { error: 'Source URL must be a valid URL' }
  }

  // Parse topics
  const topics = parseTopics(input.topics)
  if (topics.length > 10) {
    return { error: 'Maximum 10 topics allowed' }
  }

  // Validate game ID if provided
  const gameId = input.gameId?.trim() || null
  if (gameId) {
    const supabaseCheck = createAdminClient()
    const { data: game } = await supabaseCheck
      .from('games')
      .select('id')
      .eq('id', gameId)
      .single()

    if (!game) {
      return { error: 'Selected game does not exist' }
    }
  }

  // Parse and validate published date
  let publishedAt: string
  if (input.publishedAt) {
    const date = new Date(input.publishedAt)
    if (isNaN(date.getTime())) {
      return { error: 'Invalid published date' }
    }
    publishedAt = date.toISOString()
  } else {
    publishedAt = new Date().toISOString()
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('news_items')
    .insert({
      game_id: gameId,
      title,
      summary,
      why_it_matters: whyItMatters,
      topics,
      is_rumor: Boolean(input.isRumor),
      source_name: sourceName,
      source_url: sourceUrl,
      published_at: publishedAt,
    })
    .select()
    .single()

  if (error) {
    console.error('Create news item error:', error)
    return { error: 'Failed to create news item. Please try again.' }
  }

  revalidatePath('/admin/news')
  revalidatePath('/news')
  revalidatePath('/home')
  return { data }
}

export type UpdateNewsInput = {
  id: string
  gameId?: string
  title: string
  publishedAt?: string
  summary: string
  whyItMatters?: string
  topics: string[] | string
  isRumor: boolean
  sourceName?: string
  sourceUrl?: string
}

export async function updateNewsItem(input: UpdateNewsInput) {
  // Validate required fields
  const title = sanitizeString(input.title)
  if (!title) {
    return { error: 'Title is required' }
  }
  if (title.length > 200) {
    return { error: 'Title must be 200 characters or less' }
  }

  const summary = sanitizeString(input.summary)
  if (!summary) {
    return { error: 'Summary is required' }
  }
  if (summary.length > 2000) {
    return { error: 'Summary must be 2000 characters or less' }
  }

  // Validate optional fields
  const whyItMatters = input.whyItMatters ? sanitizeString(input.whyItMatters) : null
  if (whyItMatters && whyItMatters.length > 1000) {
    return { error: 'Why it matters must be 1000 characters or less' }
  }

  const sourceName = input.sourceName ? sanitizeString(input.sourceName) : null
  if (sourceName && sourceName.length > 100) {
    return { error: 'Source name must be 100 characters or less' }
  }

  const sourceUrl = input.sourceUrl?.trim() || null
  if (sourceUrl && !validateUrl(sourceUrl)) {
    return { error: 'Source URL must be a valid URL' }
  }

  // Parse topics
  const topics = parseTopics(input.topics)
  if (topics.length > 10) {
    return { error: 'Maximum 10 topics allowed' }
  }

  // Validate game ID if provided
  const gameId = input.gameId?.trim() || null
  if (gameId) {
    const supabaseCheck = createAdminClient()
    const { data: game } = await supabaseCheck
      .from('games')
      .select('id')
      .eq('id', gameId)
      .single()

    if (!game) {
      return { error: 'Selected game does not exist' }
    }
  }

  // Parse and validate published date
  let publishedAt: string | undefined
  if (input.publishedAt) {
    const date = new Date(input.publishedAt)
    if (isNaN(date.getTime())) {
      return { error: 'Invalid published date' }
    }
    publishedAt = date.toISOString()
  }

  const supabase = createAdminClient()

  const updateData: Record<string, unknown> = {
    game_id: gameId,
    title,
    summary,
    why_it_matters: whyItMatters,
    topics,
    is_rumor: Boolean(input.isRumor),
    source_name: sourceName,
    source_url: sourceUrl,
  }

  if (publishedAt) {
    updateData.published_at = publishedAt
  }

  const { data, error } = await supabase
    .from('news_items')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) {
    console.error('Update news item error:', error)
    return { error: 'Failed to update news item. Please try again.' }
  }

  revalidatePath('/admin/news')
  revalidatePath('/news')
  revalidatePath('/home')
  return { data }
}

export async function deleteNewsItem(id: string) {
  if (!id || typeof id !== 'string') {
    return { error: 'Invalid news item ID' }
  }

  const supabase = createAdminClient()

  // Verify the item exists first
  const { data: existing } = await supabase
    .from('news_items')
    .select('id')
    .eq('id', id)
    .single()

  if (!existing) {
    return { error: 'News item not found' }
  }

  const { error } = await supabase
    .from('news_items')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Delete news item error:', error)
    return { error: 'Failed to delete news item. Please try again.' }
  }

  revalidatePath('/admin/news')
  revalidatePath('/news')
  revalidatePath('/home')
  return { success: true }
}

export async function getNewsItems(limit = 50): Promise<NewsItemWithGame[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('news_items')
    .select(`
      id,
      game_id,
      title,
      published_at,
      source_name,
      source_url,
      summary,
      why_it_matters,
      topics,
      is_rumor,
      created_at,
      game:games(id, name)
    `)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Get news items error:', error)
    return []
  }

  // Transform the data to match our type (game is returned as array by Supabase)
  return (data || []).map(item => ({
    ...item,
    game: Array.isArray(item.game) ? item.game[0] || null : item.game
  })) as NewsItemWithGame[]
}

// Create news with raw text and queue AI processing
export type CreateNewsWithAIInput = {
  gameId?: string
  title: string
  rawText: string
  sourceName?: string
  sourceUrl?: string
}

export async function createNewsItemWithAI(input: CreateNewsWithAIInput) {
  const title = sanitizeString(input.title)
  if (!title) {
    return { error: 'Title is required' }
  }
  if (title.length > 200) {
    return { error: 'Title must be 200 characters or less' }
  }

  const rawText = input.rawText?.trim()
  if (!rawText) {
    return { error: 'Raw news text is required' }
  }

  const sourceName = input.sourceName ? sanitizeString(input.sourceName) : null
  const sourceUrl = input.sourceUrl?.trim() || null
  if (sourceUrl && !validateUrl(sourceUrl)) {
    return { error: 'Source URL must be a valid URL' }
  }

  const gameId = input.gameId?.trim() || null
  if (gameId) {
    const supabaseCheck = createAdminClient()
    const { data: game } = await supabaseCheck
      .from('games')
      .select('id')
      .eq('id', gameId)
      .single()

    if (!game) {
      return { error: 'Selected game does not exist' }
    }
  }

  const supabase = createAdminClient()

  // Insert news with raw text as summary, AI will enhance it
  const { data, error } = await supabase
    .from('news_items')
    .insert({
      game_id: gameId,
      title,
      summary: rawText, // Store raw text in summary, AI will refine it
      why_it_matters: null,
      topics: [],
      is_rumor: false,
      source_name: sourceName,
      source_url: sourceUrl,
      published_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Create news item error:', error)
    return { error: 'Failed to create news item. Please try again.' }
  }

  // Queue AI job to process the news
  const jobResult = await queueAIJob('NEWS_SUMMARY', data.id)
  if ('error' in jobResult) {
    console.error('Failed to queue AI job:', jobResult.error)
  }

  revalidatePath('/admin/news')
  revalidatePath('/news')
  revalidatePath('/home')
  return { data, aiJobQueued: !('error' in jobResult) }
}
