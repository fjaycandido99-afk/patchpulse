-- Seasonal Artwork System
-- Automatically fetch and display promotional artwork for games during events

-- Seasonal Events Table
-- Stores discovered seasonal/promotional artwork for games
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

-- Note: Supabase doesn't support generated columns with CURRENT_DATE
-- We'll handle is_active logic in queries instead

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_seasonal_events_game ON seasonal_events(game_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_events_dates ON seasonal_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_seasonal_events_approved ON seasonal_events(is_auto_approved, is_admin_approved);
CREATE INDEX IF NOT EXISTS idx_seasonal_events_active_lookup ON seasonal_events(game_id, start_date, end_date)
  WHERE (is_auto_approved = true OR is_admin_approved = true);

-- Seasonal Discovery Queue
-- Tracks AI discovery jobs for finding seasonal artwork
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

CREATE INDEX IF NOT EXISTS idx_seasonal_queue_pending ON seasonal_discovery_queue(status, created_at)
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_seasonal_queue_game ON seasonal_discovery_queue(game_id);

-- Enable RLS
ALTER TABLE seasonal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_discovery_queue ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Public can view approved seasonal events" ON seasonal_events;
DROP POLICY IF EXISTS "Service role full access to seasonal_events" ON seasonal_events;
DROP POLICY IF EXISTS "Service role full access to seasonal_discovery_queue" ON seasonal_discovery_queue;

-- Public read access for seasonal events (approved only)
CREATE POLICY "Public can view approved seasonal events"
  ON seasonal_events FOR SELECT
  USING ((is_auto_approved = true OR is_admin_approved = true));

-- Service role full access
CREATE POLICY "Service role full access to seasonal_events"
  ON seasonal_events FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access to seasonal_discovery_queue"
  ON seasonal_discovery_queue FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Helper function to check if an event is currently active
CREATE OR REPLACE FUNCTION is_seasonal_event_active(event_row seasonal_events)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (event_row.is_auto_approved OR event_row.is_admin_approved)
    AND CURRENT_DATE BETWEEN event_row.start_date AND event_row.end_date;
END;
$$ LANGUAGE plpgsql STABLE;

-- View for active seasonal events (convenience)
CREATE OR REPLACE VIEW active_seasonal_events AS
SELECT
  se.*,
  g.name as game_name,
  g.slug as game_slug,
  g.cover_url as default_cover_url,
  g.logo_url as default_logo_url
FROM seasonal_events se
JOIN games g ON g.id = se.game_id
WHERE (se.is_auto_approved = true OR se.is_admin_approved = true)
  AND CURRENT_DATE BETWEEN se.start_date AND se.end_date;

-- Function to get seasonal image for a game (returns seasonal if active, else default)
CREATE OR REPLACE FUNCTION get_game_seasonal_cover(p_game_id UUID)
RETURNS TABLE(
  cover_url TEXT,
  is_seasonal BOOLEAN,
  event_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(se.cover_url, g.cover_url) as cover_url,
    (se.id IS NOT NULL) as is_seasonal,
    se.event_name
  FROM games g
  LEFT JOIN seasonal_events se ON se.game_id = g.id
    AND (se.is_auto_approved = true OR se.is_admin_approved = true)
    AND CURRENT_DATE BETWEEN se.start_date AND se.end_date
    AND se.cover_url IS NOT NULL
  WHERE g.id = p_game_id
  ORDER BY se.confidence_score DESC NULLS LAST
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Batch function for efficient multi-game lookups
CREATE OR REPLACE FUNCTION batch_get_seasonal_covers(p_game_ids UUID[])
RETURNS TABLE(
  game_id UUID,
  cover_url TEXT,
  logo_url TEXT,
  hero_url TEXT,
  brand_color TEXT,
  is_seasonal BOOLEAN,
  event_name TEXT,
  event_type TEXT
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
