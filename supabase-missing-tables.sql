-- ============================================================================
-- PATCHPULSE: MISSING TABLES CONSOLIDATION
-- Run this AFTER supabase-all-migrations.sql
-- This adds all tables that are referenced in code but not in the main migration
-- ============================================================================

-- ============================================================================
-- PART 1: AI JOB QUEUE & CACHE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL CHECK (job_type IN ('PATCH_SUMMARY', 'NEWS_SUMMARY', 'DISCOVER_SEASONAL', 'DISCOVER_RELEASE')),
  entity_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'done', 'failed')),
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  error_message TEXT,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ai_jobs_pending_idx ON public.ai_jobs(status, created_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS ai_jobs_entity_idx ON public.ai_jobs(job_type, entity_id);

ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;

-- Claim next pending job atomically
CREATE OR REPLACE FUNCTION claim_next_ai_job(p_job_type TEXT DEFAULT NULL)
RETURNS SETOF ai_jobs
LANGUAGE plpgsql AS $$
DECLARE v_job ai_jobs;
BEGIN
  UPDATE ai_jobs SET status = 'running', started_at = now(), attempts = attempts + 1
  WHERE id = (
    SELECT id FROM ai_jobs
    WHERE status = 'pending' AND (p_job_type IS NULL OR job_type = p_job_type) AND attempts < max_attempts
    ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED
  ) RETURNING * INTO v_job;
  IF v_job.id IS NOT NULL THEN RETURN NEXT v_job; END IF;
  RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION complete_ai_job(p_job_id UUID, p_result JSONB)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE ai_jobs SET status = 'done', result = p_result, completed_at = now() WHERE id = p_job_id;
END;
$$;

CREATE OR REPLACE FUNCTION fail_ai_job(p_job_id UUID, p_error TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE ai_jobs SET status = CASE WHEN attempts >= max_attempts THEN 'failed' ELSE 'pending' END, error_message = p_error WHERE id = p_job_id;
END;
$$;

-- What's New Cache
CREATE TABLE IF NOT EXISTS public.whats_new_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  since_date TIMESTAMPTZ NOT NULL,
  summary TEXT NOT NULL,
  patch_count INT NOT NULL DEFAULT 0,
  news_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, game_id)
);

ALTER TABLE public.whats_new_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own cache" ON public.whats_new_cache;
CREATE POLICY "Users can view their own cache" ON public.whats_new_cache FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own cache" ON public.whats_new_cache;
CREATE POLICY "Users can manage their own cache" ON public.whats_new_cache FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS whats_new_cache_lookup_idx ON public.whats_new_cache(user_id, game_id);

-- ============================================================================
-- PART 2: GAME DISCOVERY (AI-powered game search)
-- ============================================================================

CREATE TABLE IF NOT EXISTS game_discovery_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query TEXT NOT NULL,
  discovered_data JSONB NOT NULL,
  confidence REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending_review',
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

DROP INDEX IF EXISTS idx_game_discovery_queue_status;
DROP INDEX IF EXISTS idx_game_discovery_queue_created;
CREATE INDEX idx_game_discovery_queue_status ON game_discovery_queue(status);
CREATE INDEX idx_game_discovery_queue_created ON game_discovery_queue(created_at DESC);

CREATE TABLE IF NOT EXISTS game_discovery_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  result_status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

DROP INDEX IF EXISTS idx_discovery_attempts_user_date;
CREATE INDEX idx_discovery_attempts_user_date ON game_discovery_attempts(user_id, created_at DESC);

ALTER TABLE game_discovery_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_discovery_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own discovery requests" ON game_discovery_queue;
CREATE POLICY "Users can view own discovery requests" ON game_discovery_queue FOR SELECT USING (requested_by = auth.uid());

DROP POLICY IF EXISTS "Service role manages game_discovery_queue" ON game_discovery_queue;
CREATE POLICY "Service role manages game_discovery_queue" ON game_discovery_queue FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can view own attempts" ON game_discovery_attempts;
CREATE POLICY "Users can view own attempts" ON game_discovery_attempts FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role manages game_discovery_attempts" ON game_discovery_attempts;
CREATE POLICY "Service role manages game_discovery_attempts" ON game_discovery_attempts FOR ALL USING (true);

-- ============================================================================
-- PART 3: SEASONAL EVENTS (Holiday/promotional artwork)
-- ============================================================================

CREATE TABLE IF NOT EXISTS seasonal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'winter', 'halloween', 'summer', 'spring',
    'anniversary', 'sale', 'collaboration',
    'update', 'launch', 'esports', 'custom'
  )),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  cover_url TEXT,
  logo_url TEXT,
  hero_url TEXT,
  brand_color TEXT,
  source_url TEXT,
  confidence_score REAL DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  is_auto_approved BOOLEAN DEFAULT false,
  is_admin_approved BOOLEAN DEFAULT false,
  discovered_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(game_id, event_name)
);

CREATE INDEX IF NOT EXISTS idx_seasonal_events_game ON seasonal_events(game_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_events_dates ON seasonal_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_seasonal_events_active_lookup ON seasonal_events(game_id, start_date, end_date)
  WHERE (is_auto_approved = true OR is_admin_approved = true);

CREATE TABLE IF NOT EXISTS seasonal_discovery_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  trigger_reason TEXT NOT NULL CHECK (trigger_reason IN (
    'scheduled_scan', 'manual_request', 'event_detected', 'user_report'
  )),
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'searching', 'found', 'not_found', 'failed'
  )),
  search_results JSONB,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  error_message TEXT,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seasonal_queue_pending ON seasonal_discovery_queue(status, created_at) WHERE status = 'pending';

ALTER TABLE seasonal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_discovery_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved seasonal events" ON seasonal_events;
CREATE POLICY "Public can view approved seasonal events" ON seasonal_events FOR SELECT
  USING ((is_auto_approved = true OR is_admin_approved = true));

DROP POLICY IF EXISTS "Service role manages seasonal_events" ON seasonal_events;
CREATE POLICY "Service role manages seasonal_events" ON seasonal_events FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role manages seasonal_discovery_queue" ON seasonal_discovery_queue;
CREATE POLICY "Service role manages seasonal_discovery_queue" ON seasonal_discovery_queue FOR ALL USING (true);

-- Batch function for efficient seasonal lookups
CREATE OR REPLACE FUNCTION batch_get_seasonal_covers(p_game_ids UUID[])
RETURNS TABLE(
  game_id UUID, cover_url TEXT, logo_url TEXT, hero_url TEXT,
  brand_color TEXT, is_seasonal BOOLEAN, event_name TEXT, event_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (g.id)
    g.id as game_id,
    COALESCE(se.cover_url, g.cover_url) as cover_url,
    COALESCE(se.logo_url, g.logo_url) as logo_url,
    se.hero_url as hero_url,
    COALESCE(se.brand_color, g.brand_color) as brand_color,
    (se.id IS NOT NULL) as is_seasonal,
    se.event_name,
    se.event_type
  FROM unnest(p_game_ids) as gid
  JOIN games g ON g.id = gid
  LEFT JOIN seasonal_events se ON se.game_id = g.id
    AND (se.is_auto_approved = true OR se.is_admin_approved = true)
    AND CURRENT_DATE BETWEEN se.start_date AND se.end_date
  ORDER BY g.id, se.confidence_score DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- PART 4: UPCOMING RELEASES (Release radar)
-- ============================================================================

CREATE TABLE IF NOT EXISTS upcoming_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  release_type TEXT NOT NULL DEFAULT 'game',
  release_date DATE,
  release_window TEXT,
  platforms TEXT[],
  description TEXT,
  source_url TEXT,
  confidence_score REAL DEFAULT 0.8,
  is_confirmed BOOLEAN DEFAULT false,
  discovered_at TIMESTAMPTZ DEFAULT now(),
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(game_id, title)
);

CREATE INDEX IF NOT EXISTS idx_upcoming_releases_game ON upcoming_releases(game_id);
CREATE INDEX IF NOT EXISTS idx_upcoming_releases_date ON upcoming_releases(release_date) WHERE release_date IS NOT NULL;

CREATE TABLE IF NOT EXISTS release_discovery_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  last_checked_at TIMESTAMPTZ,
  next_check_at TIMESTAMPTZ DEFAULT now(),
  check_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(game_id)
);

ALTER TABLE upcoming_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_discovery_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view upcoming releases" ON upcoming_releases;
CREATE POLICY "Public can view upcoming releases" ON upcoming_releases FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manages upcoming_releases" ON upcoming_releases;
CREATE POLICY "Service role manages upcoming_releases" ON upcoming_releases FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role manages release_discovery_queue" ON release_discovery_queue;
CREATE POLICY "Service role manages release_discovery_queue" ON release_discovery_queue FOR ALL USING (true);

-- ============================================================================
-- PART 5: RETURN TO GAME SUGGESTIONS
-- ============================================================================

ALTER TABLE backlog_items ADD COLUMN IF NOT EXISTS pause_reason TEXT;

CREATE TABLE IF NOT EXISTS return_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  backlog_item_id UUID NOT NULL REFERENCES backlog_items(id) ON DELETE CASCADE,
  patch_id UUID REFERENCES patch_notes(id) ON DELETE SET NULL,
  pause_reason TEXT,
  match_reason TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0,
  is_dismissed BOOLEAN DEFAULT false,
  is_acted_on BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, game_id, patch_id)
);

CREATE INDEX IF NOT EXISTS idx_return_suggestions_user ON return_suggestions(user_id, is_dismissed, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_return_suggestions_game ON return_suggestions(game_id);
CREATE INDEX IF NOT EXISTS idx_backlog_items_stale ON backlog_items(user_id, status, last_played_at) WHERE status = 'playing';

ALTER TABLE return_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own return suggestions" ON return_suggestions;
CREATE POLICY "Users can view their own return suggestions" ON return_suggestions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own return suggestions" ON return_suggestions;
CREATE POLICY "Users can manage their own return suggestions" ON return_suggestions FOR ALL USING (auth.uid() = user_id);

-- Function to find stale "playing" games
CREATE OR REPLACE FUNCTION get_stale_playing_games(p_user_id UUID, p_days_threshold INT DEFAULT 14)
RETURNS TABLE (
  backlog_item_id UUID, game_id UUID, game_name TEXT, game_cover_url TEXT,
  last_played_at TIMESTAMPTZ, days_since_played INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT bi.id, bi.game_id, g.name, g.cover_url, bi.last_played_at,
    EXTRACT(DAY FROM (now() - bi.last_played_at))::INT
  FROM backlog_items bi
  JOIN games g ON g.id = bi.game_id
  WHERE bi.user_id = p_user_id AND bi.status = 'playing'
    AND bi.last_played_at IS NOT NULL
    AND bi.last_played_at < now() - (p_days_threshold || ' days')::INTERVAL
  ORDER BY bi.last_played_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== TABLES CREATED ===';
  RAISE NOTICE 'ai_jobs - Background AI job queue';
  RAISE NOTICE 'whats_new_cache - Personalized "whats new" summaries';
  RAISE NOTICE 'game_discovery_queue - AI game discovery review queue';
  RAISE NOTICE 'game_discovery_attempts - Rate limiting for game discovery';
  RAISE NOTICE 'seasonal_events - Holiday/promotional artwork';
  RAISE NOTICE 'seasonal_discovery_queue - Seasonal discovery jobs';
  RAISE NOTICE 'upcoming_releases - Release radar data';
  RAISE NOTICE 'release_discovery_queue - Release discovery jobs';
  RAISE NOTICE 'return_suggestions - AI "return to game" suggestions';
  RAISE NOTICE '';
  RAISE NOTICE 'All missing tables have been created!';
END $$;
