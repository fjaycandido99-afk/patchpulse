-- ============================================================================
-- SECURITY FIXES PART 4
-- Final remaining Function Search Path Mutable issues
-- ============================================================================

-- Fix upsert_apple_subscription
CREATE OR REPLACE FUNCTION public.upsert_apple_subscription(
  p_user_id UUID,
  p_original_transaction_id TEXT,
  p_status TEXT,
  p_expires_date TIMESTAMPTZ
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_subscriptions (
    user_id, plan, status, provider,
    provider_subscription_id,
    current_period_end, updated_at
  ) VALUES (
    p_user_id, 'pro', p_status, 'apple',
    p_original_transaction_id,
    p_expires_date, now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan = 'pro',
    status = p_status,
    provider = 'apple',
    provider_subscription_id = p_original_transaction_id,
    current_period_end = p_expires_date,
    updated_at = now();
END;
$$;

-- Fix downgrade_to_free
CREATE OR REPLACE FUNCTION public.downgrade_to_free(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_subscriptions
  SET plan = 'free', status = 'expired', updated_at = now()
  WHERE user_id = p_user_id;

  INSERT INTO subscription_events (user_id, event_type)
  VALUES (p_user_id, 'expired');
END;
$$;

-- Fix get_upcoming_for_user
CREATE OR REPLACE FUNCTION public.get_upcoming_for_user(p_user_id UUID, p_limit INT DEFAULT 10)
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
SET search_path = public
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
      WHEN ur.release_date IS NOT NULL THEN (ur.release_date - CURRENT_DATE)::INT
      ELSE NULL
    END as days_until
  FROM upcoming_releases ur
  JOIN games g ON g.id = ur.game_id
  WHERE ur.game_id IN (SELECT ug.game_id FROM user_games ug WHERE ug.user_id = p_user_id)
    AND (ur.release_date IS NULL OR ur.release_date >= CURRENT_DATE)
  ORDER BY ur.release_date ASC NULLS LAST
  LIMIT p_limit;
END;
$$;

-- Fix get_stale_playing_games
CREATE OR REPLACE FUNCTION public.get_stale_playing_games(p_user_id UUID, p_days_threshold INT DEFAULT 14)
RETURNS TABLE (
  backlog_item_id UUID,
  game_id UUID,
  game_name TEXT,
  game_cover_url TEXT,
  last_played_at TIMESTAMPTZ,
  days_since_played INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix queue_ai_task
CREATE OR REPLACE FUNCTION public.queue_ai_task(
  p_task_type TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_priority INTEGER DEFAULT 5,
  p_payload JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task_id UUID;
BEGIN
  INSERT INTO ai_processing_queue (task_type, entity_type, entity_id, priority, payload)
  VALUES (p_task_type, p_entity_type, p_entity_id, p_priority, p_payload)
  RETURNING id INTO v_task_id;

  RETURN v_task_id;
END;
$$;

-- Fix trigger_queue_patch_summary
CREATE OR REPLACE FUNCTION public.trigger_queue_patch_summary()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM queue_ai_task('patch_summary', 'patch', NEW.id, 7);
  RETURN NEW;
END;
$$;

-- Fix trigger_queue_news_summary (also fixing this one)
CREATE OR REPLACE FUNCTION public.trigger_queue_news_summary()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM queue_ai_task('news_summary', 'news', NEW.id, 5);
  RETURN NEW;
END;
$$;

-- ============================================================================
-- Done
-- ============================================================================
SELECT 'Security fixes part 4 applied successfully' AS message;
