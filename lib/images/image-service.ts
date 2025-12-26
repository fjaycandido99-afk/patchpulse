import { createClient } from '@/lib/supabase/server'
import { getTodayRotationIndex } from './prompt-builder'
import type { ImageVariant, PatchImage, Platform } from './types'

export type RotatedImage = {
  url: string
  blurHash: string | null
}

// Get the rotated image for today
export async function getRotatedPatchImage(
  patchId: string,
  variant: ImageVariant = 'hero'
): Promise<RotatedImage | null> {
  try {
    const supabase = await createClient()

    // Get all active images for this patch/variant
    const { data: images, error } = await supabase
      .from('patch_images')
      .select('image_url, blur_hash, rotation_index')
      .eq('patch_id', patchId)
      .eq('variant', variant)
      .eq('is_active', true)
      .order('rotation_index')

    if (error || !images || images.length === 0) {
      return null
    }

    // Get today's rotation index
    const rotationIndex = getTodayRotationIndex(patchId, images.length)
    const selectedImage = images[rotationIndex]

    return {
      url: selectedImage.image_url,
      blurHash: selectedImage.blur_hash,
    }
  } catch {
    return null
  }
}

// Get the rotated image for news
export async function getRotatedNewsImage(
  newsId: string,
  variant: ImageVariant = 'hero'
): Promise<RotatedImage | null> {
  try {
    const supabase = await createClient()

    const { data: images, error } = await supabase
      .from('news_images')
      .select('image_url, blur_hash, rotation_index')
      .eq('news_id', newsId)
      .eq('variant', variant)
      .eq('is_active', true)
      .order('rotation_index')

    if (error || !images || images.length === 0) {
      return null
    }

    const rotationIndex = getTodayRotationIndex(newsId, images.length)
    const selectedImage = images[rotationIndex]

    return {
      url: selectedImage.image_url,
      blurHash: selectedImage.blur_hash,
    }
  } catch {
    return null
  }
}

// Get platforms for a game
export async function getGamePlatforms(gameId: string): Promise<Platform[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('game_platforms')
      .select(`
        platform_id,
        platforms (
          id,
          name,
          icon_url,
          color,
          sort_order
        )
      `)
      .eq('game_id', gameId)
      .order('platforms(sort_order)')

    if (error || !data) {
      return []
    }

    return data
      .map((gp: any) => gp.platforms)
      .filter((p: Platform | null): p is Platform => p !== null)
  } catch {
    return []
  }
}

// Get game branding info
export async function getGameBranding(gameId: string): Promise<{
  logoUrl: string | null
  brandColor: string | null
  secondaryColor: string | null
} | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('games')
      .select('logo_url, brand_color, secondary_color')
      .eq('id', gameId)
      .single()

    if (error || !data) {
      return null
    }

    return {
      logoUrl: data.logo_url,
      brandColor: data.brand_color,
      secondaryColor: data.secondary_color,
    }
  } catch {
    return null
  }
}

// Get visual profile for a game
export async function getGameVisualProfile(gameId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('game_visual_profiles')
      .select('*')
      .eq('game_id', gameId)
      .single()

    if (error || !data) {
      return null
    }

    return data
  } catch {
    return null
  }
}

// Batch fetch all images for patches (for home feed)
export async function batchGetPatchImages(
  patchIds: string[],
  variant: ImageVariant = 'card'
): Promise<Map<string, RotatedImage>> {
  const results = new Map<string, RotatedImage>()

  if (patchIds.length === 0) return results

  try {
    const supabase = await createClient()

    const { data: images, error } = await supabase
      .from('patch_images')
      .select('patch_id, image_url, blur_hash, rotation_index')
      .in('patch_id', patchIds)
      .eq('variant', variant)
      .eq('is_active', true)
      .order('rotation_index')

    if (error || !images) {
      return results
    }

    // Group by patch_id
    const imagesByPatch = new Map<string, typeof images>()
    for (const img of images) {
      if (!imagesByPatch.has(img.patch_id)) {
        imagesByPatch.set(img.patch_id, [])
      }
      imagesByPatch.get(img.patch_id)!.push(img)
    }

    // Select rotated image for each patch
    for (const [patchId, patchImages] of imagesByPatch) {
      const rotationIndex = getTodayRotationIndex(patchId, patchImages.length)
      const selected = patchImages[rotationIndex]
      results.set(patchId, {
        url: selected.image_url,
        blurHash: selected.blur_hash,
      })
    }
  } catch {
    // Return empty results on error
  }

  return results
}

// Batch fetch platforms for multiple games
export async function batchGetGamePlatforms(
  gameIds: string[]
): Promise<Map<string, Platform[]>> {
  const results = new Map<string, Platform[]>()

  if (gameIds.length === 0) return results

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('game_platforms')
      .select(`
        game_id,
        platforms (
          id,
          name,
          icon_url,
          color,
          sort_order
        )
      `)
      .in('game_id', gameIds)

    if (error || !data) {
      return results
    }

    // Group by game_id
    for (const item of data as any[]) {
      const gameId = item.game_id as string
      if (!results.has(gameId)) {
        results.set(gameId, [])
      }
      if (item.platforms) {
        const platform = item.platforms as Platform
        results.get(gameId)!.push(platform)
      }
    }

    // Sort platforms by sort_order
    for (const [, platforms] of results) {
      platforms.sort((a, b) => a.sort_order - b.sort_order)
    }
  } catch {
    // Return empty results on error
  }

  return results
}
