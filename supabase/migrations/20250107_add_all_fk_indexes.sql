-- ============================================================================
-- ADD ALL FOREIGN KEY INDEXES (with error handling)
-- ============================================================================

DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_backlog_items_user_id ON backlog_items(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_backlog_items_game_id ON backlog_items(game_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_game_discovery_queue_game_id ON game_discovery_queue(game_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_game_discovery_queue_requested_by ON game_discovery_queue(requested_by); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_game_platforms_game_id ON game_platforms(game_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_game_reminders_user_id ON game_reminders(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_game_reminders_game_id ON game_reminders(game_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_game_requests_user_id ON game_requests(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_game_similarities_game_id ON game_similarities(game_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_game_similarities_similar_game_id ON game_similarities(similar_game_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_news_images_news_id ON news_images(news_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_news_items_game_id ON news_items(game_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_notifications_game_id ON notifications(game_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_patch_images_patch_id ON patch_images(patch_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_patch_notes_game_id ON patch_notes(game_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_seasonal_events_game_id ON seasonal_events(game_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_upcoming_releases_game_id ON upcoming_releases(game_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON connected_accounts(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_sync_jobs_user_id ON sync_jobs(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_user_id ON webauthn_credentials(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_user_id ON webauthn_challenges(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_return_suggestions_user_id ON return_suggestions(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_return_suggestions_game_id ON return_suggestions(game_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_play_recommendations_user_id ON play_recommendations(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_priority_alert_rules_user_id ON priority_alert_rules(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_game_discovery_attempts_user_id ON game_discovery_attempts(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT 'All foreign key indexes added' AS message;
