-- ============================================================================
-- AI JOBS TABLE FOR PATCHPULSE
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Create the ai_jobs table for queuing AI processing tasks
CREATE TABLE IF NOT EXISTS ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL CHECK (job_type IN (
    'PATCH_SUMMARY',
    'NEWS_SUMMARY',
    'DISCOVER_SEASONAL',
    'RETURN_MATCH',
    'DISCOVER_RELEASES'
  )),
  entity_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'done', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate jobs for same entity
  UNIQUE(job_type, entity_id)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_ai_jobs_pending
  ON ai_jobs(status, created_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_ai_jobs_entity
  ON ai_jobs(entity_id);

-- Enable RLS
ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;

-- Only service role can manage AI jobs
CREATE POLICY "Service role can manage ai_jobs"
  ON ai_jobs FOR ALL
  TO service_role
  USING (true);

-- ============================================================================
-- GAME DISCOVERY QUEUE
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
-- ADD raw_text COLUMN TO patch_notes (if not exists)
-- ============================================================================

ALTER TABLE patch_notes ADD COLUMN IF NOT EXISTS raw_text TEXT;
ALTER TABLE patch_notes ADD COLUMN IF NOT EXISTS ai_insight TEXT;

-- ============================================================================
-- DONE! Run the cron to process pending AI jobs.
-- ============================================================================
