-- Upcoming Releases: AI-Discovered Release Dates
-- Run this in Supabase SQL Editor

-- 1. Track upcoming releases discovered by AI
CREATE TABLE IF NOT EXISTS upcoming_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  title TEXT NOT NULL,                    -- "Grand Theft Auto 6", "Elden Ring DLC"
  release_type TEXT NOT NULL DEFAULT 'game', -- 'game', 'dlc', 'expansion', 'update', 'season'
  release_date DATE,                      -- Known release date (null if TBD)
  release_window TEXT,                    -- "Q1 2025", "Holiday 2025", "TBA"
  platforms TEXT[],                       -- ['PS5', 'Xbox Series X', 'PC']
  description TEXT,                       -- Brief description
  source_url TEXT,                        -- Where info was found
  confidence_score REAL DEFAULT 0.8,      -- AI confidence 0-1
  is_confirmed BOOLEAN DEFAULT false,     -- Officially confirmed vs rumored
  discovered_at TIMESTAMPTZ DEFAULT now(),
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(game_id, title)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_upcoming_releases_game ON upcoming_releases(game_id);
CREATE INDEX IF NOT EXISTS idx_upcoming_releases_date ON upcoming_releases(release_date) WHERE release_date IS NOT NULL;

-- 2. Discovery queue for AI to process
CREATE TABLE IF NOT EXISTS release_discovery_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',          -- 'pending', 'processing', 'completed', 'failed'
  last_checked_at TIMESTAMPTZ,
  next_check_at TIMESTAMPTZ DEFAULT now(),
  check_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(game_id)
);

-- 3. RLS policies
ALTER TABLE upcoming_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_discovery_queue ENABLE ROW LEVEL SECURITY;

-- Public can view upcoming releases
DROP POLICY IF EXISTS "Public can view upcoming releases" ON upcoming_releases;
CREATE POLICY "Public can view upcoming releases" ON upcoming_releases
  FOR SELECT USING (true);

-- Service role can manage
DROP POLICY IF EXISTS "Service role manages upcoming_releases" ON upcoming_releases;
CREATE POLICY "Service role manages upcoming_releases" ON upcoming_releases
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role manages release_discovery_queue" ON release_discovery_queue;
CREATE POLICY "Service role manages release_discovery_queue" ON release_discovery_queue
  FOR ALL USING (auth.role() = 'service_role');

-- 4. Function to get upcoming releases for followed games
CREATE OR REPLACE FUNCTION get_upcoming_for_user(p_user_id UUID, p_limit INT DEFAULT 10)
RETURNS TABLE(
  id UUID,
  game_id UUID,
  game_name TEXT,
  game_slug TEXT,
  game_cover_url TEXT,
  title TEXT,
  release_type TEXT,
  release_date DATE,
  release_window TEXT,
  is_confirmed BOOLEAN,
  days_until INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ur.id,
    ur.game_id,
    g.name::TEXT as game_name,
    g.slug::TEXT as game_slug,
    g.cover_url::TEXT as game_cover_url,
    ur.title,
    ur.release_type,
    ur.release_date,
    ur.release_window,
    ur.is_confirmed,
    CASE
      WHEN ur.release_date IS NOT NULL
      THEN (ur.release_date - CURRENT_DATE)::INT
      ELSE NULL
    END as days_until
  FROM upcoming_releases ur
  JOIN games g ON ur.game_id = g.id
  JOIN user_games ug ON ur.game_id = ug.game_id
  WHERE ug.user_id = p_user_id
    AND (ur.release_date IS NULL OR ur.release_date >= CURRENT_DATE)
  ORDER BY
    ur.release_date NULLS LAST,
    ur.created_at DESC
  LIMIT p_limit;
END;
$$;

-- 5. Function to queue games for release discovery
CREATE OR REPLACE FUNCTION queue_release_discovery()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add all games that aren't already queued
  INSERT INTO release_discovery_queue (game_id, next_check_at)
  SELECT g.id, now()
  FROM games g
  WHERE NOT EXISTS (
    SELECT 1 FROM release_discovery_queue rdq WHERE rdq.game_id = g.id
  )
  ON CONFLICT (game_id) DO NOTHING;

  -- Reset stale processing items
  UPDATE release_discovery_queue
  SET status = 'pending', next_check_at = now()
  WHERE status = 'processing'
    AND last_checked_at < now() - INTERVAL '1 hour';
END;
$$;

-- 6. Trigger to auto-queue new games
CREATE OR REPLACE FUNCTION auto_queue_new_game()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO release_discovery_queue (game_id, next_check_at)
  VALUES (NEW.id, now())
  ON CONFLICT (game_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_queue_game ON games;
CREATE TRIGGER trigger_auto_queue_game
  AFTER INSERT ON games
  FOR EACH ROW
  EXECUTE FUNCTION auto_queue_new_game();
