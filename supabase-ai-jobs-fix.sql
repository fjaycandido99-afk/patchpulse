-- ============================================================================
-- AI JOBS TABLE FIX - Run this to complete setup
-- ============================================================================

-- Drop existing policies first (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Service role can manage ai_jobs" ON ai_jobs;
DROP POLICY IF EXISTS "Service role can manage discovery queue" ON game_discovery_queue;
DROP POLICY IF EXISTS "Service role can manage discovery attempts" ON game_discovery_attempts;

-- Recreate policies
CREATE POLICY "Service role can manage ai_jobs"
  ON ai_jobs FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- GAME DISCOVERY TABLES (if not exist)
-- ============================================================================

CREATE TABLE IF NOT EXISTS game_discovery_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query TEXT NOT NULL,
  discovered_data JSONB,
  confidence FLOAT,
  status TEXT DEFAULT 'pending_review',
  requested_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_discovery_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  result_status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_discovery_attempts_user_time
  ON game_discovery_attempts(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE game_discovery_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_discovery_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage discovery queue"
  ON game_discovery_queue FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role can manage discovery attempts"
  ON game_discovery_attempts FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- SEASONAL DISCOVERY QUEUE
-- ============================================================================

CREATE TABLE IF NOT EXISTS seasonal_discovery_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  search_results JSONB,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id)
);

-- ============================================================================
-- ADD MISSING COLUMNS TO patch_notes
-- ============================================================================

ALTER TABLE patch_notes ADD COLUMN IF NOT EXISTS raw_text TEXT;
ALTER TABLE patch_notes ADD COLUMN IF NOT EXISTS ai_insight TEXT;

-- ============================================================================
-- DONE!
-- ============================================================================
SELECT 'AI jobs setup complete!' as status;
