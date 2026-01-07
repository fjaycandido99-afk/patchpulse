-- ============================================================================
-- ADD INDEXES FOR UNINDEXED FOREIGN KEYS
-- Improves JOIN and DELETE performance
-- ============================================================================

-- user_games
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_user_games_user_id ON user_games(user_id);
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_user_games_game_id ON user_games(game_id);
EXCEPTION WHEN undefined_column THEN NULL; END $$;

-- user_library_games
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_user_library_games_user_id ON user_library_games(user_id);
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_user_library_games_game_id ON user_library_games(game_id);
EXCEPTION WHEN undefined_column THEN NULL; END $$;

-- whats_new_cache
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_whats_new_cache_user_id ON whats_new_cache(user_id);
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_whats_new_cache_game_id ON whats_new_cache(game_id);
EXCEPTION WHEN undefined_column THEN NULL; END $$;

-- search_requests (user_id only)
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_search_requests_user_id ON search_requests(user_id);
EXCEPTION WHEN undefined_column OR undefined_table THEN NULL; END $$;

-- user_events (user_id only)
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id);
EXCEPTION WHEN undefined_column OR undefined_table THEN NULL; END $$;

-- ============================================================================
-- Done
-- ============================================================================
SELECT 'Foreign key indexes added' AS message;
