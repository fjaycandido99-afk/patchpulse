-- Migration: Replace direct notification triggers with smart notification queue triggers
-- This queues notifications for async processing with user preference filtering

-- ============================================================================
-- STEP 1: Disable old notification triggers (they create notifications for ALL users)
-- ============================================================================

-- Drop the old triggers that create notifications directly
DROP TRIGGER IF EXISTS trigger_notify_patch ON patch_notes;
DROP TRIGGER IF EXISTS trigger_notify_news ON news_items;

-- Keep the functions but we won't use them directly anymore
-- DROP FUNCTION IF EXISTS notify_followers_of_patch();
-- DROP FUNCTION IF EXISTS notify_followers_of_news();

-- ============================================================================
-- STEP 2: Create new triggers that queue smart notifications
-- ============================================================================

-- Function to queue smart notification for new patches
CREATE OR REPLACE FUNCTION queue_smart_notification_for_patch()
RETURNS TRIGGER AS $$
BEGIN
  -- Only queue if the patch has a game_id
  IF NEW.game_id IS NOT NULL THEN
    INSERT INTO ai_processing_queue (
      task_type,
      entity_type,
      entity_id,
      priority,
      payload
    ) VALUES (
      'smart_notification',
      'patch',
      NEW.id,
      CASE
        WHEN NEW.impact_score >= 8 THEN 8
        WHEN NEW.impact_score >= 6 THEN 6
        ELSE 5
      END,
      jsonb_build_object(
        'game_id', NEW.game_id,
        'title', COALESCE(NEW.title, 'New Patch'),
        'impact_score', COALESCE(NEW.impact_score, 5),
        'version', NEW.version
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to queue smart notification for news
CREATE OR REPLACE FUNCTION queue_smart_notification_for_news()
RETURNS TRIGGER AS $$
DECLARE
  v_topics TEXT[];
BEGIN
  -- Only queue if the news has a game_id
  IF NEW.game_id IS NOT NULL THEN
    -- Extract topics array
    v_topics := COALESCE(NEW.topics, ARRAY[]::TEXT[]);

    INSERT INTO ai_processing_queue (
      task_type,
      entity_type,
      entity_id,
      priority,
      payload
    ) VALUES (
      'smart_notification',
      'news',
      NEW.id,
      CASE
        WHEN 'Launch' = ANY(v_topics) THEN 8
        WHEN 'DLC' = ANY(v_topics) OR 'Delay' = ANY(v_topics) THEN 7
        WHEN NEW.is_rumor THEN 4
        ELSE 5
      END,
      jsonb_build_object(
        'game_id', NEW.game_id,
        'title', COALESCE(NEW.title, 'Gaming News'),
        'is_rumor', COALESCE(NEW.is_rumor, false),
        'topics', to_jsonb(v_topics)
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the new triggers
CREATE TRIGGER trigger_queue_smart_notification_patch
  AFTER INSERT ON patch_notes
  FOR EACH ROW
  EXECUTE FUNCTION queue_smart_notification_for_patch();

CREATE TRIGGER trigger_queue_smart_notification_news
  AFTER INSERT ON news_items
  FOR EACH ROW
  EXECUTE FUNCTION queue_smart_notification_for_news();

-- ============================================================================
-- STEP 3: Grant permissions
-- ============================================================================

-- Ensure service role can manage the queue
GRANT ALL ON ai_processing_queue TO service_role;
