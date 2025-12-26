'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { queueAIJob } from '@/lib/ai/jobs'

export type SeasonalEventRow = {
  id: string
  game_id: string
  event_name: string
  event_type: string
  start_date: string
  end_date: string
  cover_url: string | null
  logo_url: string | null
  hero_url: string | null
  brand_color: string | null
  source_url: string | null
  confidence_score: number
  is_auto_approved: boolean
  is_admin_approved: boolean
  discovered_at: string
  games: {
    name: string
    cover_url: string | null
  } | null
}

// Get all seasonal events
export async function getSeasonalEvents(): Promise<SeasonalEventRow[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('seasonal_events')
    .select('*, games(name, cover_url)')
    .order('discovered_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch seasonal events:', error)
    return []
  }

  return data || []
}

// Get pending events (need admin review)
export async function getPendingEvents(): Promise<SeasonalEventRow[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('seasonal_events')
    .select('*, games(name, cover_url)')
    .eq('is_auto_approved', false)
    .eq('is_admin_approved', false)
    .order('confidence_score', { ascending: false })

  if (error) {
    console.error('Failed to fetch pending events:', error)
    return []
  }

  return data || []
}

// Get active events
export async function getActiveEvents(): Promise<SeasonalEventRow[]> {
  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('seasonal_events')
    .select('*, games(name, cover_url)')
    .or('is_auto_approved.eq.true,is_admin_approved.eq.true')
    .lte('start_date', today)
    .gte('end_date', today)
    .order('event_name')

  if (error) {
    console.error('Failed to fetch active events:', error)
    return []
  }

  return data || []
}

// Approve an event
export async function approveEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('seasonal_events')
    .update({ is_admin_approved: true })
    .eq('id', eventId)

  if (error) {
    console.error('Failed to approve event:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Reject/delete an event
export async function rejectEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('seasonal_events')
    .delete()
    .eq('id', eventId)

  if (error) {
    console.error('Failed to reject event:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// Trigger discovery scan for a game
export async function triggerDiscovery(gameId: string): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    const result = await queueAIJob('DISCOVER_SEASONAL', gameId)

    if ('error' in result) {
      return { success: false, error: result.error }
    }

    return { success: true, jobId: result.id }
  } catch (error) {
    console.error('Failed to trigger discovery:', error)
    return { success: false, error: 'Failed to queue job' }
  }
}

// Create a manual seasonal event
export async function createManualEvent(data: {
  gameId: string
  eventName: string
  eventType: string
  startDate: string
  endDate: string
  coverUrl?: string
  logoUrl?: string
  heroUrl?: string
  brandColor?: string
  sourceUrl?: string
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = createAdminClient()

  const { data: result, error } = await supabase
    .from('seasonal_events')
    .insert({
      game_id: data.gameId,
      event_name: data.eventName,
      event_type: data.eventType,
      start_date: data.startDate,
      end_date: data.endDate,
      cover_url: data.coverUrl || null,
      logo_url: data.logoUrl || null,
      hero_url: data.heroUrl || null,
      brand_color: data.brandColor || null,
      source_url: data.sourceUrl || null,
      confidence_score: 1.0, // Manual entries have full confidence
      is_admin_approved: true, // Auto-approve manual entries
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to create event:', error)
    return { success: false, error: error.message }
  }

  return { success: true, id: result.id }
}

// Get games for dropdown
export async function getGamesForDropdown(): Promise<Array<{ id: string; name: string }>> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('games')
    .select('id, name')
    .order('name')

  if (error) {
    console.error('Failed to fetch games:', error)
    return []
  }

  return data || []
}
