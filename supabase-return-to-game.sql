-- Return to Game AI Feature
-- Run this migration in your Supabase SQL editor

-- 1. Add pause_reason to backlog_items
ALTER TABLE backlog_items
ADD COLUMN IF NOT EXISTS pause_reason TEXT;

-- 2. Create return_suggestions table
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

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_return_suggestions_user
  ON return_suggestions(user_id, is_dismissed, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_return_suggestions_game
  ON return_suggestions(game_id);

CREATE INDEX IF NOT EXISTS idx_backlog_items_stale
  ON backlog_items(user_id, status, last_played_at)
  WHERE status = 'playing';

-- 4. Enable RLS
ALTER TABLE return_suggestions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY "Users can view their own return suggestions"
  ON return_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own return suggestions"
  ON return_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

-- Note: Service role bypasses RLS, so no INSERT policy needed for AI worker
-- If you need authenticated users to insert, uncomment below:
-- CREATE POLICY "Authenticated users can insert return suggestions"
--   ON return_suggestions FOR INSERT
--   WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own return suggestions"
  ON return_suggestions FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Function to find stale "playing" games (no activity in 14+ days)
CREATE OR REPLACE FUNCTION get_stale_playing_games(p_user_id UUID, p_days_threshold INT DEFAULT 14)
RETURNS TABLE (
  backlog_item_id UUID,
  game_id UUID,
  game_name TEXT,
  game_cover_url TEXT,
  last_played_at TIMESTAMPTZ,
  days_since_played INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bi.id AS backlog_item_id,
    bi.game_id,
    g.name AS game_name,
    g.cover_url AS game_cover_url,
    bi.last_played_at,
    EXTRACT(DAY FROM (now() - bi.last_played_at))::INT AS days_since_played
  FROM backlog_items bi
  JOIN games g ON g.id = bi.game_id
  WHERE bi.user_id = p_user_id
    AND bi.status = 'playing'
    AND bi.last_played_at IS NOT NULL
    AND bi.last_played_at < now() - (p_days_threshold || ' days')::INTERVAL
  ORDER BY bi.last_played_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
