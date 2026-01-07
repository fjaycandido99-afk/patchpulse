-- ============================================================================
-- SECURITY FIXES PART 5
-- Fix RLS Policy Always True warnings by making policies role-specific
-- ============================================================================

-- ============================================================================
-- GAME_DISCOVERY_ATTEMPTS - Service role only for management
-- ============================================================================
DO $$ BEGIN
  -- Drop overly permissive policies
  DROP POLICY IF EXISTS "Service role manages discovery attempts" ON game_discovery_attempts;
  DROP POLICY IF EXISTS "Anyone can view discovery attempts" ON game_discovery_attempts;
  DROP POLICY IF EXISTS "Admins can manage discovery attempts" ON game_discovery_attempts;

  -- Create properly scoped policies
  CREATE POLICY "Service role manages discovery attempts"
    ON game_discovery_attempts FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- GAME_DISCOVERY_QUEUE - Service role only for management
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role manages discovery queue" ON game_discovery_queue;
  DROP POLICY IF EXISTS "Anyone can view discovery queue" ON game_discovery_queue;
  DROP POLICY IF EXISTS "Admins can view all discovery requests" ON game_discovery_queue;
  DROP POLICY IF EXISTS "Admins can manage discovery queue" ON game_discovery_queue;

  CREATE POLICY "Service role manages discovery queue"
    ON game_discovery_queue FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- GAME_SENTIMENT - Public read, service role write
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can read game sentiment" ON game_sentiment;
  DROP POLICY IF EXISTS "Service role manages sentiment" ON game_sentiment;

  -- Authenticated users can read (not full public)
  CREATE POLICY "Authenticated can read game sentiment"
    ON game_sentiment FOR SELECT
    TO authenticated
    USING (true);

  -- Service role can manage
  CREATE POLICY "Service role manages sentiment"
    ON game_sentiment FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- GAME_SIMILARITIES - Public read, service role write
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can read game similarities" ON game_similarities;
  DROP POLICY IF EXISTS "Service role manages similarities" ON game_similarities;

  CREATE POLICY "Authenticated can read game similarities"
    ON game_similarities FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Service role manages similarities"
    ON game_similarities FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- NEWS_SUMMARIES - Public read, service role write
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can read news summaries" ON news_summaries;
  DROP POLICY IF EXISTS "Service role creates news summaries" ON news_summaries;

  CREATE POLICY "Authenticated can read news summaries"
    ON news_summaries FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Service role manages news summaries"
    ON news_summaries FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- PATCH_SUMMARIES - Public read, service role write
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can read patch summaries" ON patch_summaries;
  DROP POLICY IF EXISTS "Service role creates summaries" ON patch_summaries;

  CREATE POLICY "Authenticated can read patch summaries"
    ON patch_summaries FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Service role manages patch summaries"
    ON patch_summaries FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- PLAY_RECOMMENDATIONS - User owns their data, service role creates
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can read own recommendations" ON play_recommendations;
  DROP POLICY IF EXISTS "Users can update own recommendations" ON play_recommendations;
  DROP POLICY IF EXISTS "Service role creates recommendations" ON play_recommendations;

  -- Users can only see their own recommendations
  CREATE POLICY "Users can read own recommendations"
    ON play_recommendations FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));

  CREATE POLICY "Users can update own recommendations"
    ON play_recommendations FOR UPDATE
    TO authenticated
    USING (user_id = (SELECT auth.uid()));

  CREATE POLICY "Service role manages recommendations"
    ON play_recommendations FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- RELEASE_DISCOVERY_QUEUE - Service role only
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role manages release queue" ON release_discovery_queue;
  DROP POLICY IF EXISTS "Anyone can view release queue" ON release_discovery_queue;

  CREATE POLICY "Service role manages release queue"
    ON release_discovery_queue FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- AI_PROCESSING_QUEUE - Service role only
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role manages AI queue" ON ai_processing_queue;

  CREATE POLICY "Service role manages AI queue"
    ON ai_processing_queue FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- Done
-- ============================================================================
SELECT 'Security fixes part 5 applied - RLS policies now role-specific' AS message;
