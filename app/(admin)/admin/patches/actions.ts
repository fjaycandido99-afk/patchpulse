'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { queueAIJob } from '@/lib/ai/jobs'

type KeyChange = { category: string; change: string }

export type CreatePatchInput = {
  gameId: string
  title: string
  summaryTldr: string
  impactScore: number
  tags: string[]
  keyChanges: KeyChange[]
  sourceUrl?: string
}

export type UpdatePatchInput = {
  id: string
  gameId: string
  title: string
  summaryTldr: string
  impactScore: number
  tags: string[]
  keyChanges: KeyChange[]
  sourceUrl?: string
}

export type PatchWithGame = {
  id: string
  game_id: string
  title: string
  published_at: string
  source_url: string | null
  summary_tldr: string | null
  key_changes: KeyChange[]
  tags: string[]
  impact_score: number
  created_at: string
  game: { id: string; name: string } | null
}

export async function createPatchNote(input: CreatePatchInput) {
  if (!input.gameId) {
    return { error: 'Game is required' }
  }
  if (!input.title?.trim()) {
    return { error: 'Title is required' }
  }
  if (!input.summaryTldr?.trim()) {
    return { error: 'Summary is required' }
  }
  if (input.impactScore < 1 || input.impactScore > 10) {
    return { error: 'Impact score must be between 1 and 10' }
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('patch_notes')
    .insert({
      game_id: input.gameId,
      title: input.title.trim(),
      summary_tldr: input.summaryTldr.trim(),
      impact_score: input.impactScore,
      tags: input.tags,
      key_changes: input.keyChanges,
      source_url: input.sourceUrl?.trim() || null,
      published_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/patches')
  revalidatePath('/patches')
  revalidatePath('/home')
  return { data }
}

export async function updatePatchNote(input: UpdatePatchInput) {
  if (!input.gameId) {
    return { error: 'Game is required' }
  }
  if (!input.title?.trim()) {
    return { error: 'Title is required' }
  }
  if (!input.summaryTldr?.trim()) {
    return { error: 'Summary is required' }
  }
  if (input.impactScore < 1 || input.impactScore > 10) {
    return { error: 'Impact score must be between 1 and 10' }
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('patch_notes')
    .update({
      game_id: input.gameId,
      title: input.title.trim(),
      summary_tldr: input.summaryTldr.trim(),
      impact_score: input.impactScore,
      tags: input.tags,
      key_changes: input.keyChanges,
      source_url: input.sourceUrl?.trim() || null,
    })
    .eq('id', input.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/patches')
  revalidatePath('/patches')
  revalidatePath('/home')
  return { data }
}

export async function deletePatchNote(id: string) {
  if (!id) {
    return { error: 'Invalid patch ID' }
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('patch_notes')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/patches')
  revalidatePath('/patches')
  revalidatePath('/home')
  return { success: true }
}

// Create patch with raw text and queue AI processing
export type CreatePatchWithAIInput = {
  gameId: string
  title: string
  rawText: string
  sourceUrl?: string
}

export async function createPatchNoteWithAI(input: CreatePatchWithAIInput) {
  if (!input.gameId) {
    return { error: 'Game is required' }
  }
  if (!input.title?.trim()) {
    return { error: 'Title is required' }
  }
  if (!input.rawText?.trim()) {
    return { error: 'Raw patch notes text is required' }
  }

  const supabase = createAdminClient()

  // Insert patch with raw_text, AI will fill in summary/key_changes/etc
  const { data, error } = await supabase
    .from('patch_notes')
    .insert({
      game_id: input.gameId,
      title: input.title.trim(),
      raw_text: input.rawText.trim(),
      source_url: input.sourceUrl?.trim() || null,
      published_at: new Date().toISOString(),
      // Placeholder values - AI will update these
      summary_tldr: 'Processing...',
      impact_score: 5,
      tags: [],
      key_changes: [],
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Queue AI job to process the patch
  const jobResult = await queueAIJob('PATCH_SUMMARY', data.id)
  if ('error' in jobResult) {
    console.error('Failed to queue AI job:', jobResult.error)
    // Don't fail the patch creation, just log the error
  }

  revalidatePath('/admin/patches')
  revalidatePath('/patches')
  revalidatePath('/home')
  return { data, aiJobQueued: !('error' in jobResult) }
}

export async function getPatchNotes(limit = 50): Promise<PatchWithGame[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('patch_notes')
    .select(`
      id,
      game_id,
      title,
      published_at,
      source_url,
      summary_tldr,
      key_changes,
      tags,
      impact_score,
      created_at,
      game:games(id, name)
    `)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Get patch notes error:', error)
    return []
  }

  return (data || []).map(item => ({
    ...item,
    key_changes: (item.key_changes as KeyChange[]) || [],
    game: Array.isArray(item.game) ? item.game[0] || null : item.game
  })) as PatchWithGame[]
}
