-- Game Discovery Queue
-- Stores pending game discoveries that need admin review

CREATE TABLE IF NOT EXISTS game_discovery_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query TEXT NOT NULL,
  discovered_data JSONB NOT NULL,
  confidence REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending_review',  -- pending_review, approved, rejected
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for finding pending reviews
CREATE INDEX idx_game_discovery_queue_status ON game_discovery_queue(status);
CREATE INDEX idx_game_discovery_queue_created ON game_discovery_queue(created_at DESC);

-- Track discovery attempts to prevent spam
CREATE TABLE IF NOT EXISTS game_discovery_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  result_status TEXT NOT NULL,  -- success, queued, failed, duplicate
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for rate limiting
CREATE INDEX idx_discovery_attempts_user_date ON game_discovery_attempts(user_id, created_at DESC);

-- Function to check rate limit (3 discoveries per day per user)
CREATE OR REPLACE FUNCTION check_discovery_rate_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO attempt_count
  FROM game_discovery_attempts
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '24 hours';

  RETURN attempt_count < 3;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE game_discovery_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_discovery_attempts ENABLE ROW LEVEL SECURITY;

-- Users can see their own discovery requests
CREATE POLICY "Users can view own discovery requests"
  ON game_discovery_queue FOR SELECT
  USING (requested_by = auth.uid());

-- Admins can see all
CREATE POLICY "Admins can view all discovery requests"
  ON game_discovery_queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Service role can insert
CREATE POLICY "Service role can insert discovery requests"
  ON game_discovery_queue FOR INSERT
  WITH CHECK (true);

-- Admins can update
CREATE POLICY "Admins can update discovery requests"
  ON game_discovery_queue FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Users can see own attempts
CREATE POLICY "Users can view own attempts"
  ON game_discovery_attempts FOR SELECT
  USING (user_id = auth.uid());

-- Service role can insert attempts
CREATE POLICY "Service role can insert attempts"
  ON game_discovery_attempts FOR INSERT
  WITH CHECK (true);
