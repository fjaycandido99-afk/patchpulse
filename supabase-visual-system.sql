-- =====================================================
-- PatchPulse Visual System Schema
-- AI-generated images, game branding, platform icons
-- =====================================================

-- 1. Platforms table (PC, PS5, Xbox, Switch, Mobile)
-- =====================================================
CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon_url TEXT, -- SVG or PNG icon
  color TEXT, -- Brand color hex
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert standard platforms
INSERT INTO platforms (id, name, icon_url, color, sort_order) VALUES
  ('pc', 'PC', '/icons/platforms/pc.svg', '#1a1a2e', 1),
  ('ps5', 'PlayStation 5', '/icons/platforms/playstation.svg', '#003087', 2),
  ('ps4', 'PlayStation 4', '/icons/platforms/playstation.svg', '#003087', 3),
  ('xbox_series', 'Xbox Series X|S', '/icons/platforms/xbox.svg', '#107C10', 4),
  ('xbox_one', 'Xbox One', '/icons/platforms/xbox.svg', '#107C10', 5),
  ('switch', 'Nintendo Switch', '/icons/platforms/switch.svg', '#E60012', 6),
  ('mobile', 'Mobile', '/icons/platforms/mobile.svg', '#6366f1', 7),
  ('steam', 'Steam', '/icons/platforms/steam.svg', '#1b2838', 8),
  ('epic', 'Epic Games', '/icons/platforms/epic.svg', '#2f2f2f', 9)
ON CONFLICT (id) DO NOTHING;

-- 2. Update games table with branding fields
-- =====================================================
ALTER TABLE games ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS brand_color TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS secondary_color TEXT;

-- 3. Game platforms junction table
-- =====================================================
CREATE TABLE IF NOT EXISTS game_platforms (
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  platform_id TEXT REFERENCES platforms(id) ON DELETE CASCADE,
  PRIMARY KEY (game_id, platform_id)
);

-- 4. Game Visual Profiles (AI image generation settings)
-- =====================================================
CREATE TYPE style_preset AS ENUM (
  'noir_cyber',      -- Dark cyberpunk aesthetic
  'clean_gradient',  -- Minimal gradients
  'comic_ink',       -- Comic book style
  'dark_realism',    -- Photorealistic dark
  'vibrant_action',  -- Bright action shots
  'tactical_mil',    -- Military tactical
  'fantasy_epic',    -- Fantasy RPG style
  'retro_pixel',     -- Retro/indie aesthetic
  'minimal_modern'   -- Clean minimal
);

CREATE TYPE composition_template AS ENUM (
  'hero_wide',       -- 21:9 or 16:9 cinematic
  'card_mid',        -- Standard 16:9 card
  'square_thumb',    -- 1:1 thumbnail
  'vertical_story'   -- 9:16 mobile story
);

CREATE TYPE mood_type AS ENUM (
  'tense',
  'competitive',
  'fun',
  'dramatic',
  'mysterious',
  'action',
  'calm'
);

CREATE TABLE IF NOT EXISTS game_visual_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE UNIQUE,

  -- Style settings
  style_preset style_preset NOT NULL DEFAULT 'dark_realism',
  color_palette TEXT[] NOT NULL DEFAULT ARRAY['#1a1a2e', '#16213e', '#0f3460', '#e94560'],
  composition_template composition_template NOT NULL DEFAULT 'hero_wide',
  mood mood_type NOT NULL DEFAULT 'competitive',

  -- Fixed prompt tokens (always included)
  prompt_tokens TEXT[] NOT NULL DEFAULT ARRAY[
    'dark premium UI background',
    'consistent lighting',
    'crisp edges',
    'no clutter',
    'no text',
    'subtle vignette'
  ],

  -- Game identity cues (without copying copyrighted art)
  identity_cues TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Override base prompt if needed
  base_prompt_override TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Patch Images (AI-generated, rotatable)
-- =====================================================
CREATE TYPE image_variant AS ENUM (
  'hero',           -- Main hero image
  'card',           -- Card thumbnail
  'og',             -- Open Graph / social share
  'thumbnail'       -- Small thumbnail
);

CREATE TABLE IF NOT EXISTS patch_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patch_id UUID REFERENCES patch_notes(id) ON DELETE CASCADE,

  -- Image details
  variant image_variant NOT NULL DEFAULT 'hero',
  image_url TEXT NOT NULL,
  blur_hash TEXT, -- For placeholder loading

  -- Generation metadata
  seed INTEGER NOT NULL, -- For deterministic rotation
  prompt_used TEXT,
  generation_model TEXT DEFAULT 'stable-diffusion-xl',

  -- Rotation control
  rotation_index INTEGER DEFAULT 0, -- 0-9 for rotation order
  is_active BOOLEAN DEFAULT true,

  -- Quality control
  quality_score REAL, -- 0-1 AI quality assessment
  is_approved BOOLEAN DEFAULT false, -- Manual approval flag

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast rotation queries
CREATE INDEX IF NOT EXISTS idx_patch_images_rotation
ON patch_images(patch_id, variant, rotation_index)
WHERE is_active = true;

-- 6. News Images (same structure)
-- =====================================================
CREATE TABLE IF NOT EXISTS news_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID REFERENCES news_items(id) ON DELETE CASCADE,

  variant image_variant NOT NULL DEFAULT 'hero',
  image_url TEXT NOT NULL,
  blur_hash TEXT,

  seed INTEGER NOT NULL,
  prompt_used TEXT,
  generation_model TEXT DEFAULT 'stable-diffusion-xl',

  rotation_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  quality_score REAL,
  is_approved BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_images_rotation
ON news_images(news_id, variant, rotation_index)
WHERE is_active = true;

-- 7. Image Generation Queue (for batch processing)
-- =====================================================
CREATE TYPE generation_status AS ENUM (
  'pending',
  'generating',
  'completed',
  'failed'
);

CREATE TABLE IF NOT EXISTS image_generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What to generate for
  target_type TEXT NOT NULL CHECK (target_type IN ('patch', 'news', 'game')),
  target_id UUID NOT NULL,

  -- Generation settings
  variant image_variant NOT NULL,
  prompt TEXT NOT NULL,
  seed INTEGER NOT NULL,

  -- Status tracking
  status generation_status DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  error_message TEXT,

  -- Result
  result_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_generation_queue_pending
ON image_generation_queue(status, created_at)
WHERE status = 'pending';

-- 8. Helper function: Get rotated image for today
-- =====================================================
CREATE OR REPLACE FUNCTION get_rotated_image(
  p_patch_id UUID,
  p_variant image_variant DEFAULT 'hero'
) RETURNS TEXT AS $$
DECLARE
  v_image_url TEXT;
  v_today_seed INTEGER;
  v_image_count INTEGER;
BEGIN
  -- Get count of active images for this patch/variant
  SELECT COUNT(*) INTO v_image_count
  FROM patch_images
  WHERE patch_id = p_patch_id
    AND variant = p_variant
    AND is_active = true;

  IF v_image_count = 0 THEN
    RETURN NULL;
  END IF;

  -- Deterministic rotation based on date + patch_id
  v_today_seed := (
    EXTRACT(DOY FROM CURRENT_DATE)::INTEGER +
    ('x' || SUBSTRING(p_patch_id::TEXT, 1, 8))::BIT(32)::INTEGER
  ) % v_image_count;

  -- Get the image for today's rotation
  SELECT image_url INTO v_image_url
  FROM patch_images
  WHERE patch_id = p_patch_id
    AND variant = p_variant
    AND is_active = true
  ORDER BY rotation_index
  OFFSET v_today_seed
  LIMIT 1;

  RETURN v_image_url;
END;
$$ LANGUAGE plpgsql;

-- 9. RLS Policies
-- =====================================================
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_visual_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patch_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_generation_queue ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view platforms" ON platforms FOR SELECT USING (true);
CREATE POLICY "Anyone can view game_platforms" ON game_platforms FOR SELECT USING (true);
CREATE POLICY "Anyone can view game_visual_profiles" ON game_visual_profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can view patch_images" ON patch_images FOR SELECT USING (true);
CREATE POLICY "Anyone can view news_images" ON news_images FOR SELECT USING (true);

-- Admin write access (using service role)
CREATE POLICY "Service role manages platforms" ON platforms FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role manages game_platforms" ON game_platforms FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role manages visual_profiles" ON game_visual_profiles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role manages patch_images" ON patch_images FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role manages news_images" ON news_images FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role manages generation_queue" ON image_generation_queue FOR ALL USING (auth.role() = 'service_role');
