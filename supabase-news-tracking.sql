-- News Tracking: Last Visit + Read Status
-- Run this in Supabase SQL Editor

-- 1. Add last_news_visit_at to profiles for "since last visit" divider
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_news_visit_at TIMESTAMPTZ DEFAULT now();

-- 2. Track dismissed/read news items per user (optional granular tracking)
CREATE TABLE IF NOT EXISTS news_read_status (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  news_id UUID REFERENCES news_items(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT now(),
  dismissed BOOLEAN DEFAULT false,
  PRIMARY KEY (user_id, news_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_news_read_status_user
ON news_read_status(user_id, read_at DESC);

-- 3. RLS policies
ALTER TABLE news_read_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own read status" ON news_read_status;
CREATE POLICY "Users can view own read status" ON news_read_status
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own read status" ON news_read_status;
CREATE POLICY "Users can insert own read status" ON news_read_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own read status" ON news_read_status;
CREATE POLICY "Users can update own read status" ON news_read_status
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Function to mark news visit and get new count
CREATE OR REPLACE FUNCTION mark_news_visited()
RETURNS TABLE(new_items_count BIGINT, last_visit TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  prev_visit TIMESTAMPTZ;
  item_count BIGINT;
BEGIN
  -- Get previous visit time
  SELECT last_news_visit_at INTO prev_visit
  FROM profiles WHERE id = auth.uid();

  -- Count new items since last visit
  SELECT COUNT(*) INTO item_count
  FROM news_items ni
  JOIN user_games ug ON ni.game_id = ug.game_id
  WHERE ug.user_id = auth.uid()
    AND ni.published_at > COALESCE(prev_visit, '1970-01-01'::TIMESTAMPTZ);

  -- Update last visit time
  UPDATE profiles
  SET last_news_visit_at = now()
  WHERE id = auth.uid();

  RETURN QUERY SELECT item_count, prev_visit;
END;
$$;

-- 5. Function to get news grouped by game with unread counts
CREATE OR REPLACE FUNCTION get_news_by_game(
  p_limit INT DEFAULT 50,
  p_filter_type TEXT DEFAULT NULL -- 'patch', 'news', 'rumor'
)
RETURNS TABLE(
  game_id UUID,
  game_name TEXT,
  game_slug TEXT,
  game_logo_url TEXT,
  game_cover_url TEXT,
  game_brand_color TEXT,
  unread_count BIGINT,
  news_items JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_last_visit AS (
    SELECT COALESCE(last_news_visit_at, '1970-01-01'::TIMESTAMPTZ) as last_visit
    FROM profiles WHERE id = auth.uid()
  ),
  followed_games AS (
    SELECT game_id FROM user_games WHERE user_id = auth.uid()
  ),
  news_with_read AS (
    SELECT
      ni.*,
      g.name as g_name,
      g.slug as g_slug,
      g.logo_url as g_logo_url,
      g.cover_url as g_cover_url,
      g.brand_color as g_brand_color,
      ni.published_at > (SELECT last_visit FROM user_last_visit) as is_new,
      nrs.read_at IS NOT NULL as is_read
    FROM news_items ni
    JOIN games g ON ni.game_id = g.id
    JOIN followed_games fg ON ni.game_id = fg.game_id
    LEFT JOIN news_read_status nrs ON ni.id = nrs.news_id AND nrs.user_id = auth.uid()
    WHERE (p_filter_type IS NULL
           OR (p_filter_type = 'rumor' AND ni.is_rumor = true)
           OR (p_filter_type = 'news' AND ni.is_rumor = false))
    ORDER BY ni.published_at DESC
    LIMIT p_limit
  )
  SELECT
    nwr.game_id,
    nwr.g_name::TEXT,
    nwr.g_slug::TEXT,
    nwr.g_logo_url::TEXT,
    nwr.g_cover_url::TEXT,
    nwr.g_brand_color::TEXT,
    COUNT(*) FILTER (WHERE nwr.is_new AND NOT nwr.is_read) as unread_count,
    jsonb_agg(
      jsonb_build_object(
        'id', nwr.id,
        'title', nwr.title,
        'summary', nwr.summary,
        'why_it_matters', nwr.why_it_matters,
        'source_name', nwr.source_name,
        'source_url', nwr.source_url,
        'published_at', nwr.published_at,
        'is_rumor', nwr.is_rumor,
        'is_new', nwr.is_new,
        'is_read', nwr.is_read,
        'topics', nwr.topics
      ) ORDER BY nwr.published_at DESC
    ) as news_items
  FROM news_with_read nwr
  GROUP BY nwr.game_id, nwr.g_name, nwr.g_slug, nwr.g_logo_url, nwr.g_cover_url, nwr.g_brand_color
  ORDER BY MAX(nwr.published_at) DESC;
END;
$$;
