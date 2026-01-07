-- ============================================================================
-- SECURITY FIXES FOR SUPABASE PERFORMANCE ADVISOR CRITICAL ISSUES
-- Fixes: RLS disabled, Security Definer Views, Exposed Auth Users,
--        Function Search Path Mutable
-- ============================================================================

-- ============================================================================
-- 1. ENABLE RLS ON GAMES TABLE (currently disabled)
-- Games data is public but RLS should still be enabled with public policy
-- ============================================================================

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read games (public data)
DROP POLICY IF EXISTS "Public can view games" ON public.games;
CREATE POLICY "Public can view games"
  ON public.games FOR SELECT
  USING (true);

-- Only service role can modify games
DROP POLICY IF EXISTS "Service role can manage games" ON public.games;
CREATE POLICY "Service role can manage games"
  ON public.games FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 2. FIX SECURITY DEFINER VIEWS - Change to SECURITY INVOKER
-- Views should use caller's permissions, not definer's
-- ============================================================================

-- Fix active_seasonal_events view
DROP VIEW IF EXISTS public.active_seasonal_events;
CREATE VIEW public.active_seasonal_events
WITH (security_invoker = true)
AS
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

GRANT SELECT ON public.active_seasonal_events TO authenticated;
GRANT SELECT ON public.active_seasonal_events TO anon;

-- Fix mvp_games view
DROP VIEW IF EXISTS public.mvp_games;
CREATE VIEW public.mvp_games
WITH (security_invoker = true)
AS
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

GRANT SELECT ON public.mvp_games TO authenticated;
GRANT SELECT ON public.mvp_games TO anon;

-- Fix user_followed_games view
DROP VIEW IF EXISTS public.user_followed_games CASCADE;
CREATE VIEW public.user_followed_games
WITH (security_invoker = true)
AS
SELECT * FROM user_games;

GRANT SELECT ON public.user_followed_games TO authenticated;
GRANT SELECT ON public.user_followed_games TO anon;

-- Fix user_library_with_activity view
DROP VIEW IF EXISTS public.user_library_with_activity;
CREATE VIEW public.user_library_with_activity
WITH (security_invoker = true)
AS
SELECT
  ug.id,
  ug.user_id,
  ug.game_id,
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
  bi.id as backlog_id,
  bi.status as backlog_status,
  true as notify_patches,
  true as notify_news
FROM user_games ug
JOIN games g ON g.id = ug.game_id
LEFT JOIN backlog_items bi ON bi.game_id = ug.game_id AND bi.user_id = ug.user_id;

GRANT SELECT ON public.user_library_with_activity TO authenticated;

-- Fix user_usage_stats view (also fixes Exposed Auth Users issue)
-- Changed from auth.users to profiles table
DROP VIEW IF EXISTS public.user_usage_stats;
CREATE VIEW public.user_usage_stats
WITH (security_invoker = true)
AS
SELECT
  p.id as user_id,
  COALESCE(s.plan, 'free') as plan,
  COALESCE(s.status, 'active') as subscription_status,
  (SELECT COUNT(*) FROM backlog_items bi WHERE bi.user_id = p.id) as backlog_count,
  (SELECT COUNT(*) FROM user_games ug WHERE ug.user_id = p.id AND ug.is_favorite = true) as favorites_count,
  (SELECT COUNT(*) FROM user_games ug WHERE ug.user_id = p.id) as followed_count
FROM profiles p
LEFT JOIN user_subscriptions s ON s.user_id = p.id;

GRANT SELECT ON public.user_usage_stats TO authenticated;

-- ============================================================================
-- 3. FIX FUNCTION SEARCH PATH MUTABLE
-- Add SET search_path = public to prevent search path attacks
-- ============================================================================

-- Fix auto_queue_new_game if it exists
CREATE OR REPLACE FUNCTION public.auto_queue_new_game()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-queue new games for discovery
  INSERT INTO game_discovery_queue (game_id, status, priority)
  VALUES (NEW.id, 'pending', 5)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

-- Fix batch_get_seasonal_covers
CREATE OR REPLACE FUNCTION public.batch_get_seasonal_covers(p_game_ids UUID[])
RETURNS TABLE(
  game_id UUID,
  cover_url TEXT,
  logo_url TEXT,
  hero_url TEXT,
  brand_color TEXT,
  is_seasonal BOOLEAN,
  event_name TEXT,
  event_type TEXT
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
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
$$;

-- Fix can_add_favorite
CREATE OR REPLACE FUNCTION public.can_add_favorite(p_user_id UUID)
RETURNS TABLE(
  allowed BOOLEAN,
  current_count INT,
  max_count INT,
  plan TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan TEXT;
  v_current INT;
  v_limit INT;
BEGIN
  SELECT COALESCE(s.plan, 'free') INTO v_plan
  FROM profiles p
  LEFT JOIN user_subscriptions s ON s.user_id = p.id AND s.status = 'active'
  WHERE p.id = p_user_id;

  SELECT COUNT(*) INTO v_current
  FROM user_games
  WHERE user_id = p_user_id AND is_favorite = true;

  SELECT l.favorites_limit INTO v_limit
  FROM get_plan_limits(v_plan) l;

  RETURN QUERY SELECT
    (v_current < v_limit),
    v_current,
    v_limit,
    v_plan;
END;
$$;

-- Fix can_add_to_backlog
CREATE OR REPLACE FUNCTION public.can_add_to_backlog(p_user_id UUID)
RETURNS TABLE(
  allowed BOOLEAN,
  current_count INT,
  max_count INT,
  plan TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan TEXT;
  v_current INT;
  v_limit INT;
BEGIN
  SELECT COALESCE(s.plan, 'free') INTO v_plan
  FROM profiles p
  LEFT JOIN user_subscriptions s ON s.user_id = p.id AND s.status = 'active'
  WHERE p.id = p_user_id;

  SELECT COUNT(*) INTO v_current
  FROM backlog_items
  WHERE user_id = p_user_id;

  SELECT l.backlog_limit INTO v_limit
  FROM get_plan_limits(v_plan) l;

  RETURN QUERY SELECT
    (v_current < v_limit),
    v_current,
    v_limit,
    v_plan;
END;
$$;

-- Fix can_follow_game
CREATE OR REPLACE FUNCTION public.can_follow_game(p_user_id UUID)
RETURNS TABLE(
  allowed BOOLEAN,
  current_count INT,
  max_count INT,
  plan TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan TEXT;
  v_current INT;
  v_limit INT;
BEGIN
  SELECT COALESCE(s.plan, 'free') INTO v_plan
  FROM profiles p
  LEFT JOIN user_subscriptions s ON s.user_id = p.id AND s.status = 'active'
  WHERE p.id = p_user_id;

  SELECT COUNT(*) INTO v_current
  FROM user_games
  WHERE user_id = p_user_id;

  SELECT l.followed_limit INTO v_limit
  FROM get_plan_limits(v_plan) l;

  RETURN QUERY SELECT
    (v_current < v_limit),
    v_current,
    v_limit,
    v_plan;
END;
$$;

-- Fix get_plan_limits
CREATE OR REPLACE FUNCTION public.get_plan_limits(p_plan TEXT)
RETURNS TABLE(
  backlog_limit INT,
  favorites_limit INT,
  followed_limit INT,
  has_notifications BOOLEAN,
  has_ai_summaries BOOLEAN
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  IF p_plan = 'pro' THEN
    RETURN QUERY SELECT
      999999::INT,
      999999::INT,
      999999::INT,
      true,
      true;
  ELSE
    RETURN QUERY SELECT
      5::INT,
      5::INT,
      10::INT,
      false,
      false;
  END IF;
END;
$$;

-- Fix get_user_subscription
CREATE OR REPLACE FUNCTION public.get_user_subscription(p_user_id UUID)
RETURNS TABLE(
  plan TEXT,
  status TEXT,
  provider TEXT,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN,
  backlog_used INT,
  backlog_limit INT,
  favorites_used INT,
  favorites_limit INT,
  followed_used INT,
  followed_limit INT,
  has_notifications BOOLEAN,
  has_ai_summaries BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan TEXT;
  v_status TEXT;
  v_provider TEXT;
  v_period_end TIMESTAMPTZ;
  v_cancel BOOLEAN;
BEGIN
  SELECT
    COALESCE(s.plan, 'free'),
    COALESCE(s.status, 'active'),
    s.provider,
    s.current_period_end,
    COALESCE(s.cancel_at_period_end, false)
  INTO v_plan, v_status, v_provider, v_period_end, v_cancel
  FROM profiles p
  LEFT JOIN user_subscriptions s ON s.user_id = p.id
  WHERE p.id = p_user_id;

  RETURN QUERY
  SELECT
    v_plan,
    v_status,
    v_provider,
    v_period_end,
    v_cancel,
    (SELECT COUNT(*)::INT FROM backlog_items WHERE user_id = p_user_id),
    (SELECT l.backlog_limit FROM get_plan_limits(v_plan) l),
    (SELECT COUNT(*)::INT FROM user_games WHERE user_id = p_user_id AND is_favorite = true),
    (SELECT l.favorites_limit FROM get_plan_limits(v_plan) l),
    (SELECT COUNT(*)::INT FROM user_games WHERE user_id = p_user_id),
    (SELECT l.followed_limit FROM get_plan_limits(v_plan) l),
    (SELECT l.has_notifications FROM get_plan_limits(v_plan) l),
    (SELECT l.has_ai_summaries FROM get_plan_limits(v_plan) l);
END;
$$;

-- Fix is_game_supported
CREATE OR REPLACE FUNCTION public.is_game_supported(game_id uuid)
RETURNS TABLE (
  supported boolean,
  tier text,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  game_record RECORD;
BEGIN
  SELECT g.mvp_eligible, g.support_tier, g.name
  INTO game_record
  FROM public.games g
  WHERE g.id = is_game_supported.game_id;

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

-- Fix is_seasonal_event_active
CREATE OR REPLACE FUNCTION public.is_seasonal_event_active(event_row seasonal_events)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN (event_row.is_auto_approved OR event_row.is_admin_approved)
    AND CURRENT_DATE BETWEEN event_row.start_date AND event_row.end_date;
END;
$$;

-- Fix get_game_seasonal_cover
CREATE OR REPLACE FUNCTION public.get_game_seasonal_cover(p_game_id UUID)
RETURNS TABLE(
  cover_url TEXT,
  is_seasonal BOOLEAN,
  event_name TEXT
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
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
$$;

-- Fix increment_unread_patch_count
CREATE OR REPLACE FUNCTION public.increment_unread_patch_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix increment_unread_news_count
CREATE OR REPLACE FUNCTION public.increment_unread_news_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix mark_game_updates_seen
CREATE OR REPLACE FUNCTION public.mark_game_updates_seen(
  p_user_id UUID,
  p_game_id UUID,
  p_mark_patches BOOLEAN DEFAULT true,
  p_mark_news BOOLEAN DEFAULT true
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_games
  SET
    unread_patch_count = CASE WHEN p_mark_patches THEN 0 ELSE unread_patch_count END,
    unread_news_count = CASE WHEN p_mark_news THEN 0 ELSE unread_news_count END,
    last_seen_patch_at = CASE WHEN p_mark_patches THEN NOW() ELSE last_seen_patch_at END,
    last_seen_news_at = CASE WHEN p_mark_news THEN NOW() ELSE last_seen_news_at END
  WHERE user_id = p_user_id AND game_id = p_game_id;
END;
$$;

-- Fix mark_all_updates_seen
CREATE OR REPLACE FUNCTION public.mark_all_updates_seen(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_games
  SET
    unread_patch_count = 0,
    unread_news_count = 0,
    last_seen_patch_at = NOW(),
    last_seen_news_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;

-- ============================================================================
-- Done
-- ============================================================================
SELECT 'Security fixes applied successfully' AS message;
