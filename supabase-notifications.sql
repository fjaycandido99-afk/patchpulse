-- Notifications System for PatchPulse
-- Run this in Supabase SQL Editor

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification type
  type TEXT NOT NULL CHECK (type IN (
    'new_patch',      -- New patch for followed game
    'new_news',       -- New news for followed game
    'game_release',   -- Upcoming game releasing soon
    'ai_digest',      -- AI-generated daily/weekly digest
    'price_drop',     -- Game price dropped (future)
    'system'          -- System announcements
  )),

  -- Content
  title TEXT NOT NULL,
  body TEXT,

  -- AI-generated priority (1-5, 5 = most important)
  priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),

  -- Related entities
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  patch_id UUID REFERENCES patch_notes(id) ON DELETE SET NULL,
  news_id UUID REFERENCES news_items(id) ON DELETE SET NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Index for faster queries
  CONSTRAINT valid_reference CHECK (
    game_id IS NOT NULL OR patch_id IS NOT NULL OR news_id IS NOT NULL OR type IN ('ai_digest', 'system')
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, is_read, created_at DESC)
  WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_game
  ON notifications(game_id)
  WHERE game_id IS NOT NULL;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all notifications"
  ON notifications FOR ALL
  TO service_role
  USING (true);

-- Function to create notifications for new patches
CREATE OR REPLACE FUNCTION notify_followers_of_patch()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for each user following this game
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notifications for new news
CREATE OR REPLACE FUNCTION notify_followers_of_news()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify for non-rumor news by default, or high-impact rumors
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers (drop if exists first)
DROP TRIGGER IF EXISTS trigger_notify_patch ON patch_notes;
CREATE TRIGGER trigger_notify_patch
  AFTER INSERT ON patch_notes
  FOR EACH ROW
  EXECUTE FUNCTION notify_followers_of_patch();

DROP TRIGGER IF EXISTS trigger_notify_news ON news_items;
CREATE TRIGGER trigger_notify_news
  AFTER INSERT ON news_items
  FOR EACH ROW
  WHEN (NEW.game_id IS NOT NULL)
  EXECUTE FUNCTION notify_followers_of_news();

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(notification_ids UUID[])
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET is_read = true, read_at = now()
  WHERE id = ANY(notification_ids)
    AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET is_read = true, read_at = now()
  WHERE user_id = auth.uid()
    AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get notification stats
CREATE OR REPLACE FUNCTION get_notification_stats()
RETURNS TABLE (
  unread_count BIGINT,
  high_priority_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE is_read = false),
    COUNT(*) FILTER (WHERE is_read = false AND priority >= 4)
  FROM notifications
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION mark_notifications_read(UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read() TO authenticated;
GRANT EXECUTE ON FUNCTION get_notification_stats() TO authenticated;

-- ============================================
-- PUSH NOTIFICATIONS
-- ============================================

-- Push subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user
  ON push_subscriptions(user_id);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own push subscriptions"
  ON push_subscriptions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all push subscriptions"
  ON push_subscriptions FOR ALL
  TO service_role
  USING (true);

-- Enable Realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================
-- WEBHOOK FOR PUSH NOTIFICATIONS
-- ============================================
-- Note: This requires setting up a database webhook in Supabase Dashboard
-- Go to Database > Webhooks > Create new webhook
--
-- Webhook settings:
-- - Name: send_push_notification
-- - Table: notifications
-- - Events: INSERT
-- - Type: Postgres
-- - URL: https://your-domain.com/api/push/send
-- - HTTP Headers: { "Authorization": "Bearer YOUR_INTERNAL_API_SECRET" }
-- - Payload:
--   {
--     "userId": "{{user_id}}",
--     "payload": {
--       "title": "{{title}}",
--       "body": "{{body}}",
--       "url": "/notifications",
--       "priority": {{priority}},
--       "notificationId": "{{id}}",
--       "type": "{{type}}"
--     }
--   }
