-- ============================================================================
-- NUCLEAR POLICY RESET
-- Drops ALL user-table policies and recreates from scratch
-- ============================================================================

-- First, drop ALL policies on user-related tables
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN (
      'backlog_items', 'connected_accounts', 'user_library_games', 'profiles',
      'user_games', 'bookmarks', 'subscription_events', 'notifications',
      'user_subscriptions', 'whats_new_cache', 'return_suggestions',
      'webauthn_credentials', 'webauthn_challenges', 'sync_jobs', 'device_tokens',
      'push_subscriptions', 'game_requests', 'game_reminders', 'play_recommendations',
      'game_discovery_attempts', 'game_discovery_queue', 'user_events',
      'user_news_digest', 'smart_notification_prefs', 'user_profiles',
      'priority_alert_rules', 'games'
    )
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    RAISE NOTICE 'Dropped: %.%', pol.tablename, pol.policyname;
  END LOOP;
END $$;

-- ============================================================================
-- Recreate all policies with optimized (SELECT auth.uid())
-- ============================================================================

-- backlog_items
CREATE POLICY "backlog_select" ON backlog_items FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "backlog_insert" ON backlog_items FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "backlog_update" ON backlog_items FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "backlog_delete" ON backlog_items FOR DELETE USING (user_id = (SELECT auth.uid()));

-- connected_accounts
CREATE POLICY "connected_select" ON connected_accounts FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "connected_insert" ON connected_accounts FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "connected_update" ON connected_accounts FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "connected_delete" ON connected_accounts FOR DELETE USING (user_id = (SELECT auth.uid()));

-- user_library_games
CREATE POLICY "library_select" ON user_library_games FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "library_insert" ON user_library_games FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "library_update" ON user_library_games FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "library_delete" ON user_library_games FOR DELETE USING (user_id = (SELECT auth.uid()));

-- profiles (uses id)
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (id = (SELECT auth.uid()));
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (id = (SELECT auth.uid()));

-- user_games
CREATE POLICY "usergames_select" ON user_games FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "usergames_insert" ON user_games FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "usergames_update" ON user_games FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "usergames_delete" ON user_games FOR DELETE USING (user_id = (SELECT auth.uid()));

-- bookmarks
CREATE POLICY "bookmarks_select" ON bookmarks FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "bookmarks_insert" ON bookmarks FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "bookmarks_delete" ON bookmarks FOR DELETE USING (user_id = (SELECT auth.uid()));

-- subscription_events
CREATE POLICY "subevents_select" ON subscription_events FOR SELECT USING (user_id = (SELECT auth.uid()));

-- notifications
CREATE POLICY "notif_select" ON notifications FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "notif_update" ON notifications FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- user_subscriptions
CREATE POLICY "usersub_select" ON user_subscriptions FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "usersub_insert" ON user_subscriptions FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "usersub_update" ON user_subscriptions FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- whats_new_cache
CREATE POLICY "whatsnew_select" ON whats_new_cache FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "whatsnew_insert" ON whats_new_cache FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "whatsnew_update" ON whats_new_cache FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "whatsnew_delete" ON whats_new_cache FOR DELETE USING (user_id = (SELECT auth.uid()));

-- return_suggestions
CREATE POLICY "returns_select" ON return_suggestions FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "returns_update" ON return_suggestions FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "returns_delete" ON return_suggestions FOR DELETE USING (user_id = (SELECT auth.uid()));

-- webauthn_credentials
CREATE POLICY "webauthn_select" ON webauthn_credentials FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "webauthn_insert" ON webauthn_credentials FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "webauthn_update" ON webauthn_credentials FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "webauthn_delete" ON webauthn_credentials FOR DELETE USING (user_id = (SELECT auth.uid()));

-- webauthn_challenges
CREATE POLICY "challenges_select" ON webauthn_challenges FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "challenges_insert" ON webauthn_challenges FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "challenges_delete" ON webauthn_challenges FOR DELETE USING (user_id = (SELECT auth.uid()));

-- sync_jobs
CREATE POLICY "sync_select" ON sync_jobs FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "sync_insert" ON sync_jobs FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- device_tokens
CREATE POLICY "device_select" ON device_tokens FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "device_insert" ON device_tokens FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "device_delete" ON device_tokens FOR DELETE USING (user_id = (SELECT auth.uid()));

-- push_subscriptions
CREATE POLICY "push_all" ON push_subscriptions FOR ALL USING (user_id = (SELECT auth.uid()));

-- game_requests
CREATE POLICY "requests_select" ON game_requests FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "requests_insert" ON game_requests FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- game_reminders
CREATE POLICY "reminders_select" ON game_reminders FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "reminders_insert" ON game_reminders FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "reminders_update" ON game_reminders FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "reminders_delete" ON game_reminders FOR DELETE USING (user_id = (SELECT auth.uid()));

-- play_recommendations
CREATE POLICY "playrec_select" ON play_recommendations FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "playrec_update" ON play_recommendations FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- game_discovery_attempts
CREATE POLICY "disco_attempts_select" ON game_discovery_attempts FOR SELECT USING (user_id = (SELECT auth.uid()));

-- game_discovery_queue (uses requested_by)
CREATE POLICY "disco_queue_select" ON game_discovery_queue FOR SELECT USING (requested_by = (SELECT auth.uid()));

-- user_profiles (uses id)
CREATE POLICY "userprofiles_select" ON user_profiles FOR SELECT USING (id = (SELECT auth.uid()));
CREATE POLICY "userprofiles_update" ON user_profiles FOR UPDATE USING (id = (SELECT auth.uid()));

-- priority_alert_rules
CREATE POLICY "alerts_select" ON priority_alert_rules FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "alerts_insert" ON priority_alert_rules FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "alerts_update" ON priority_alert_rules FOR UPDATE USING (user_id = (SELECT auth.uid()));
CREATE POLICY "alerts_delete" ON priority_alert_rules FOR DELETE USING (user_id = (SELECT auth.uid()));

-- games (public read)
CREATE POLICY "games_select" ON games FOR SELECT USING (true);

-- ============================================================================
-- Done
-- ============================================================================
SELECT 'Nuclear policy reset complete' AS message;
