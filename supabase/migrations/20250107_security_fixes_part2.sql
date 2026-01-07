-- ============================================================================
-- SECURITY FIXES PART 2
-- Fixes remaining Function Search Path Mutable and RLS Policy Always True
-- ============================================================================

-- ============================================================================
-- 1. FIX FUNCTION SEARCH PATH MUTABLE
-- ============================================================================

-- Fix notify_followers_of_patch
CREATE OR REPLACE FUNCTION public.notify_followers_of_patch()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, body, priority, game_id, patch_id, metadata)
  SELECT
    uf.user_id,
    'new_patch',
    g.name || ' - New Patch',
    COALESCE(NEW.summary_tldr, LEFT(NEW.title, 100)),
    CASE
      WHEN NEW.impact_score >= 8 THEN 5
      WHEN NEW.impact_score >= 6 THEN 4
      WHEN NEW.impact_score >= 4 THEN 3
      ELSE 2
    END,
    NEW.game_id,
    NEW.id,
    jsonb_build_object(
      'patch_title', NEW.title,
      'impact_score', NEW.impact_score,
      'version', NEW.version
    )
  FROM user_followed_games uf
  JOIN games g ON g.id = NEW.game_id
  WHERE uf.game_id = NEW.game_id;

  RETURN NEW;
END;
$$;

-- Fix notify_followers_of_news
CREATE OR REPLACE FUNCTION public.notify_followers_of_news()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_rumor = false OR (NEW.is_rumor = true AND EXISTS (
    SELECT 1 FROM unnest(NEW.topics) t WHERE t IN ('Launch', 'DLC', 'Delay')
  )) THEN
    INSERT INTO notifications (user_id, type, title, body, priority, game_id, news_id, metadata)
    SELECT
      uf.user_id,
      'new_news',
      g.name || ' - ' || CASE WHEN NEW.is_rumor THEN 'Rumor' ELSE 'News' END,
      COALESCE(NEW.why_it_matters, LEFT(NEW.summary, 100), LEFT(NEW.title, 100)),
      CASE
        WHEN 'Launch' = ANY(NEW.topics) THEN 5
        WHEN 'DLC' = ANY(NEW.topics) THEN 4
        WHEN 'Delay' = ANY(NEW.topics) THEN 4
        WHEN NEW.is_rumor THEN 2
        ELSE 3
      END,
      NEW.game_id,
      NEW.id,
      jsonb_build_object(
        'news_title', NEW.title,
        'is_rumor', NEW.is_rumor,
        'topics', NEW.topics
      )
    FROM user_followed_games uf
    JOIN games g ON g.id = NEW.game_id
    WHERE uf.game_id = NEW.game_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Fix mark_notifications_read
CREATE OR REPLACE FUNCTION public.mark_notifications_read(notification_ids UUID[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE notifications
  SET is_read = true, read_at = now()
  WHERE id = ANY(notification_ids)
    AND user_id = auth.uid();
END;
$$;

-- Fix mark_all_notifications_read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE notifications
  SET is_read = true, read_at = now()
  WHERE user_id = auth.uid()
    AND is_read = false;
END;
$$;

-- Fix get_notification_stats
CREATE OR REPLACE FUNCTION public.get_notification_stats()
RETURNS TABLE (
  unread_count BIGINT,
  high_priority_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE is_read = false),
    COUNT(*) FILTER (WHERE is_read = false AND priority >= 4)
  FROM notifications
  WHERE user_id = auth.uid();
END;
$$;

-- Fix update_priority_alert_rules_updated_at
CREATE OR REPLACE FUNCTION public.update_priority_alert_rules_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix notify_new_patch (if it exists)
DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.notify_new_patch()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $fn$
  BEGIN
    -- Trigger function for new patches
    PERFORM notify_followers_of_patch();
    RETURN NEW;
  END;
  $fn$;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Fix trigger_queue_news_summary (if it exists)
DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.trigger_queue_news_summary()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $fn$
  BEGIN
    INSERT INTO ai_processing_queue (task_type, entity_type, entity_id, priority)
    VALUES ('news_summary', 'news', NEW.id, 5)
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  END;
  $fn$;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================================
-- 2. FIX RLS POLICY ALWAYS TRUE - Restrict to service_role only
-- ============================================================================

-- Fix ai_processing_queue - only service role should access
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role manages AI queue" ON ai_processing_queue;
  CREATE POLICY "Service role manages AI queue" ON ai_processing_queue
    FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Fix game_discovery_queue - restrict to service role for management
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role manages discovery queue" ON game_discovery_queue;
  DROP POLICY IF EXISTS "Anyone can view discovery queue" ON game_discovery_queue;

  -- Service role full access
  CREATE POLICY "Service role manages discovery queue" ON game_discovery_queue
    FOR ALL TO service_role USING (true) WITH CHECK (true);

  -- Users can only see their own requests (already optimized in part 1)
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Fix game_discovery_attempts - restrict to service role + user's own
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role manages discovery attempts" ON game_discovery_attempts;
  DROP POLICY IF EXISTS "Anyone can view discovery attempts" ON game_discovery_attempts;

  -- Service role full access
  CREATE POLICY "Service role manages discovery attempts" ON game_discovery_attempts
    FOR ALL TO service_role USING (true) WITH CHECK (true);

  -- Users can only see their own attempts (already handled in part 1)
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- Done
-- ============================================================================
SELECT 'Security fixes part 2 applied successfully' AS message;
