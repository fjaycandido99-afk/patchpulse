'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type Provider = 'steam' | 'xbox' | 'psn' | 'epic' | 'battlenet' | 'riot'

// ============================================================================
// PROFILE UPDATE ACTIONS
// ============================================================================

export async function updateProfile(data: {
  displayName?: string
  bio?: string | null
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const updates: Record<string, unknown> = {}

  if (data.displayName !== undefined) {
    if (data.displayName && data.displayName.length > 50) {
      return { error: 'Display name must be 50 characters or less' }
    }
    updates.display_name = data.displayName || null
  }

  if (data.bio !== undefined) {
    if (data.bio && data.bio.length > 200) {
      return { error: 'Bio must be 200 characters or less' }
    }
    updates.bio = data.bio
  }

  if (Object.keys(updates).length === 0) {
    return { error: 'No updates provided' }
  }

  const { error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    console.error('Failed to update profile:', error)
    return { error: 'Failed to update profile' }
  }

  revalidatePath('/profile')
  return { success: true }
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { error: 'No file provided' }
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return { error: 'File must be an image' }
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'Image must be less than 5MB' }
  }

  // Generate unique filename
  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `${user.id}/${Date.now()}.${ext}`

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    console.error('Failed to upload avatar:', uploadError)
    return { error: 'Failed to upload avatar' }
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filename)

  // Update profile with new avatar URL
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ avatar_url: urlData.publicUrl })
    .eq('id', user.id)

  if (updateError) {
    console.error('Failed to update avatar URL:', updateError)
    return { error: 'Failed to save avatar' }
  }

  revalidatePath('/profile')
  return { success: true, url: urlData.publicUrl }
}

export async function updateFavoriteGames(gameIds: string[]) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Validate max 5 favorites
  if (gameIds.length > 5) {
    return { error: 'Maximum 5 favorite games allowed' }
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({ favorite_game_ids: gameIds })
    .eq('id', user.id)

  if (error) {
    console.error('Failed to update favorite games:', error)
    return { error: 'Failed to update favorites' }
  }

  revalidatePath('/profile')
  return { success: true }
}

// ============================================================================
// PROFILE DATA QUERIES
// ============================================================================

export async function getProfileStats() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Get followed games count
    const { count: followedCount } = await supabase
      .from('user_games')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Get backlog stats
    const { data: backlogData } = await supabase
      .from('backlog_items')
      .select('status')
      .eq('user_id', user.id)

    const backlogStats = {
      total: backlogData?.length || 0,
      playing: 0,
      paused: 0,
      backlog: 0,
      finished: 0,
      dropped: 0,
    }

    if (backlogData) {
      for (const item of backlogData) {
        const status = item.status as keyof typeof backlogStats
        if (status in backlogStats) {
          backlogStats[status]++
        }
      }
    }

    // Get playtime from library (Steam and Xbox only)
    const { data: libraryData } = await supabase
      .from('user_library_games')
      .select('playtime_minutes')
      .eq('user_id', user.id)
      .in('provider', ['steam', 'xbox'])

    const totalPlaytime = libraryData?.reduce(
      (sum, g) => sum + (g.playtime_minutes || 0),
      0
    ) || 0

    return {
      followedCount: followedCount || 0,
      backlogCount: backlogStats.total,
      playingCount: backlogStats.playing,
      completedCount: backlogStats.finished,
      pausedCount: backlogStats.paused,
      totalPlaytime,
    }
  } catch {
    return null
  }
}

export async function getFollowedGames() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('user_games')
      .select('games(id, name, slug, cover_url)')
      .eq('user_id', user.id)

    if (error || !data) return []

    return data
      .map((ug) => ug.games as unknown as { id: string; name: string; slug: string; cover_url: string | null })
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch {
    return []
  }
}

export async function getBacklogGames() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('backlog_items')
      .select('status, progress, games(id, name, slug, cover_url)')
      .eq('user_id', user.id)

    if (error || !data) return []

    return data
      .map((item) => {
        const game = item.games as unknown as { id: string; name: string; slug: string; cover_url: string | null }
        if (!game) return null
        return {
          ...game,
          status: item.status as 'playing' | 'paused' | 'backlog' | 'finished' | 'dropped',
          progress: item.progress || 0,
        }
      })
      .filter((g): g is NonNullable<typeof g> => g !== null)
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch {
    return []
  }
}

export async function getFavoriteGames(favoriteIds: string[]) {
  if (favoriteIds.length === 0) return []

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('games')
      .select('id, name, slug, cover_url')
      .in('id', favoriteIds)

    if (error || !data) return []

    // Sort by the order in favoriteIds
    return favoriteIds
      .map((id) => data.find((g) => g.id === id))
      .filter((g): g is NonNullable<typeof g> => g !== undefined)
  } catch {
    return []
  }
}

export type ConnectedAccount = {
  id: string
  provider: Provider
  external_user_id: string
  display_name: string | null
  avatar_url: string | null
  last_sync_at: string | null
  created_at: string
  metadata: Record<string, unknown> | null
}

export async function getConnectedAccounts(): Promise<ConnectedAccount[]> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('connected_accounts')
      .select('id, provider, external_user_id, display_name, avatar_url, last_sync_at, created_at, metadata')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to get connected accounts:', error)
      return []
    }

    return (data || []) as ConnectedAccount[]
  } catch {
    return []
  }
}

export async function addManualAccount(provider: Provider, displayName: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  if (!displayName.trim()) {
    return { error: 'Display name is required' }
  }

  // For manual accounts, external_user_id is the display name
  const { error } = await supabase
    .from('connected_accounts')
    .upsert({
      user_id: user.id,
      provider,
      external_user_id: displayName.trim().toLowerCase(),
      display_name: displayName.trim(),
    }, {
      onConflict: 'user_id,provider',
    })

  if (error) {
    console.error('Failed to add account:', error)
    return { error: 'Failed to add account' }
  }

  revalidatePath('/profile')
  return { success: true }
}

export async function disconnectAccount(provider: Provider) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('connected_accounts')
    .delete()
    .eq('user_id', user.id)
    .eq('provider', provider)

  if (error) {
    console.error('Failed to disconnect account:', error)
    return { error: 'Failed to disconnect account' }
  }

  // Also delete imported games from this provider
  await supabase
    .from('user_library_games')
    .delete()
    .eq('user_id', user.id)
    .eq('provider', provider)

  revalidatePath('/profile')
  return { success: true }
}

export async function getLibraryStats() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('user_library_games')
      .select('provider, playtime_minutes')
      .eq('user_id', user.id)

    if (error || !data) return null

    const stats = {
      totalGames: data.length,
      totalPlaytime: data.reduce((sum, g) => sum + (g.playtime_minutes || 0), 0),
      byProvider: {} as Record<string, number>,
    }

    for (const game of data) {
      stats.byProvider[game.provider] = (stats.byProvider[game.provider] || 0) + 1
    }

    return stats
  } catch {
    return null
  }
}

export async function getPlaytimeGames() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Get library games with playtime from Steam and Xbox only
    const { data, error } = await supabase
      .from('user_library_games')
      .select(`
        playtime_minutes,
        provider,
        games:game_id (
          id,
          name,
          slug,
          cover_url
        )
      `)
      .eq('user_id', user.id)
      .in('provider', ['steam', 'xbox'])
      .gt('playtime_minutes', 0)
      .order('playtime_minutes', { ascending: false })
      .limit(12)

    if (error || !data) return []

    return data
      .map((item) => {
        const game = item.games as unknown as { id: string; name: string; slug: string; cover_url: string | null } | null
        if (!game) return null
        return {
          ...game,
          playtime_minutes: item.playtime_minutes || 0,
          provider: item.provider as 'steam' | 'xbox',
        }
      })
      .filter((g): g is NonNullable<typeof g> => g !== null)
  } catch {
    return []
  }
}
