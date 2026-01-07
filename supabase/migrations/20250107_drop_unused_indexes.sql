-- ============================================================================
-- DROP UNUSED INDEXES
-- These indexes have never been used according to pg_stat_user_indexes
-- ============================================================================

-- Find and drop unused indexes (idx_scan = 0)
DO $$
DECLARE
  idx RECORD;
BEGIN
  FOR idx IN
    SELECT
      schemaname,
      indexrelname as indexname,
      relname as tablename
    FROM pg_stat_user_indexes
    WHERE idx_scan = 0
    AND schemaname = 'public'
    AND indexrelname NOT LIKE '%_pkey'  -- Don't drop primary keys
    AND indexrelname NOT LIKE '%_key'   -- Don't drop unique constraints
    AND relname IN (
      'whats_new_cache', 'ai_jobs', 'patch_images', 'news_images',
      'image_generation_queue', 'game_discovery_attempts', 'games',
      'webauthn_credentials'
    )
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS %I.%I', idx.schemaname, idx.indexname);
    RAISE NOTICE 'Dropped unused index: %', idx.indexname;
  END LOOP;
END $$;

-- ============================================================================
-- Done
-- ============================================================================
SELECT 'Unused indexes dropped' AS message;
