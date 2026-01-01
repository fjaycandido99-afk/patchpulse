'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleGameReminder(gameId: string, releaseDate: string | null) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if reminder already exists
  const { data: existing } = await supabase
    .from('game_reminders')
    .select('id')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  if (existing) {
    // Remove reminder
    const { error } = await supabase
      .from('game_reminders')
      .delete()
      .eq('id', existing.id)

    if (error) {
      return { error: 'Failed to remove reminder' }
    }

    revalidatePath('/', 'layout')
    return { success: true, hasReminder: false }
  } else {
    // Add reminder - set remind_at to release date at 9am local or now + 1 day if no date
    let remindAt: Date

    if (releaseDate) {
      remindAt = new Date(releaseDate)
      remindAt.setHours(9, 0, 0, 0) // 9am on release day
    } else {
      // No release date, remind in 1 week
      remindAt = new Date()
      remindAt.setDate(remindAt.getDate() + 7)
    }

    const { error } = await supabase.from('game_reminders').insert({
      user_id: user.id,
      game_id: gameId,
      remind_at: remindAt.toISOString(),
    })

    if (error) {
      return { error: 'Failed to set reminder' }
    }

    revalidatePath('/', 'layout')
    return { success: true, hasReminder: true }
  }
}

export async function getGameReminder(gameId: string): Promise<boolean> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data } = await supabase
    .from('game_reminders')
    .select('id')
    .eq('user_id', user.id)
    .eq('game_id', gameId)
    .single()

  return !!data
}

export async function getUserReminders() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data } = await supabase
    .from('game_reminders')
    .select(`
      id,
      remind_at,
      game:games(
        id,
        name,
        slug,
        cover_url,
        release_date
      )
    `)
    .eq('user_id', user.id)
    .is('notified_at', null)
    .order('remind_at', { ascending: true })

  return data || []
}
