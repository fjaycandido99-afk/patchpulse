-- ============================================================================
-- MVP GAME CURATION SYSTEM
-- Safe to run multiple times - all statements are idempotent
-- ============================================================================
--
-- Strategy: 500-650 curated games at launch
-- Criteria:
--   - ≥10k peak concurrent players (Steam) OR
--   - Live-service / esports staple OR
--   - Major AAA title (curated exception)
-- ============================================================================

-- ============================================================================
-- STEP 1: Add MVP columns to games table
-- Using DO block to safely add columns only if they don't exist
-- ============================================================================

DO $$
BEGIN
  -- mvp_eligible: Is this game part of our curated MVP list?
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'games'
    AND column_name = 'mvp_eligible'
  ) THEN
    ALTER TABLE public.games ADD COLUMN mvp_eligible boolean DEFAULT false;
  END IF;

  -- support_tier: Level of support for this game
  -- 'full' = Active updates, AI summaries, notifications
  -- 'partial' = Listed but limited features
  -- 'requested' = User-requested, pending review
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'games'
    AND column_name = 'support_tier'
  ) THEN
    ALTER TABLE public.games ADD COLUMN support_tier text DEFAULT 'full'
      CHECK (support_tier IN ('full', 'partial', 'requested'));
  END IF;

  -- curated_exception: Manually added despite not meeting automated criteria
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'games'
    AND column_name = 'curated_exception'
  ) THEN
    ALTER TABLE public.games ADD COLUMN curated_exception boolean DEFAULT false;
  END IF;

  -- eligibility_checked_at: When we last verified this game's eligibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'games'
    AND column_name = 'eligibility_checked_at'
  ) THEN
    ALTER TABLE public.games ADD COLUMN eligibility_checked_at timestamptz DEFAULT now();
  END IF;

  -- genre: For filtering and recommendations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'games'
    AND column_name = 'genre'
  ) THEN
    ALTER TABLE public.games ADD COLUMN genre text;
  END IF;

  -- is_live_service: Ongoing updates expected
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'games'
    AND column_name = 'is_live_service'
  ) THEN
    ALTER TABLE public.games ADD COLUMN is_live_service boolean DEFAULT false;
  END IF;

  -- logo_url: Game logo for display (separate from cover)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'games'
    AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE public.games ADD COLUMN logo_url text;
  END IF;
END $$;

-- ============================================================================
-- STEP 2: Add indexes for common queries
-- ============================================================================

-- Index for filtering MVP games (most common query)
CREATE INDEX IF NOT EXISTS idx_games_mvp_eligible
  ON public.games(mvp_eligible)
  WHERE mvp_eligible = true;

-- Index for support tier filtering
CREATE INDEX IF NOT EXISTS idx_games_support_tier
  ON public.games(support_tier);

-- Index for live service games
CREATE INDEX IF NOT EXISTS idx_games_live_service
  ON public.games(is_live_service)
  WHERE is_live_service = true;

-- Index for game name search (already likely exists, but ensure it)
CREATE INDEX IF NOT EXISTS idx_games_name_search
  ON public.games USING gin(to_tsvector('english', name));

-- ============================================================================
-- STEP 3: Game Requests table (for post-launch "Request a Game" feature)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.game_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  game_name text NOT NULL,
  game_url text, -- Optional: link to Steam/store page
  reason text, -- Why they want this game
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'added')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Index for admin review queue
CREATE INDEX IF NOT EXISTS idx_game_requests_status
  ON public.game_requests(status, created_at DESC);

-- Index for user's own requests
CREATE INDEX IF NOT EXISTS idx_game_requests_user
  ON public.game_requests(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.game_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
DROP POLICY IF EXISTS "Users can view own requests" ON public.game_requests;
CREATE POLICY "Users can view own requests"
  ON public.game_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create requests
DROP POLICY IF EXISTS "Users can create requests" ON public.game_requests;
CREATE POLICY "Users can create requests"
  ON public.game_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Prevent duplicate requests from same user for same game name
CREATE UNIQUE INDEX IF NOT EXISTS idx_game_requests_unique_per_user
  ON public.game_requests(user_id, lower(game_name))
  WHERE status = 'pending';

-- ============================================================================
-- STEP 4: Update existing seed games to be MVP eligible
-- ============================================================================

UPDATE public.games
SET
  mvp_eligible = true,
  support_tier = 'full',
  is_live_service = true,
  eligibility_checked_at = now()
WHERE slug IN (
  'fortnite',
  'warzone',
  'league-of-legends',
  'valorant',
  'apex-legends',
  'dota-2',
  'cs2',
  'overwatch-2',
  'rocket-league',
  'destiny-2'
);

-- ============================================================================
-- STEP 5: Helper view for MVP games only (optional, for convenience)
-- ============================================================================

CREATE OR REPLACE VIEW public.mvp_games AS
SELECT
  id,
  name,
  slug,
  cover_url,
  logo_url,
  platforms,
  genre,
  release_date,
  is_live_service,
  support_tier,
  curated_exception,
  eligibility_checked_at,
  created_at
FROM public.games
WHERE mvp_eligible = true
ORDER BY name;

-- Grant access to the view
GRANT SELECT ON public.mvp_games TO authenticated;
GRANT SELECT ON public.mvp_games TO anon;

-- ============================================================================
-- STEP 6: Function to check if a game is supported (for UX messaging)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_game_supported(game_id uuid)
RETURNS TABLE (
  supported boolean,
  tier text,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  game_record RECORD;
BEGIN
  SELECT g.mvp_eligible, g.support_tier, g.name
  INTO game_record
  FROM public.games g
  WHERE g.id = game_id;

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
  col_count int;
  mvp_count int;
BEGIN
  -- Check columns exist
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'games'
    AND column_name IN ('mvp_eligible', 'support_tier', 'curated_exception', 'eligibility_checked_at');

  -- Check MVP games
  SELECT COUNT(*) INTO mvp_count
  FROM public.games
  WHERE mvp_eligible = true;

  RAISE NOTICE '✓ MVP columns added: % of 4', col_count;
  RAISE NOTICE '✓ MVP eligible games: %', mvp_count;
  RAISE NOTICE '✓ Migration complete!';
END $$;
