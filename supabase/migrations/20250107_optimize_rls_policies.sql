-- ============================================================================
-- OPTIMIZE RLS POLICIES FOR BETTER PERFORMANCE
-- Wraps auth.uid() in subquery so Postgres can cache the result
-- Uses exception handling to skip tables that don't exist
-- ============================================================================

-- ============================================================================
-- CONNECTED_ACCOUNTS
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own connected accounts" ON public.connected_accounts;
  DROP POLICY IF EXISTS "Users can view own connected accounts" ON public.connected_accounts;
  DROP POLICY IF EXISTS "Users can insert their own connected accounts" ON public.connected_accounts;
  DROP POLICY IF EXISTS "Users can insert own connected accounts" ON public.connected_accounts;
  DROP POLICY IF EXISTS "Users can update their own connected accounts" ON public.connected_accounts;
  DROP POLICY IF EXISTS "Users can update own connected accounts" ON public.connected_accounts;
  DROP POLICY IF EXISTS "Users can delete their own connected accounts" ON public.connected_accounts;
  DROP POLICY IF EXISTS "Users can delete own connected accounts" ON public.connected_accounts;

  CREATE POLICY "Users can view own connected accounts"
    ON public.connected_accounts FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can insert own connected accounts"
    ON public.connected_accounts FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can update own connected accounts"
    ON public.connected_accounts FOR UPDATE USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can delete own connected accounts"
    ON public.connected_accounts FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skipping connected_accounts - table does not exist';
END $$;

-- ============================================================================
-- USER_LIBRARY_GAMES
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own library" ON public.user_library_games;
  DROP POLICY IF EXISTS "Users can view own library" ON public.user_library_games;
  DROP POLICY IF EXISTS "Users can insert their own library" ON public.user_library_games;
  DROP POLICY IF EXISTS "Users can insert own library" ON public.user_library_games;
  DROP POLICY IF EXISTS "Users can update their own library" ON public.user_library_games;
  DROP POLICY IF EXISTS "Users can update own library" ON public.user_library_games;
  DROP POLICY IF EXISTS "Users can delete their own library" ON public.user_library_games;
  DROP POLICY IF EXISTS "Users can delete own library" ON public.user_library_games;

  CREATE POLICY "Users can view own library"
    ON public.user_library_games FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can insert own library"
    ON public.user_library_games FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can update own library"
    ON public.user_library_games FOR UPDATE USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can delete own library"
    ON public.user_library_games FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skipping user_library_games - table does not exist';
END $$;

-- ============================================================================
-- WHATS_NEW_CACHE
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own cache" ON public.whats_new_cache;
  DROP POLICY IF EXISTS "Users can view own cache" ON public.whats_new_cache;
  DROP POLICY IF EXISTS "Users can insert their own cache" ON public.whats_new_cache;
  DROP POLICY IF EXISTS "Users can insert own cache" ON public.whats_new_cache;
  DROP POLICY IF EXISTS "Users can update their own cache" ON public.whats_new_cache;
  DROP POLICY IF EXISTS "Users can update own cache" ON public.whats_new_cache;
  DROP POLICY IF EXISTS "Users can delete their own cache" ON public.whats_new_cache;
  DROP POLICY IF EXISTS "Users can delete own cache" ON public.whats_new_cache;
  DROP POLICY IF EXISTS "Users can manage their own cache" ON public.whats_new_cache;

  CREATE POLICY "Users can view own cache"
    ON public.whats_new_cache FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can insert own cache"
    ON public.whats_new_cache FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can update own cache"
    ON public.whats_new_cache FOR UPDATE USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can delete own cache"
    ON public.whats_new_cache FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skipping whats_new_cache - table does not exist';
END $$;

-- ============================================================================
-- RETURN_SUGGESTIONS
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own return suggestions" ON public.return_suggestions;
  DROP POLICY IF EXISTS "Users can view own return suggestions" ON public.return_suggestions;
  DROP POLICY IF EXISTS "Users can update their own return suggestions" ON public.return_suggestions;
  DROP POLICY IF EXISTS "Users can update own return suggestions" ON public.return_suggestions;
  DROP POLICY IF EXISTS "Users can delete their own return suggestions" ON public.return_suggestions;
  DROP POLICY IF EXISTS "Users can delete own return suggestions" ON public.return_suggestions;
  DROP POLICY IF EXISTS "Users can manage their own return suggestions" ON public.return_suggestions;

  CREATE POLICY "Users can view own return suggestions"
    ON public.return_suggestions FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can update own return suggestions"
    ON public.return_suggestions FOR UPDATE USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can delete own return suggestions"
    ON public.return_suggestions FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skipping return_suggestions - table does not exist';
END $$;

-- ============================================================================
-- WEBAUTHN_CREDENTIALS
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own credentials" ON public.webauthn_credentials;
  DROP POLICY IF EXISTS "Users can insert own credentials" ON public.webauthn_credentials;
  DROP POLICY IF EXISTS "Users can update own credentials" ON public.webauthn_credentials;
  DROP POLICY IF EXISTS "Users can delete own credentials" ON public.webauthn_credentials;

  CREATE POLICY "Users can view own credentials"
    ON public.webauthn_credentials FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can insert own credentials"
    ON public.webauthn_credentials FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can update own credentials"
    ON public.webauthn_credentials FOR UPDATE USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can delete own credentials"
    ON public.webauthn_credentials FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skipping webauthn_credentials - table does not exist';
END $$;

-- ============================================================================
-- WEBAUTHN_CHALLENGES
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own registration challenges" ON public.webauthn_challenges;
  DROP POLICY IF EXISTS "Users can insert own registration challenges" ON public.webauthn_challenges;
  DROP POLICY IF EXISTS "Users can delete own challenges" ON public.webauthn_challenges;

  CREATE POLICY "Users can view own registration challenges"
    ON public.webauthn_challenges FOR SELECT
    USING ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()) AND type = 'registration');
  CREATE POLICY "Users can insert own registration challenges"
    ON public.webauthn_challenges FOR INSERT
    WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()) AND type = 'registration');
  CREATE POLICY "Users can delete own challenges"
    ON public.webauthn_challenges FOR DELETE
    USING ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skipping webauthn_challenges - table does not exist';
END $$;

-- ============================================================================
-- USER_SUBSCRIPTIONS
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
  DROP POLICY IF EXISTS "Users can insert own subscription" ON public.user_subscriptions;
  DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;

  CREATE POLICY "Users can view own subscription"
    ON public.user_subscriptions FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can insert own subscription"
    ON public.user_subscriptions FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can update own subscription"
    ON public.user_subscriptions FOR UPDATE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skipping user_subscriptions - table does not exist';
END $$;

-- ============================================================================
-- BOOKMARKS
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;
  DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.bookmarks;
  DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;

  CREATE POLICY "Users can view own bookmarks"
    ON public.bookmarks FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can insert own bookmarks"
    ON public.bookmarks FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can delete own bookmarks"
    ON public.bookmarks FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skipping bookmarks - table does not exist';
END $$;

-- ============================================================================
-- BACKLOG_ITEMS
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own backlog" ON public.backlog_items;
  DROP POLICY IF EXISTS "Users can insert own backlog items" ON public.backlog_items;
  DROP POLICY IF EXISTS "Users can update own backlog items" ON public.backlog_items;
  DROP POLICY IF EXISTS "Users can delete own backlog items" ON public.backlog_items;

  CREATE POLICY "Users can view own backlog"
    ON public.backlog_items FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can insert own backlog items"
    ON public.backlog_items FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can update own backlog items"
    ON public.backlog_items FOR UPDATE USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can delete own backlog items"
    ON public.backlog_items FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skipping backlog_items - table does not exist';
END $$;

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
  DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

  CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skipping notifications - table does not exist';
END $$;

-- ============================================================================
-- USER_GAMES
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own followed games" ON public.user_games;
  DROP POLICY IF EXISTS "Users can view own games" ON public.user_games;
  DROP POLICY IF EXISTS "Users can insert own followed games" ON public.user_games;
  DROP POLICY IF EXISTS "Users can delete own followed games" ON public.user_games;
  DROP POLICY IF EXISTS "Users can manage own games" ON public.user_games;

  CREATE POLICY "Users can view own games"
    ON public.user_games FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can insert own games"
    ON public.user_games FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can delete own games"
    ON public.user_games FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skipping user_games - table does not exist';
END $$;

-- ============================================================================
-- PROFILES
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

  CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT USING (id = (SELECT auth.uid()));
  CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skipping profiles - table does not exist';
END $$;

-- ============================================================================
-- SYNC_JOBS
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own sync jobs" ON public.sync_jobs;
  DROP POLICY IF EXISTS "Users can view own sync jobs" ON public.sync_jobs;
  DROP POLICY IF EXISTS "Users can insert their own sync jobs" ON public.sync_jobs;
  DROP POLICY IF EXISTS "Users can insert own sync jobs" ON public.sync_jobs;

  CREATE POLICY "Users can view own sync jobs"
    ON public.sync_jobs FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can insert own sync jobs"
    ON public.sync_jobs FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skipping sync_jobs - table does not exist';
END $$;

-- ============================================================================
-- DEVICE_TOKENS
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own device tokens" ON public.device_tokens;
  DROP POLICY IF EXISTS "Users can insert own device tokens" ON public.device_tokens;
  DROP POLICY IF EXISTS "Users can delete own device tokens" ON public.device_tokens;

  CREATE POLICY "Users can view own device tokens"
    ON public.device_tokens FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can insert own device tokens"
    ON public.device_tokens FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can delete own device tokens"
    ON public.device_tokens FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skipping device_tokens - table does not exist';
END $$;

-- ============================================================================
-- PUSH_SUBSCRIPTIONS
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON public.push_subscriptions;

  CREATE POLICY "Users can manage own push subscriptions"
    ON public.push_subscriptions FOR ALL USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skipping push_subscriptions - table does not exist';
END $$;

-- ============================================================================
-- USER_PROFILES
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

  CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT USING (id = (SELECT auth.uid()));
  CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE USING (id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skipping user_profiles - table does not exist';
END $$;

-- ============================================================================
-- GAME_REQUESTS
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own game requests" ON public.game_requests;
  DROP POLICY IF EXISTS "Users can view own requests" ON public.game_requests;
  DROP POLICY IF EXISTS "Users can insert own game requests" ON public.game_requests;
  DROP POLICY IF EXISTS "Users can create requests" ON public.game_requests;

  CREATE POLICY "Users can view own game requests"
    ON public.game_requests FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can insert own game requests"
    ON public.game_requests FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skipping game_requests - table does not exist';
END $$;

-- ============================================================================
-- GAME_REMINDERS
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own game reminders" ON public.game_reminders;
  DROP POLICY IF EXISTS "Users can insert own game reminders" ON public.game_reminders;
  DROP POLICY IF EXISTS "Users can update own game reminders" ON public.game_reminders;
  DROP POLICY IF EXISTS "Users can delete own game reminders" ON public.game_reminders;

  CREATE POLICY "Users can view own game reminders"
    ON public.game_reminders FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can insert own game reminders"
    ON public.game_reminders FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can update own game reminders"
    ON public.game_reminders FOR UPDATE USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "Users can delete own game reminders"
    ON public.game_reminders FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skipping game_reminders - table does not exist';
END $$;

-- ============================================================================
-- GAME_DISCOVERY_QUEUE (uses requested_by, not user_id)
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own discovery requests" ON public.game_discovery_queue;

  CREATE POLICY "Users can view own discovery requests"
    ON public.game_discovery_queue FOR SELECT USING (requested_by = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skipping game_discovery_queue - table does not exist';
END $$;

-- ============================================================================
-- GAME_DISCOVERY_ATTEMPTS
-- ============================================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own attempts" ON public.game_discovery_attempts;

  CREATE POLICY "Users can view own attempts"
    ON public.game_discovery_attempts FOR SELECT USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skipping game_discovery_attempts - table does not exist';
END $$;

-- ============================================================================
-- Done
-- ============================================================================
SELECT 'RLS policies optimized for better performance' AS message;
