'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type Provider = 'steam' | 'xbox' | 'psn' | 'epic' | 'battlenet' | 'riot'

export type ConnectedAccount = {
  id: string
  provider: Provider
  external_user_id: string
  display_name: string | null
  avatar_url: string | null
  last_sync_at: string | null
  created_at: string
}

export async function getConnectedAccounts(): Promise<ConnectedAccount[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('connected_accounts')
    .select('id, provider, external_user_id, display_name, avatar_url, last_sync_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to get connected accounts:', error)
    return []
  }

  return data as ConnectedAccount[]
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
}
