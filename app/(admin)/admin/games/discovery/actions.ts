'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function approveDiscovery(id: string) {
  const supabase = await createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/home')

  // Get the discovery item
  const adminClient = createAdminClient()

  const { data: item, error: fetchError } = await adminClient
    .from('game_discovery_queue')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !item) {
    throw new Error('Discovery item not found')
  }

  const data = item.discovered_data as {
    name: string
    slug: string
    cover_url: string | null
    logo_url: string | null
    brand_color: string | null
    platforms: string[]
    release_date: string | null
    genre: string | null
    is_live_service: boolean
  }

  // Create the game
  const { data: newGame, error: gameError } = await adminClient
    .from('games')
    .insert({
      name: data.name,
      slug: data.slug,
      cover_url: data.cover_url,
      logo_url: data.logo_url,
      brand_color: data.brand_color,
      platforms: data.platforms,
      release_date: data.release_date,
      genre: data.genre,
      is_live_service: data.is_live_service || false,
      support_tier: 'partial',
      mvp_eligible: false,
    })
    .select('id')
    .single()

  if (gameError) {
    // Check if it's a duplicate slug error
    if (gameError.code === '23505') {
      // Game already exists, just mark as approved
      await adminClient
        .from('game_discovery_queue')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
    } else {
      throw new Error('Failed to create game')
    }
  } else {
    // Update discovery queue
    await adminClient
      .from('game_discovery_queue')
      .update({
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        created_game_id: newGame.id,
      })
      .eq('id', id)
  }

  revalidatePath('/admin/games/discovery')
  revalidatePath('/search')
}

export async function rejectDiscovery(id: string, reason?: string) {
  const supabase = await createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/home')

  const adminClient = createAdminClient()

  await adminClient
    .from('game_discovery_queue')
    .update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason || null,
    })
    .eq('id', id)

  revalidatePath('/admin/games/discovery')
}
