-- ============================================================================
-- CLEANUP DUPLICATE POLICIES
-- Drops ALL policies and recreates with optimized auth.uid() pattern
-- ============================================================================

-- ============================================================================
-- BACKLOG_ITEMS - Clean up duplicates
-- ============================================================================
DO $$ BEGIN
  -- Drop all existing policies
  DROP POLICY IF EXISTS "Users can view own backlog" ON backlog_items;
  DROP POLICY IF EXISTS "Users can insert own backlog items" ON backlog_items;
  DROP POLICY IF EXISTS "Users can update own backlog items" ON backlog_items;
  DROP POLICY IF EXISTS "Users can delete own backlog items" ON backlog_items;
  DROP POLICY IF EXISTS "Users can view their own backlog" ON backlog_items;
  DROP POLICY IF EXISTS "Users can insert their own backlog" ON backlog_items;
  DROP POLICY IF EXISTS "Users can update their own backlog" ON backlog_items;
  DROP POLICY IF EXISTS "Users can delete their own backlog" ON backlog_items;
  DROP POLICY IF EXISTS "Service role full access to backlog" ON backlog_items;

  -- Recreate with optimized pattern
  CREATE POLICY "Users can view own backlog" ON backlog_items
    FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can insert own backlog" ON backlog_items
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can update own backlog" ON backlog_items
    FOR UPDATE USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can delete own backlog" ON backlog_items
    FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- CONNECTED_ACCOUNTS
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own connected accounts" ON connected_accounts;
  DROP POLICY IF EXISTS "Users can insert own connected accounts" ON connected_accounts;
  DROP POLICY IF EXISTS "Users can update own connected accounts" ON connected_accounts;
  DROP POLICY IF EXISTS "Users can delete own connected accounts" ON connected_accounts;
  DROP POLICY IF EXISTS "Users can view their own connected accounts" ON connected_accounts;
  DROP POLICY IF EXISTS "Users can insert their own connected accounts" ON connected_accounts;
  DROP POLICY IF EXISTS "Users can update their own connected accounts" ON connected_accounts;
  DROP POLICY IF EXISTS "Users can delete their own connected accounts" ON connected_accounts;

  CREATE POLICY "Users can view own connected accounts" ON connected_accounts
    FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can insert own connected accounts" ON connected_accounts
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can update own connected accounts" ON connected_accounts
    FOR UPDATE USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can delete own connected accounts" ON connected_accounts
    FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- USER_LIBRARY_GAMES
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own library" ON user_library_games;
  DROP POLICY IF EXISTS "Users can insert own library" ON user_library_games;
  DROP POLICY IF EXISTS "Users can update own library" ON user_library_games;
  DROP POLICY IF EXISTS "Users can delete own library" ON user_library_games;
  DROP POLICY IF EXISTS "Users can view their own library" ON user_library_games;
  DROP POLICY IF EXISTS "Users can insert their own library" ON user_library_games;
  DROP POLICY IF EXISTS "Users can update their own library" ON user_library_games;
  DROP POLICY IF EXISTS "Users can delete their own library" ON user_library_games;

  CREATE POLICY "Users can view own library" ON user_library_games
    FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can insert own library" ON user_library_games
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can update own library" ON user_library_games
    FOR UPDATE USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can delete own library" ON user_library_games
    FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- PROFILES
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

  CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (id = (SELECT auth.uid()));
  CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- USER_GAMES
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own games" ON user_games;
  DROP POLICY IF EXISTS "Users can insert own games" ON user_games;
  DROP POLICY IF EXISTS "Users can update own games" ON user_games;
  DROP POLICY IF EXISTS "Users can delete own games" ON user_games;
  DROP POLICY IF EXISTS "Users can view own followed games" ON user_games;
  DROP POLICY IF EXISTS "Users can insert own followed games" ON user_games;
  DROP POLICY IF EXISTS "Users can delete own followed games" ON user_games;
  DROP POLICY IF EXISTS "Users can manage own games" ON user_games;

  CREATE POLICY "Users can view own games" ON user_games
    FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can insert own games" ON user_games
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can update own games" ON user_games
    FOR UPDATE USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can delete own games" ON user_games
    FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- BOOKMARKS
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
  DROP POLICY IF EXISTS "Users can insert own bookmarks" ON bookmarks;
  DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;
  DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarks;
  DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON bookmarks;
  DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;

  CREATE POLICY "Users can view own bookmarks" ON bookmarks
    FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can insert own bookmarks" ON bookmarks
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can delete own bookmarks" ON bookmarks
    FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- SUBSCRIPTION_EVENTS
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own subscription events" ON subscription_events;
  DROP POLICY IF EXISTS "Users can view their own subscription events" ON subscription_events;

  CREATE POLICY "Users can view own subscription events" ON subscription_events
    FOR SELECT USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- ============================================================================
-- Done
-- ============================================================================
SELECT 'Cleaned up duplicate policies and recreated with optimized auth.uid()' AS message;
