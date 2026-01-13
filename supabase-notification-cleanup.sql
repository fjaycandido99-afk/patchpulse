-- Weekly Notification Cleanup
-- Run this in Supabase SQL Editor to set up automatic cleanup

-- 1. Create the cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete notifications older than 7 days
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '7 days';

  -- Log the cleanup (optional - check in pg_stat_user_tables)
  RAISE NOTICE 'Cleaned up notifications older than 7 days at %', NOW();
END;
$$;

-- 2. Enable pg_cron extension (if not already enabled)
-- Go to Database > Extensions in Supabase dashboard and enable pg_cron

-- 3. Schedule the cleanup to run weekly (every Sunday at 3 AM UTC)
-- Note: You need to run this after enabling pg_cron extension
SELECT cron.schedule(
  'weekly-notification-cleanup',  -- job name
  '0 3 * * 0',                    -- cron expression: every Sunday at 3 AM
  $$SELECT cleanup_old_notifications()$$
);

-- To check scheduled jobs:
-- SELECT * FROM cron.job;

-- To remove the scheduled job if needed:
-- SELECT cron.unschedule('weekly-notification-cleanup');

-- To manually run cleanup now:
-- SELECT cleanup_old_notifications();
