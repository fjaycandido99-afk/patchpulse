-- ============================================================================
-- FIX ALL AUTH.UID() WARNINGS
-- Comprehensive cleanup of all tables with auth.uid() issues
-- ============================================================================

-- Helper: Drop ALL policies on a table
CREATE OR REPLACE FUNCTION drop_all_policies(p_table TEXT)
RETURNS void AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = p_table AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, p_table);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Drop all policies and recreate with optimized (SELECT auth.uid())
-- ============================================================================

-- connected_accounts
DO $$ BEGIN
  PERFORM drop_all_policies('connected_accounts');
  CREATE POLICY "select_own" ON connected_accounts FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "insert_own" ON connected_accounts FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "update_own" ON connected_accounts FOR UPDATE USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "delete_own" ON connected_accounts FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- user_library_games
DO $$ BEGIN
  PERFORM drop_all_policies('user_library_games');
  CREATE POLICY "select_own" ON user_library_games FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "insert_own" ON user_library_games FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "update_own" ON user_library_games FOR UPDATE USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "delete_own" ON user_library_games FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- profiles (uses id, not user_id)
DO $$ BEGIN
  PERFORM drop_all_policies('profiles');
  CREATE POLICY "select_own" ON profiles FOR SELECT USING (id = (SELECT auth.uid()));
  CREATE POLICY "update_own" ON profiles FOR UPDATE USING (id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- user_games
DO $$ BEGIN
  PERFORM drop_all_policies('user_games');
  CREATE POLICY "select_own" ON user_games FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "insert_own" ON user_games FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "update_own" ON user_games FOR UPDATE USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "delete_own" ON user_games FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- backlog_items
DO $$ BEGIN
  PERFORM drop_all_policies('backlog_items');
  CREATE POLICY "select_own" ON backlog_items FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "insert_own" ON backlog_items FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "update_own" ON backlog_items FOR UPDATE USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "delete_own" ON backlog_items FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- user_events
DO $$ BEGIN
  PERFORM drop_all_policies('user_events');
  CREATE POLICY "select_own" ON user_events FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "insert_own" ON user_events FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- user_news_digest
DO $$ BEGIN
  PERFORM drop_all_policies('user_news_digest');
  CREATE POLICY "select_own" ON user_news_digest FOR SELECT USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- smart_notification_prefs
DO $$ BEGIN
  PERFORM drop_all_policies('smart_notification_prefs');
  CREATE POLICY "select_own" ON smart_notification_prefs FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "insert_own" ON smart_notification_prefs FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "update_own" ON smart_notification_prefs FOR UPDATE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- user_profiles (uses id, not user_id)
DO $$ BEGIN
  PERFORM drop_all_policies('user_profiles');
  CREATE POLICY "select_own" ON user_profiles FOR SELECT USING (id = (SELECT auth.uid()));
  CREATE POLICY "update_own" ON user_profiles FOR UPDATE USING (id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- priority_alert_rules
DO $$ BEGIN
  PERFORM drop_all_policies('priority_alert_rules');
  CREATE POLICY "select_own" ON priority_alert_rules FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "insert_own" ON priority_alert_rules FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "update_own" ON priority_alert_rules FOR UPDATE USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "delete_own" ON priority_alert_rules FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- bookmarks
DO $$ BEGIN
  PERFORM drop_all_policies('bookmarks');
  CREATE POLICY "select_own" ON bookmarks FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "insert_own" ON bookmarks FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "delete_own" ON bookmarks FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- subscription_events
DO $$ BEGIN
  PERFORM drop_all_policies('subscription_events');
  CREATE POLICY "select_own" ON subscription_events FOR SELECT USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- notifications
DO $$ BEGIN
  PERFORM drop_all_policies('notifications');
  CREATE POLICY "select_own" ON notifications FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "update_own" ON notifications FOR UPDATE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- user_subscriptions
DO $$ BEGIN
  PERFORM drop_all_policies('user_subscriptions');
  CREATE POLICY "select_own" ON user_subscriptions FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "insert_own" ON user_subscriptions FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "update_own" ON user_subscriptions FOR UPDATE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- whats_new_cache
DO $$ BEGIN
  PERFORM drop_all_policies('whats_new_cache');
  CREATE POLICY "select_own" ON whats_new_cache FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "insert_own" ON whats_new_cache FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "update_own" ON whats_new_cache FOR UPDATE USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "delete_own" ON whats_new_cache FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- return_suggestions
DO $$ BEGIN
  PERFORM drop_all_policies('return_suggestions');
  CREATE POLICY "select_own" ON return_suggestions FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "update_own" ON return_suggestions FOR UPDATE USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "delete_own" ON return_suggestions FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- webauthn_credentials
DO $$ BEGIN
  PERFORM drop_all_policies('webauthn_credentials');
  CREATE POLICY "select_own" ON webauthn_credentials FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "insert_own" ON webauthn_credentials FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "update_own" ON webauthn_credentials FOR UPDATE USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "delete_own" ON webauthn_credentials FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- webauthn_challenges
DO $$ BEGIN
  PERFORM drop_all_policies('webauthn_challenges');
  CREATE POLICY "select_own" ON webauthn_challenges FOR SELECT
    USING ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()));
  CREATE POLICY "insert_own" ON webauthn_challenges FOR INSERT
    WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()));
  CREATE POLICY "delete_own" ON webauthn_challenges FOR DELETE
    USING ((SELECT auth.uid()) IS NOT NULL AND user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- sync_jobs
DO $$ BEGIN
  PERFORM drop_all_policies('sync_jobs');
  CREATE POLICY "select_own" ON sync_jobs FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "insert_own" ON sync_jobs FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- device_tokens
DO $$ BEGIN
  PERFORM drop_all_policies('device_tokens');
  CREATE POLICY "select_own" ON device_tokens FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "insert_own" ON device_tokens FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "delete_own" ON device_tokens FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- push_subscriptions
DO $$ BEGIN
  PERFORM drop_all_policies('push_subscriptions');
  CREATE POLICY "all_own" ON push_subscriptions FOR ALL USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- game_requests
DO $$ BEGIN
  PERFORM drop_all_policies('game_requests');
  CREATE POLICY "select_own" ON game_requests FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "insert_own" ON game_requests FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- game_reminders
DO $$ BEGIN
  PERFORM drop_all_policies('game_reminders');
  CREATE POLICY "select_own" ON game_reminders FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "insert_own" ON game_reminders FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
  CREATE POLICY "update_own" ON game_reminders FOR UPDATE USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "delete_own" ON game_reminders FOR DELETE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- play_recommendations
DO $$ BEGIN
  PERFORM drop_all_policies('play_recommendations');
  CREATE POLICY "select_own" ON play_recommendations FOR SELECT USING (user_id = (SELECT auth.uid()));
  CREATE POLICY "update_own" ON play_recommendations FOR UPDATE USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- game_discovery_attempts
DO $$ BEGIN
  PERFORM drop_all_policies('game_discovery_attempts');
  CREATE POLICY "select_own" ON game_discovery_attempts FOR SELECT USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- game_discovery_queue
DO $$ BEGIN
  PERFORM drop_all_policies('game_discovery_queue');
  CREATE POLICY "select_own" ON game_discovery_queue FOR SELECT USING (requested_by = (SELECT auth.uid()));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Cleanup helper function
DROP FUNCTION IF EXISTS drop_all_policies(TEXT);

-- ============================================================================
-- Done
-- ============================================================================
SELECT 'Fixed all auth.uid() policies' AS message;
