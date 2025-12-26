-- ============================================================================
-- PATCHPULSE: ALL MIGRATIONS COMBINED
-- Run this once in Supabase SQL Editor
-- Generated: 2024
-- ============================================================================

-- ============================================================================
-- PART 1: VISUAL SYSTEM (Platforms, Branding, AI Images)
-- ============================================================================

-- 1. Platforms table (PC, PS5, Xbox, Switch, Mobile)
CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon_url TEXT,
  color TEXT,
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
ALTER TABLE games ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS brand_color TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS secondary_color TEXT;

-- 3. Game platforms junction table
CREATE TABLE IF NOT EXISTS game_platforms (
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  platform_id TEXT REFERENCES platforms(id) ON DELETE CASCADE,
  PRIMARY KEY (game_id, platform_id)
);

-- 4. Game Visual Profiles (AI image generation settings)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'style_preset') THEN
    CREATE TYPE style_preset AS ENUM (
      'noir_cyber', 'clean_gradient', 'comic_ink', 'dark_realism',
      'vibrant_action', 'tactical_mil', 'fantasy_epic', 'retro_pixel', 'minimal_modern'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'composition_template') THEN
    CREATE TYPE composition_template AS ENUM (
      'hero_wide', 'card_mid', 'square_thumb', 'vertical_story'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mood_type') THEN
    CREATE TYPE mood_type AS ENUM (
      'tense', 'competitive', 'fun', 'dramatic', 'mysterious', 'action', 'calm'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'image_variant') THEN
    CREATE TYPE image_variant AS ENUM ('hero', 'card', 'og', 'thumbnail');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'generation_status') THEN
    CREATE TYPE generation_status AS ENUM ('pending', 'generating', 'completed', 'failed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS game_visual_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE UNIQUE,
  style_preset style_preset NOT NULL DEFAULT 'dark_realism',
  color_palette TEXT[] NOT NULL DEFAULT ARRAY['#1a1a2e', '#16213e', '#0f3460', '#e94560'],
  composition_template composition_template NOT NULL DEFAULT 'hero_wide',
  mood mood_type NOT NULL DEFAULT 'competitive',
  prompt_tokens TEXT[] NOT NULL DEFAULT ARRAY[
    'dark premium UI background', 'consistent lighting', 'crisp edges',
    'no clutter', 'no text', 'subtle vignette'
  ],
  identity_cues TEXT[] DEFAULT ARRAY[]::TEXT[],
  base_prompt_override TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Patch Images
CREATE TABLE IF NOT EXISTS patch_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patch_id UUID REFERENCES patch_notes(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_patch_images_rotation
ON patch_images(patch_id, variant, rotation_index)
WHERE is_active = true;

-- 6. News Images
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

-- 7. Image Generation Queue
CREATE TABLE IF NOT EXISTS image_generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('patch', 'news', 'game')),
  target_id UUID NOT NULL,
  variant image_variant NOT NULL,
  prompt TEXT NOT NULL,
  seed INTEGER NOT NULL,
  status generation_status DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  error_message TEXT,
  result_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_generation_queue_pending
ON image_generation_queue(status, created_at)
WHERE status = 'pending';

-- 8. Helper function: Get rotated image for today
CREATE OR REPLACE FUNCTION get_rotated_image(
  p_patch_id UUID,
  p_variant image_variant DEFAULT 'hero'
) RETURNS TEXT AS $$
DECLARE
  v_image_url TEXT;
  v_today_seed INTEGER;
  v_image_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_image_count
  FROM patch_images
  WHERE patch_id = p_patch_id AND variant = p_variant AND is_active = true;

  IF v_image_count = 0 THEN RETURN NULL; END IF;

  v_today_seed := (
    EXTRACT(DOY FROM CURRENT_DATE)::INTEGER +
    ('x' || SUBSTRING(p_patch_id::TEXT, 1, 8))::BIT(32)::INTEGER
  ) % v_image_count;

  SELECT image_url INTO v_image_url
  FROM patch_images
  WHERE patch_id = p_patch_id AND variant = p_variant AND is_active = true
  ORDER BY rotation_index
  OFFSET v_today_seed LIMIT 1;

  RETURN v_image_url;
END;
$$ LANGUAGE plpgsql;

-- 9. RLS Policies for Visual System
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_visual_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patch_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_generation_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view platforms" ON platforms;
CREATE POLICY "Anyone can view platforms" ON platforms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view game_platforms" ON game_platforms;
CREATE POLICY "Anyone can view game_platforms" ON game_platforms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view game_visual_profiles" ON game_visual_profiles;
CREATE POLICY "Anyone can view game_visual_profiles" ON game_visual_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view patch_images" ON patch_images;
CREATE POLICY "Anyone can view patch_images" ON patch_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view news_images" ON news_images;
CREATE POLICY "Anyone can view news_images" ON news_images FOR SELECT USING (true);

-- ============================================================================
-- PART 2: WEBAUTHN / PASSKEY AUTHENTICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter INTEGER DEFAULT 0,
  device_name TEXT,
  transports TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_webauthn_user_id ON public.webauthn_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_credential_id ON public.webauthn_credentials(credential_id);

ALTER TABLE public.webauthn_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own credentials" ON public.webauthn_credentials;
CREATE POLICY "Users can view own credentials"
  ON public.webauthn_credentials FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own credentials" ON public.webauthn_credentials;
CREATE POLICY "Users can insert own credentials"
  ON public.webauthn_credentials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own credentials" ON public.webauthn_credentials;
CREATE POLICY "Users can update own credentials"
  ON public.webauthn_credentials FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own credentials" ON public.webauthn_credentials;
CREATE POLICY "Users can delete own credentials"
  ON public.webauthn_credentials FOR DELETE
  USING (auth.uid() = user_id);

-- Challenge storage table
CREATE TABLE IF NOT EXISTS public.webauthn_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  challenge TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('registration', 'authentication')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '5 minutes')
);

CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_user ON public.webauthn_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_email ON public.webauthn_challenges(email);

CREATE OR REPLACE FUNCTION cleanup_expired_challenges()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.webauthn_challenges WHERE expires_at < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cleanup_challenges ON public.webauthn_challenges;
CREATE TRIGGER trigger_cleanup_challenges
  AFTER INSERT ON public.webauthn_challenges
  EXECUTE FUNCTION cleanup_expired_challenges();

ALTER TABLE public.webauthn_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own registration challenges" ON public.webauthn_challenges;
CREATE POLICY "Users can view own registration challenges"
  ON public.webauthn_challenges FOR SELECT
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid() AND type = 'registration');

DROP POLICY IF EXISTS "Users can insert own registration challenges" ON public.webauthn_challenges;
CREATE POLICY "Users can insert own registration challenges"
  ON public.webauthn_challenges FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid() AND type = 'registration');

DROP POLICY IF EXISTS "Users can delete own challenges" ON public.webauthn_challenges;
CREATE POLICY "Users can delete own challenges"
  ON public.webauthn_challenges FOR DELETE
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- ============================================================================
-- PART 3: MVP GAME CURATION SYSTEM
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'games' AND column_name = 'mvp_eligible'
  ) THEN
    ALTER TABLE public.games ADD COLUMN mvp_eligible boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'games' AND column_name = 'support_tier'
  ) THEN
    ALTER TABLE public.games ADD COLUMN support_tier text DEFAULT 'full'
      CHECK (support_tier IN ('full', 'partial', 'requested'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'games' AND column_name = 'curated_exception'
  ) THEN
    ALTER TABLE public.games ADD COLUMN curated_exception boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'games' AND column_name = 'eligibility_checked_at'
  ) THEN
    ALTER TABLE public.games ADD COLUMN eligibility_checked_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'games' AND column_name = 'genre'
  ) THEN
    ALTER TABLE public.games ADD COLUMN genre text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'games' AND column_name = 'is_live_service'
  ) THEN
    ALTER TABLE public.games ADD COLUMN is_live_service boolean DEFAULT false;
  END IF;
END $$;

-- Indexes for MVP queries
CREATE INDEX IF NOT EXISTS idx_games_mvp_eligible ON public.games(mvp_eligible) WHERE mvp_eligible = true;
CREATE INDEX IF NOT EXISTS idx_games_support_tier ON public.games(support_tier);
CREATE INDEX IF NOT EXISTS idx_games_live_service ON public.games(is_live_service) WHERE is_live_service = true;
CREATE INDEX IF NOT EXISTS idx_games_name_search ON public.games USING gin(to_tsvector('english', name));

-- Game Requests table
CREATE TABLE IF NOT EXISTS public.game_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  game_name text NOT NULL,
  game_url text,
  reason text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'added')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_game_requests_status ON public.game_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_requests_user ON public.game_requests(user_id, created_at DESC);

ALTER TABLE public.game_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own requests" ON public.game_requests;
CREATE POLICY "Users can view own requests"
  ON public.game_requests FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create requests" ON public.game_requests;
CREATE POLICY "Users can create requests"
  ON public.game_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_game_requests_unique_per_user
  ON public.game_requests(user_id, lower(game_name)) WHERE status = 'pending';

-- MVP Games view
CREATE OR REPLACE VIEW public.mvp_games AS
SELECT id, name, slug, cover_url, logo_url, platforms, genre, release_date,
       is_live_service, support_tier, curated_exception, eligibility_checked_at, created_at
FROM public.games WHERE mvp_eligible = true ORDER BY name;

GRANT SELECT ON public.mvp_games TO authenticated;
GRANT SELECT ON public.mvp_games TO anon;

-- Helper function
CREATE OR REPLACE FUNCTION public.is_game_supported(game_id uuid)
RETURNS TABLE (supported boolean, tier text, message text)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE game_record RECORD;
BEGIN
  SELECT g.mvp_eligible, g.support_tier, g.name INTO game_record
  FROM public.games g WHERE g.id = game_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'none'::text, 'Game not found'::text;
    RETURN;
  END IF;

  IF game_record.mvp_eligible AND game_record.support_tier = 'full' THEN
    RETURN QUERY SELECT true, 'full'::text, 'Full support with active updates'::text;
  ELSIF game_record.mvp_eligible THEN
    RETURN QUERY SELECT true, game_record.support_tier, 'Limited support'::text;
  ELSE
    RETURN QUERY SELECT false, 'none'::text, 'Use "Request a Game" to suggest adding this title'::text;
  END IF;
END;
$$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  platform_count int;
  col_count int;
BEGIN
  SELECT COUNT(*) INTO platform_count FROM platforms;
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'games'
    AND column_name IN ('mvp_eligible', 'support_tier', 'genre', 'is_live_service');

  RAISE NOTICE '✓ Platforms added: %', platform_count;
  RAISE NOTICE '✓ Game columns added: % of 4', col_count;
  RAISE NOTICE '✓ WebAuthn tables created';
  RAISE NOTICE '✓ All migrations complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT: Run mvp-games-insert.sql to add 619 games';
END $$;
