-- ============================================================================
-- SECURITY FIXES FINAL
-- Remove USING(true) policies - service_role bypasses RLS automatically
-- ============================================================================

-- ============================================================================
-- SERVICE-ROLE-ONLY TABLES: Remove all policies (service_role bypasses RLS)
-- ============================================================================

-- game_discovery_attempts - remove service role policy (it bypasses RLS anyway)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role manages discovery attempts" ON game_discovery_attempts;
  DROP POLICY IF EXISTS "Anyone can view discovery attempts" ON game_discovery_attempts;
  DROP POLICY IF EXISTS "Admins can manage discovery attempts" ON game_discovery_attempts;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- game_discovery_queue - remove service role policy
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role manages discovery queue" ON game_discovery_queue;
  DROP POLICY IF EXISTS "Anyone can view discovery queue" ON game_discovery_queue;
  DROP POLICY IF EXISTS "Admins can view all discovery requests" ON game_discovery_queue;
  DROP POLICY IF EXISTS "Admins can manage discovery queue" ON game_discovery_queue;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- release_discovery_queue - remove service role policy
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role manages release queue" ON release_discovery_queue;
  DROP POLICY IF EXISTS "Anyone can view release queue" ON release_discovery_queue;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- seasonal_discovery_queue - remove service role policy
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role manages seasonal queue" ON seasonal_discovery_queue;
  DROP POLICY IF EXISTS "Anyone can view seasonal queue" ON seasonal_discovery_queue;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ai_processing_queue - remove service role policy
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role manages AI queue" ON ai_processing_queue;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- return_suggestions - remove service role policy
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role manages return suggestions" ON return_suggestions;
  DROP POLICY IF EXISTS "Anyone can view return suggestions" ON return_suggestions;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- game_sentiment - remove service role policy (part 5 already added authenticated)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role manages sentiment" ON game_sentiment;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- game_similarities - remove service role policy (part 5 already added authenticated)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role manages similarities" ON game_similarities;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- news_summaries - remove service role policy (part 5 already added authenticated)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role manages news summaries" ON news_summaries;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- patch_summaries - remove service role policy (part 5 already added authenticated)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role manages patch summaries" ON patch_summaries;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- play_recommendations - remove service role policy (part 5 already added user-specific)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role manages recommendations" ON play_recommendations;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- SEASONAL_EVENTS - Public read data
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view seasonal events" ON seasonal_events;
  DROP POLICY IF EXISTS "Service role manages seasonal events" ON seasonal_events;
  DROP POLICY IF EXISTS "Public can view active seasonal events" ON seasonal_events;

  -- Authenticated users can read approved events
  CREATE POLICY "Authenticated can view seasonal events"
    ON seasonal_events FOR SELECT
    TO authenticated
    USING (is_auto_approved = true OR is_admin_approved = true);

  -- Anon can also read approved events
  CREATE POLICY "Anon can view seasonal events"
    ON seasonal_events FOR SELECT
    TO anon
    USING (is_auto_approved = true OR is_admin_approved = true);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- SUBSCRIPTION_EVENTS - User's own events only
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role manages subscription events" ON subscription_events;
  DROP POLICY IF EXISTS "Users can view own subscription events" ON subscription_events;
  DROP POLICY IF EXISTS "Anyone can view subscription events" ON subscription_events;

  -- Users can only see their own events
  CREATE POLICY "Users can view own subscription events"
    ON subscription_events FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- UPCOMING_RELEASES - Public read data
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view upcoming releases" ON upcoming_releases;
  DROP POLICY IF EXISTS "Service role manages upcoming releases" ON upcoming_releases;
  DROP POLICY IF EXISTS "Public can view upcoming releases" ON upcoming_releases;

  -- Authenticated users can read
  CREATE POLICY "Authenticated can view upcoming releases"
    ON upcoming_releases FOR SELECT
    TO authenticated
    USING (true);

  -- Anon can also read
  CREATE POLICY "Anon can view upcoming releases"
    ON upcoming_releases FOR SELECT
    TO anon
    USING (true);
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- Done
-- ============================================================================
SELECT 'Final security fixes applied - removed USING(true) policies' AS message;
