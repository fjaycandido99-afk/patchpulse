// Visual system types

export type StylePreset =
  | 'noir_cyber'
  | 'clean_gradient'
  | 'comic_ink'
  | 'dark_realism'
  | 'vibrant_action'
  | 'tactical_mil'
  | 'fantasy_epic'
  | 'retro_pixel'
  | 'minimal_modern'

export type CompositionTemplate = 'hero_wide' | 'card_mid' | 'square_thumb' | 'vertical_story'

export type MoodType = 'tense' | 'competitive' | 'fun' | 'dramatic' | 'mysterious' | 'action' | 'calm'

export type ImageVariant = 'hero' | 'card' | 'og' | 'thumbnail'

export type GameVisualProfile = {
  id: string
  game_id: string
  style_preset: StylePreset
  color_palette: string[]
  composition_template: CompositionTemplate
  mood: MoodType
  prompt_tokens: string[]
  identity_cues: string[]
  base_prompt_override?: string | null
}

export type Platform = {
  id: string
  name: string
  icon_url: string | null
  color: string | null
  sort_order: number
}

export type PatchImage = {
  id: string
  patch_id: string
  variant: ImageVariant
  image_url: string
  blur_hash: string | null
  seed: number
  rotation_index: number
  is_active: boolean
}

// Aspect ratios for different compositions
export const ASPECT_RATIOS: Record<CompositionTemplate, { width: number; height: number }> = {
  hero_wide: { width: 21, height: 9 },
  card_mid: { width: 16, height: 9 },
  square_thumb: { width: 1, height: 1 },
  vertical_story: { width: 9, height: 16 },
}

// Style preset configurations
export const STYLE_CONFIGS: Record<StylePreset, {
  basePrompt: string
  negativePrompt: string
  lighting: string
}> = {
  noir_cyber: {
    basePrompt: 'cyberpunk noir aesthetic, neon accents, dark atmosphere, high contrast',
    negativePrompt: 'bright colors, cartoon, anime, text, watermark',
    lighting: 'dramatic rim lighting, neon glow, moody shadows',
  },
  clean_gradient: {
    basePrompt: 'clean minimal design, smooth gradients, professional, modern',
    negativePrompt: 'busy, cluttered, text, watermark, realistic photo',
    lighting: 'soft even lighting, subtle shadows',
  },
  comic_ink: {
    basePrompt: 'comic book style, bold ink lines, dynamic composition',
    negativePrompt: 'photorealistic, blurry, text, watermark',
    lighting: 'dramatic cel-shaded lighting',
  },
  dark_realism: {
    basePrompt: 'photorealistic, dark cinematic, premium game art',
    negativePrompt: 'cartoon, anime, bright, text, watermark, low quality',
    lighting: 'cinematic lighting, volumetric, dramatic shadows',
  },
  vibrant_action: {
    basePrompt: 'vibrant colors, action-packed, dynamic motion, energetic',
    negativePrompt: 'dull, muted, static, text, watermark',
    lighting: 'bright dynamic lighting, motion blur accents',
  },
  tactical_mil: {
    basePrompt: 'military tactical, realistic gear, tactical aesthetic',
    negativePrompt: 'cartoon, bright colors, fantasy, text, watermark',
    lighting: 'natural overcast lighting, dust particles',
  },
  fantasy_epic: {
    basePrompt: 'epic fantasy, magical atmosphere, grand scale',
    negativePrompt: 'modern, sci-fi, realistic, text, watermark',
    lighting: 'golden hour, magical glow, atmospheric',
  },
  retro_pixel: {
    basePrompt: 'retro pixel art inspired, 80s aesthetic, nostalgic',
    negativePrompt: 'photorealistic, modern, text, watermark',
    lighting: 'flat retro lighting, CRT glow',
  },
  minimal_modern: {
    basePrompt: 'minimal modern design, clean lines, sophisticated',
    negativePrompt: 'busy, detailed, realistic, text, watermark',
    lighting: 'soft studio lighting, clean shadows',
  },
}

// Mood modifiers
export const MOOD_MODIFIERS: Record<MoodType, string> = {
  tense: 'tension, suspense, high stakes atmosphere',
  competitive: 'competitive energy, focus, intensity',
  fun: 'playful, exciting, enjoyable vibe',
  dramatic: 'dramatic, cinematic, impactful',
  mysterious: 'mysterious, intriguing, atmospheric',
  action: 'action-packed, dynamic, explosive',
  calm: 'calm, serene, peaceful',
}
