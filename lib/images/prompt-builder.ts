import {
  GameVisualProfile,
  ImageVariant,
  STYLE_CONFIGS,
  MOOD_MODIFIERS,
  ASPECT_RATIOS,
} from './types'

type PromptContext = {
  patchTitle: string
  patchTheme?: string
  gameName: string
  tags?: string[]
}

type GeneratedPrompt = {
  prompt: string
  negativePrompt: string
  aspectRatio: { width: number; height: number }
  seed: number
}

// Deterministic seed generation
export function generateSeed(patchId: string, variantIndex: number): number {
  let hash = 0
  const str = `${patchId}-${variantIndex}`
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Get today's rotation index
export function getTodayRotationIndex(patchId: string, totalImages: number): number {
  if (totalImages === 0) return 0

  const today = new Date()
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  )

  // Hash patch ID for consistent rotation per patch
  let patchHash = 0
  for (let i = 0; i < patchId.length; i++) {
    patchHash = ((patchHash << 5) - patchHash) + patchId.charCodeAt(i)
    patchHash = patchHash & patchHash
  }

  return Math.abs((dayOfYear + patchHash) % totalImages)
}

// Build the full prompt from profile and context
export function buildPrompt(
  profile: GameVisualProfile,
  context: PromptContext,
  variant: ImageVariant,
  variantIndex: number = 0
): GeneratedPrompt {
  const styleConfig = STYLE_CONFIGS[profile.style_preset]
  const moodModifier = MOOD_MODIFIERS[profile.mood]

  // Determine composition based on variant
  const composition = variant === 'hero' ? 'hero_wide' :
                      variant === 'card' ? 'card_mid' :
                      variant === 'thumbnail' ? 'square_thumb' :
                      profile.composition_template

  const aspectRatio = ASPECT_RATIOS[composition]

  // Build prompt parts
  const parts: string[] = []

  // 1. Base style
  if (profile.base_prompt_override) {
    parts.push(profile.base_prompt_override)
  } else {
    parts.push(styleConfig.basePrompt)
  }

  // 2. Lighting
  parts.push(styleConfig.lighting)

  // 3. Mood
  parts.push(moodModifier)

  // 4. Fixed prompt tokens (brand consistency)
  parts.push(...profile.prompt_tokens)

  // 5. Game identity cues (without copying copyrighted art)
  if (profile.identity_cues.length > 0) {
    parts.push(...profile.identity_cues)
  }

  // 6. Variable theme from patch
  if (context.patchTheme) {
    parts.push(`theme: ${context.patchTheme}`)
  }

  // 7. Composition
  const aspectRatioStr = `${aspectRatio.width}:${aspectRatio.height}`
  parts.push(`${aspectRatioStr} aspect ratio`)
  parts.push(composition === 'hero_wide' ? 'wide cinematic crop' : 'balanced composition')

  // 8. Quality boosters
  parts.push('8k resolution, highly detailed, professional quality')

  // Build final prompt
  const prompt = parts.join(', ')

  // Build negative prompt
  const negativePrompt = [
    styleConfig.negativePrompt,
    'blurry, low quality, jpeg artifacts',
    'text, logo, watermark, signature',
    'copyright, trademark symbols',
    'deformed, ugly, mutated',
  ].join(', ')

  return {
    prompt,
    negativePrompt,
    aspectRatio,
    seed: generateSeed(context.patchTitle + profile.game_id, variantIndex),
  }
}

// Extract theme from patch content
export function extractPatchTheme(
  title: string,
  summary: string | null,
  tags: string[]
): string {
  // Combine all text
  const text = `${title} ${summary || ''} ${tags.join(' ')}`.toLowerCase()

  // Extract key themes
  const themes: string[] = []

  // Map change - extract map-related words
  if (text.includes('map') || text.includes('zone') || text.includes('arena')) {
    const mapWords = text.match(/\b(underground|cave|urban|forest|desert|snow|water|sky|city|industrial)\b/gi)
    if (mapWords) themes.push(...mapWords)
  }

  // Weapon changes
  if (text.includes('weapon') || text.includes('gun')) {
    const weaponWords = text.match(/\b(assault|sniper|shotgun|smg|pistol|rifle|heavy|explosive)\b/gi)
    if (weaponWords) themes.push(...weaponWords)
  }

  // Movement/mobility
  if (text.includes('mobility') || text.includes('movement')) {
    themes.push('dynamic movement', 'speed')
  }

  // Season/chapter themes
  const seasonMatch = text.match(/(season|chapter)\s*\d+|season\s+\w+/i)
  if (seasonMatch) themes.push(seasonMatch[0])

  // If no specific themes, use title keywords
  if (themes.length === 0) {
    const keywords = title.split(/\s+/).filter(word =>
      word.length > 3 &&
      !['update', 'patch', 'notes', 'version', 'the', 'and', 'for'].includes(word.toLowerCase())
    )
    themes.push(...keywords.slice(0, 3))
  }

  return themes.slice(0, 5).join(', ')
}

// Default visual profile for games without custom settings
export function getDefaultVisualProfile(gameId: string): GameVisualProfile {
  return {
    id: 'default',
    game_id: gameId,
    style_preset: 'dark_realism',
    color_palette: ['#1a1a2e', '#16213e', '#0f3460', '#e94560'],
    composition_template: 'hero_wide',
    mood: 'competitive',
    prompt_tokens: [
      'dark premium UI background',
      'consistent lighting',
      'crisp edges',
      'no clutter',
      'no text',
      'subtle vignette',
      'cinematic atmosphere',
    ],
    identity_cues: [],
    base_prompt_override: null,
  }
}

// Pre-defined profiles for popular games (can be moved to DB)
export const GAME_VISUAL_PROFILES: Record<string, Partial<GameVisualProfile>> = {
  fortnite: {
    style_preset: 'vibrant_action',
    color_palette: ['#9d4edd', '#7b2cbf', '#3c096c', '#ffd700'],
    mood: 'fun',
    identity_cues: ['colorful battle royale aesthetic', 'building mechanics implied', 'storm approaching'],
  },
  valorant: {
    style_preset: 'noir_cyber',
    color_palette: ['#ff4655', '#0f1923', '#ece8e1', '#383e3a'],
    mood: 'competitive',
    identity_cues: ['tactical shooter aesthetic', 'agent abilities implied', 'spike plant zones'],
  },
  apex_legends: {
    style_preset: 'dark_realism',
    color_palette: ['#c41e3a', '#1a1a2e', '#ff6b35', '#4ecdc4'],
    mood: 'action',
    identity_cues: ['sci-fi battle royale', 'legend abilities', 'respawn beacons'],
  },
  call_of_duty: {
    style_preset: 'tactical_mil',
    color_palette: ['#1a1a1a', '#2d2d2d', '#4a4a4a', '#ffa500'],
    mood: 'tense',
    identity_cues: ['modern warfare aesthetic', 'military tactical', 'urban combat zones'],
  },
  league_of_legends: {
    style_preset: 'fantasy_epic',
    color_palette: ['#0a1428', '#c89b3c', '#0bc4e2', '#f0e6d2'],
    mood: 'dramatic',
    identity_cues: ['MOBA lane aesthetic', 'champion silhouettes', 'magical effects'],
  },
  overwatch: {
    style_preset: 'vibrant_action',
    color_palette: ['#f99e1a', '#43484c', '#ffffff', '#fa9c1e'],
    mood: 'fun',
    identity_cues: ['hero shooter aesthetic', 'colorful abilities', 'team-based action'],
  },
}
