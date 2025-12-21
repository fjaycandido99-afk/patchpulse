'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export type CreateGameInput = {
  name: string
  slug: string
  coverUrl?: string
  releaseDate?: string
  platforms?: string
}

export async function createGame(input: CreateGameInput) {
  const slug = input.slug.toLowerCase().trim()

  if (!slug) {
    return { error: 'Slug is required' }
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: 'Slug must contain only lowercase letters, numbers, and hyphens' }
  }

  const supabase = createAdminClient()

  const platforms = input.platforms
    ? input.platforms.split(',').map((p) => p.trim()).filter(Boolean)
    : []

  const { data, error } = await supabase
    .from('games')
    .insert({
      name: input.name.trim(),
      slug,
      cover_url: input.coverUrl?.trim() || null,
      release_date: input.releaseDate || null,
      platforms,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return { error: 'A game with this slug already exists' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/games')
  revalidatePath('/home')
  return { data }
}

export type UpdateGameInput = {
  id: string
  name: string
  slug: string
  coverUrl?: string
  releaseDate?: string
  platforms?: string
}

export async function updateGame(input: UpdateGameInput) {
  const slug = input.slug.toLowerCase().trim()

  if (!slug) {
    return { error: 'Slug is required' }
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: 'Slug must contain only lowercase letters, numbers, and hyphens' }
  }

  const supabase = createAdminClient()

  const platforms = input.platforms
    ? input.platforms.split(',').map((p) => p.trim()).filter(Boolean)
    : []

  const { data, error } = await supabase
    .from('games')
    .update({
      name: input.name.trim(),
      slug,
      cover_url: input.coverUrl?.trim() || null,
      release_date: input.releaseDate || null,
      platforms,
    })
    .eq('id', input.id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return { error: 'A game with this slug already exists' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/games')
  revalidatePath('/home')
  return { data }
}

export async function deleteGame(gameId: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', gameId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/games')
  revalidatePath('/home')
  return { success: true }
}

export async function getGames() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('games')
    .select('id, name, slug, cover_url, platforms, release_date, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return []
  }

  return data || []
}

export async function getGamesForSelect() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('games')
    .select('id, name')
    .order('name')

  if (error) {
    return []
  }

  return data || []
}
