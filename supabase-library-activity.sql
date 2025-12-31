-- ============================================================================
-- PATCHPULSE: LIBRARY AUTO-REACTIVE SYSTEM
-- This migration adds activity tracking to make the Library feel "alive"
-- NOTE: user_followed_games is a VIEW, so we modify user_games TABLE instead
-- ============================================================================

-- ============================================================================
-- PART 1: ADD ACTIVITY TRACKING COLUMNS TO user_games TABLE
-- ============================================================================

-- Add activity tracking columns to the actual table
ALTER TABLE user_games
ADD COLUMN IF NOT EXISTS last_seen_patch_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_seen_news_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS unread_patch_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unread_news_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS latest_patch_id UUID,
ADD COLUMN IF NOT EXISTS latest_news_id UUID,
ADD COLUMN IF NOT EXISTS latest_patch_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS latest_news_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS latest_patch_title TEXT,
ADD COLUMN IF NOT EXISTS latest_patch_severity INTEGER DEFAULT 50;

-- Index for sorting by activity
CREATE INDEX IF NOT EXISTS idx_user_games_activity
ON user_games(user_id, unread_patch_count DESC, unread_news_count DESC);

-- ============================================================================
-- PART 2: RECREATE user_followed_games VIEW TO INCLUDE NEW COLUMNS
-- ============================================================================

-- Drop and recreate the view to include new columns
DROP VIEW IF EXISTS user_followed_games CASCADE;

CREATE VIEW user_followed_games AS
SELECT
  id,
  user_id,
  game_id,
  notify_patches,
  notify_news,
  is_favorite,
  source,
  created_at,
  updated_at,
  last_seen_patch_at,
  last_seen_news_at,
  unread_patch_count,
  unread_news_count,
  latest_patch_id,
  latest_news_id,
  latest_patch_at,
  latest_news_at,
  latest_patch_title,
  latest_patch_severity
FROM user_games;

-- Grant permissions on the view
GRANT SELECT ON user_followed_games TO authenticated;
GRANT SELECT ON user_followed_games TO anon;

-- ============================================================================
-- PART 3: UPDATE TRIGGERS TO INCREMENT UNREAD COUNTS
-- ============================================================================

-- Function to increment unread patch count for followers
CREATE OR REPLACE FUNCTION increment_unread_patch_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_games
  SET
    unread_patch_count = COALESCE(unread_patch_count, 0) + 1,
    latest_patch_id = NEW.id,
    latest_patch_at = NEW.published_at,
    latest_patch_title = NEW.title,
    latest_patch_severity = COALESCE(NEW.impact_score, 50)
  WHERE game_id = NEW.game_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_increment_patch_count ON patch_notes;
CREATE TRIGGER trigger_increment_patch_count
  AFTER INSERT ON patch_notes
  FOR EACH ROW
  EXECUTE FUNCTION increment_unread_patch_count();

-- Function to increment unread news count for followers
CREATE OR REPLACE FUNCTION increment_unread_news_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.game_id IS NOT NULL THEN
    UPDATE user_games
    SET
      unread_news_count = COALESCE(unread_news_count, 0) + 1,
      latest_news_id = NEW.id,
      latest_news_at = NEW.published_at
    WHERE game_id = NEW.game_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_increment_news_count ON news_items;
CREATE TRIGGER trigger_increment_news_count
  AFTER INSERT ON news_items
  FOR EACH ROW
  EXECUTE FUNCTION increment_unread_news_count();

-- ============================================================================
-- PART 4: FUNCTION TO MARK GAME AS SEEN (RESET UNREAD COUNTS)
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_game_updates_seen(
  p_user_id UUID,
  p_game_id UUID,
  p_mark_patches BOOLEAN DEFAULT true,
  p_mark_news BOOLEAN DEFAULT true
)
RETURNS VOID AS $$
BEGIN
  UPDATE user_games
  SET
    unread_patch_count = CASE WHEN p_mark_patches THEN 0 ELSE unread_patch_count END,
    unread_news_count = CASE WHEN p_mark_news THEN 0 ELSE unread_news_count END,
    last_seen_patch_at = CASE WHEN p_mark_patches THEN NOW() ELSE last_seen_patch_at END,
    last_seen_news_at = CASE WHEN p_mark_news THEN NOW() ELSE last_seen_news_at END
  WHERE user_id = p_user_id AND game_id = p_game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all games as seen
CREATE OR REPLACE FUNCTION mark_all_updates_seen(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_games
  SET
    unread_patch_count = 0,
    unread_news_count = 0,
    last_seen_patch_at = NOW(),
    last_seen_news_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 5: BACKFILL EXISTING DATA
-- ============================================================================

-- Backfill latest patch info for existing followed games
UPDATE user_games ug
SET
  latest_patch_id = subq.patch_id,
  latest_patch_at = subq.published_at,
  latest_patch_title = subq.title,
  latest_patch_severity = subq.impact_score
FROM (
  SELECT DISTINCT ON (game_id)
    game_id,
    id as patch_id,
    published_at,
    title,
    COALESCE(impact_score, 50) as impact_score
  FROM patch_notes
  ORDER BY game_id, published_at DESC
) subq
WHERE ug.game_id = subq.game_id;

-- Backfill latest news info for existing followed games
UPDATE user_games ug
SET
  latest_news_id = subq.news_id,
  latest_news_at = subq.published_at
FROM (
  SELECT DISTINCT ON (game_id)
    game_id,
    id as news_id,
    published_at
  FROM news_items
  WHERE game_id IS NOT NULL
  ORDER BY game_id, published_at DESC
) subq
WHERE ug.game_id = subq.game_id;

-- Set initial unread counts based on patches from last 7 days
UPDATE user_games ug
SET unread_patch_count = subq.count
FROM (
  SELECT game_id, COUNT(*) as count
  FROM patch_notes
  WHERE published_at > NOW() - INTERVAL '7 days'
  GROUP BY game_id
) subq
WHERE ug.game_id = subq.game_id;

-- Set initial unread news counts based on news from last 7 days
UPDATE user_games ug
SET unread_news_count = subq.count
FROM (
  SELECT game_id, COUNT(*) as count
  FROM news_items
  WHERE game_id IS NOT NULL AND published_at > NOW() - INTERVAL '7 days'
  GROUP BY game_id
) subq
WHERE ug.game_id = subq.game_id;

-- ============================================================================
-- PART 6: VIEW FOR LIBRARY WITH ACTIVITY
-- ============================================================================

DROP VIEW IF EXISTS user_library_with_activity;

CREATE VIEW user_library_with_activity AS
SELECT
  ug.id,
  ug.user_id,
  ug.game_id,
  ug.notify_patches,
  ug.notify_news,
  ug.created_at,
  COALESCE(ug.unread_patch_count, 0) as unread_patch_count,
  COALESCE(ug.unread_news_count, 0) as unread_news_count,
  (COALESCE(ug.unread_patch_count, 0) + COALESCE(ug.unread_news_count, 0)) as total_unread,
  ug.latest_patch_id,
  ug.latest_patch_at,
  ug.latest_patch_title,
  ug.latest_patch_severity,
  ug.latest_news_id,
  ug.latest_news_at,
  ug.last_seen_patch_at,
  ug.last_seen_news_at,
  g.name as game_name,
  g.slug as game_slug,
  g.cover_url as game_cover_url,
  g.logo_url as game_logo_url,
  g.brand_color as game_brand_color,
  -- Check if in backlog
  bi.id as backlog_id,
  bi.status as backlog_status
FROM user_games ug
JOIN games g ON g.id = ug.game_id
LEFT JOIN backlog_items bi ON bi.game_id = ug.game_id AND bi.user_id = ug.user_id;

-- Grant permissions
GRANT SELECT ON user_library_with_activity TO authenticated;

-- ============================================================================
-- DONE! Run this in Supabase SQL Editor
-- ============================================================================
