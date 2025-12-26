import { createClient } from '@/lib/supabase/server'

export type SeasonalImage = {
  coverUrl: string | null
  logoUrl: string | null
  heroUrl: string | null
  brandColor: string | null
  isSeasonal: boolean
  eventName: string | null
  eventType: string | null
}

export type SeasonalEvent = {
  id: string
  gameId: string
  eventName: string
  eventType: string
  startDate: string
  endDate: string
  coverUrl: string | null
  logoUrl: string | null
  heroUrl: string | null
  brandColor: string | null
  sourceUrl: string | null
  confidenceScore: number
  isAutoApproved: boolean
  isAdminApproved: boolean
  discoveredAt: string
}

// Get seasonal image for a single game
export async function getSeasonalGameImage(
  gameId: string
): Promise<SeasonalImage> {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    // Get game with any active seasonal event
    const { data, error } = await supabase
      .from('games')
      .select(`
        cover_url,
        logo_url,
        brand_color,
        seasonal_events!left (
          cover_url,
          logo_url,
          hero_url,
          brand_color,
          event_name,
          event_type,
          confidence_score,
          is_auto_approved,
          is_admin_approved,
          start_date,
          end_date
        )
      `)
      .eq('id', gameId)
      .single()

    if (error || !data) {
      return {
        coverUrl: null,
        logoUrl: null,
        heroUrl: null,
        brandColor: null,
        isSeasonal: false,
        eventName: null,
        eventType: null,
      }
    }

    // Find active seasonal event
    const seasonalEvents = data.seasonal_events as any[]
    const activeEvent = seasonalEvents?.find(
      (e) =>
        (e.is_auto_approved || e.is_admin_approved) &&
        e.start_date <= today &&
        e.end_date >= today
    )

    if (activeEvent) {
      return {
        coverUrl: activeEvent.cover_url || data.cover_url,
        logoUrl: activeEvent.logo_url || data.logo_url,
        heroUrl: activeEvent.hero_url,
        brandColor: activeEvent.brand_color || data.brand_color,
        isSeasonal: true,
        eventName: activeEvent.event_name,
        eventType: activeEvent.event_type,
      }
    }

    return {
      coverUrl: data.cover_url,
      logoUrl: data.logo_url,
      heroUrl: null,
      brandColor: data.brand_color,
      isSeasonal: false,
      eventName: null,
      eventType: null,
    }
  } catch {
    return {
      coverUrl: null,
      logoUrl: null,
      heroUrl: null,
      brandColor: null,
      isSeasonal: false,
      eventName: null,
      eventType: null,
    }
  }
}

// Batch fetch seasonal images for multiple games (efficient for lists)
export async function batchGetSeasonalImages(
  gameIds: string[]
): Promise<Map<string, SeasonalImage>> {
  const results = new Map<string, SeasonalImage>()

  if (gameIds.length === 0) return results

  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    // Fetch all games with their seasonal events
    const { data: games, error } = await supabase
      .from('games')
      .select(`
        id,
        cover_url,
        logo_url,
        brand_color,
        seasonal_events!left (
          cover_url,
          logo_url,
          hero_url,
          brand_color,
          event_name,
          event_type,
          confidence_score,
          is_auto_approved,
          is_admin_approved,
          start_date,
          end_date
        )
      `)
      .in('id', gameIds)

    if (error || !games) {
      return results
    }

    for (const game of games) {
      const seasonalEvents = game.seasonal_events as any[]

      // Find highest confidence active event
      const activeEvent = seasonalEvents
        ?.filter(
          (e) =>
            (e.is_auto_approved || e.is_admin_approved) &&
            e.start_date <= today &&
            e.end_date >= today
        )
        .sort((a, b) => b.confidence_score - a.confidence_score)[0]

      if (activeEvent) {
        results.set(game.id, {
          coverUrl: activeEvent.cover_url || game.cover_url,
          logoUrl: activeEvent.logo_url || game.logo_url,
          heroUrl: activeEvent.hero_url,
          brandColor: activeEvent.brand_color || game.brand_color,
          isSeasonal: true,
          eventName: activeEvent.event_name,
          eventType: activeEvent.event_type,
        })
      } else {
        results.set(game.id, {
          coverUrl: game.cover_url,
          logoUrl: game.logo_url,
          heroUrl: null,
          brandColor: game.brand_color,
          isSeasonal: false,
          eventName: null,
          eventType: null,
        })
      }
    }
  } catch {
    // Return empty results on error
  }

  return results
}

// Get all active seasonal events
export async function getActiveSeasonalEvents(): Promise<SeasonalEvent[]> {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('seasonal_events')
      .select('*')
      .or('is_auto_approved.eq.true,is_admin_approved.eq.true')
      .lte('start_date', today)
      .gte('end_date', today)
      .order('confidence_score', { ascending: false })

    if (error || !data) {
      return []
    }

    return data.map((e) => ({
      id: e.id,
      gameId: e.game_id,
      eventName: e.event_name,
      eventType: e.event_type,
      startDate: e.start_date,
      endDate: e.end_date,
      coverUrl: e.cover_url,
      logoUrl: e.logo_url,
      heroUrl: e.hero_url,
      brandColor: e.brand_color,
      sourceUrl: e.source_url,
      confidenceScore: e.confidence_score,
      isAutoApproved: e.is_auto_approved,
      isAdminApproved: e.is_admin_approved,
      discoveredAt: e.discovered_at,
    }))
  } catch {
    return []
  }
}

// Get pending seasonal events (for admin review)
export async function getPendingSeasonalEvents(): Promise<SeasonalEvent[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('seasonal_events')
      .select('*')
      .eq('is_auto_approved', false)
      .eq('is_admin_approved', false)
      .order('discovered_at', { ascending: false })

    if (error || !data) {
      return []
    }

    return data.map((e) => ({
      id: e.id,
      gameId: e.game_id,
      eventName: e.event_name,
      eventType: e.event_type,
      startDate: e.start_date,
      endDate: e.end_date,
      coverUrl: e.cover_url,
      logoUrl: e.logo_url,
      heroUrl: e.hero_url,
      brandColor: e.brand_color,
      sourceUrl: e.source_url,
      confidenceScore: e.confidence_score,
      isAutoApproved: e.is_auto_approved,
      isAdminApproved: e.is_admin_approved,
      discoveredAt: e.discovered_at,
    }))
  } catch {
    return []
  }
}

// Approve a seasonal event
export async function approveSeasonalEvent(eventId: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('seasonal_events')
      .update({ is_admin_approved: true })
      .eq('id', eventId)

    return !error
  } catch {
    return false
  }
}

// Reject/delete a seasonal event
export async function rejectSeasonalEvent(eventId: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('seasonal_events')
      .delete()
      .eq('id', eventId)

    return !error
  } catch {
    return false
  }
}

// Create a seasonal event (from AI discovery or manual)
export async function createSeasonalEvent(event: {
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
  confidenceScore?: number
}): Promise<{ id: string } | null> {
  try {
    const supabase = await createClient()

    const isAutoApproved = (event.confidenceScore ?? 0) >= 0.8

    const { data, error } = await supabase
      .from('seasonal_events')
      .insert({
        game_id: event.gameId,
        event_name: event.eventName,
        event_type: event.eventType,
        start_date: event.startDate,
        end_date: event.endDate,
        cover_url: event.coverUrl,
        logo_url: event.logoUrl,
        hero_url: event.heroUrl,
        brand_color: event.brandColor,
        source_url: event.sourceUrl,
        confidence_score: event.confidenceScore ?? 0,
        is_auto_approved: isAutoApproved,
      })
      .select('id')
      .single()

    if (error || !data) {
      return null
    }

    return { id: data.id }
  } catch {
    return null
  }
}
