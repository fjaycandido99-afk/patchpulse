'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { WHATS_NEW_SYSTEM, getWhatsNewPrompt, WhatsNewResult } from './prompts'

const CACHE_DURATION_HOURS = 24

type CachedSummary = {
  id: string
  summary: string
  patch_count: number
  news_count: number
  expires_at: string
  since_date: string
}

// Get or generate "What's New" summary for a user's game
export async function getWhatsNewSummary(
  gameId: string
): Promise<WhatsNewResult | null> {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return null
  }

  // Get backlog item with last_played_at
  const { data: backlogItem } = await supabase
    .from('backlog_items')
    .select('last_played_at')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  // If no backlog item or never played, use 30 days ago as default
  const sinceDate = backlogItem?.last_played_at
    ? new Date(backlogItem.last_played_at)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  // Check for valid cached summary
  const { data: cached } = await supabase
    .from('whats_new_cache')
    .select('id, summary, patch_count, news_count, expires_at, since_date')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single() as { data: CachedSummary | null }

  if (cached && new Date(cached.expires_at) > new Date()) {
    // Cache is still valid
    return {
      summary: cached.summary,
      patchCount: cached.patch_count,
      newsCount: cached.news_count,
    }
  }

  // Need to generate new summary
  return await generateWhatsNewSummary(user.id, gameId, sinceDate)
}

async function generateWhatsNewSummary(
  userId: string,
  gameId: string,
  sinceDate: Date
): Promise<WhatsNewResult | null> {
  const adminSupabase = createAdminClient()

  // Get game info
  const { data: game } = await adminSupabase
    .from('games')
    .select('name')
    .eq('id', gameId)
    .single()

  if (!game) {
    return null
  }

  // Get patches since last played
  const { data: patches } = await adminSupabase
    .from('patch_notes')
    .select('title, summary_tldr, impact_score, published_at')
    .eq('game_id', gameId)
    .gte('published_at', sinceDate.toISOString())
    .order('published_at', { ascending: false })
    .limit(10)

  // Get news since last played
  const { data: news } = await adminSupabase
    .from('news_items')
    .select('title, summary, published_at')
    .eq('game_id', gameId)
    .gte('published_at', sinceDate.toISOString())
    .order('published_at', { ascending: false })
    .limit(10)

  const patchList = (patches || []).map(p => ({
    title: p.title,
    summary: p.summary_tldr || '',
    impact_score: p.impact_score || 5,
    published_at: p.published_at,
  }))

  const newsList = (news || []).map(n => ({
    title: n.title,
    summary: n.summary || '',
    published_at: n.published_at,
  }))

  // If no changes, return simple message without calling AI
  if (patchList.length === 0 && newsList.length === 0) {
    const result: WhatsNewResult = {
      summary: "No major updates since you last played! Jump back in and pick up where you left off.",
      patchCount: 0,
      newsCount: 0,
    }

    // Cache this result
    await cacheResult(userId, gameId, sinceDate, result)
    return result
  }

  // Calculate days since last played
  const daysSinceLastPlayed = Math.ceil(
    (Date.now() - sinceDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Call AI to generate summary
  try {
    const anthropic = new Anthropic()

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      system: WHATS_NEW_SYSTEM,
      messages: [
        {
          role: 'user',
          content: getWhatsNewPrompt(game.name, daysSinceLastPlayed, patchList, newsList),
        },
      ],
    })

    const textContent = response.content.find(c => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI')
    }

    const result: WhatsNewResult = {
      summary: textContent.text.trim(),
      patchCount: patchList.length,
      newsCount: newsList.length,
    }

    // Cache the result
    await cacheResult(userId, gameId, sinceDate, result)

    return result
  } catch (error) {
    console.error('Failed to generate What\'s New summary:', error)

    // Return a fallback summary
    const fallback: WhatsNewResult = {
      summary: `${patchList.length} patch${patchList.length !== 1 ? 'es' : ''} and ${newsList.length} news item${newsList.length !== 1 ? 's' : ''} since you last played. Check the patches and news tabs for details!`,
      patchCount: patchList.length,
      newsCount: newsList.length,
    }

    return fallback
  }
}

async function cacheResult(
  userId: string,
  gameId: string,
  sinceDate: Date,
  result: WhatsNewResult
): Promise<void> {
  const adminSupabase = createAdminClient()

  const expiresAt = new Date(Date.now() + CACHE_DURATION_HOURS * 60 * 60 * 1000)

  // Upsert the cache entry
  await adminSupabase
    .from('whats_new_cache')
    .upsert({
      user_id: userId,
      game_id: gameId,
      since_date: sinceDate.toISOString(),
      summary: result.summary,
      patch_count: result.patchCount,
      news_count: result.newsCount,
      expires_at: expiresAt.toISOString(),
    }, {
      onConflict: 'user_id,game_id',
    })
}

// Force refresh the cache (useful when user updates last_played_at)
export async function refreshWhatsNewSummary(gameId: string): Promise<WhatsNewResult | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return null
  }

  // Delete existing cache
  await supabase
    .from('whats_new_cache')
    .delete()
    .eq('user_id', user.id)
    .eq('game_id', gameId)

  // Generate fresh summary
  return await getWhatsNewSummary(gameId)
}
