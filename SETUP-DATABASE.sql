-- ============================================================================
-- PATCHPULSE: COMPLETE DATABASE SETUP
-- Run this ONCE in Supabase SQL Editor (https://supabase.com/dashboard)
-- Go to: SQL Editor → New Query → Paste this → Run
-- ============================================================================

-- ============================================================================
-- PART 1: CORE TABLES
-- ============================================================================

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cover_url TEXT,
  logo_url TEXT,
  brand_color TEXT,
  secondary_color TEXT,
  platforms TEXT[] DEFAULT ARRAY[]::TEXT[],
  igdb_id INTEGER,
  is_live_service BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if they don't exist
ALTER TABLE games ADD COLUMN IF NOT EXISTS steam_app_id INTEGER;
ALTER TABLE games ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS brand_color TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS secondary_color TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS is_live_service BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_games_slug ON games(slug);

-- Platforms table
CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon_url TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO platforms (id, name, color, sort_order) VALUES
  ('pc', 'PC', '#1a1a2e', 1),
  ('ps5', 'PlayStation 5', '#003087', 2),
  ('ps4', 'PlayStation 4', '#003087', 3),
  ('xbox_series', 'Xbox Series X|S', '#107C10', 4),
  ('xbox_one', 'Xbox One', '#107C10', 5),
  ('switch', 'Nintendo Switch', '#E60012', 6),
  ('mobile', 'Mobile', '#6366f1', 7),
  ('steam', 'Steam', '#1b2838', 8)
ON CONFLICT (id) DO NOTHING;

-- Game platforms junction
CREATE TABLE IF NOT EXISTS game_platforms (
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  platform_id TEXT REFERENCES platforms(id) ON DELETE CASCADE,
  PRIMARY KEY (game_id, platform_id)
);

-- Patch notes table
CREATE TABLE IF NOT EXISTS patch_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  version TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  source_url TEXT,
  raw_content TEXT,
  summary_tldr TEXT,
  key_changes JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  impact_score INTEGER DEFAULT 50 CHECK (impact_score >= 0 AND impact_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patch_notes_game ON patch_notes(game_id, published_at DESC);

-- News items table
CREATE TABLE IF NOT EXISTS news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  summary TEXT,
  why_it_matters TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  source_name TEXT,
  source_url TEXT,
  image_url TEXT,
  topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_rumor BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_items_game ON news_items(game_id, published_at DESC);

-- User followed games
CREATE TABLE IF NOT EXISTS user_followed_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  notify_patches BOOLEAN DEFAULT true,
  notify_news BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_user_followed_games_user ON user_followed_games(user_id);
CREATE INDEX IF NOT EXISTS idx_user_followed_games_game ON user_followed_games(game_id);

-- User games (library)
CREATE TABLE IF NOT EXISTS user_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  source TEXT DEFAULT 'manual',
  playtime_hours INTEGER DEFAULT 0,
  last_played TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- User profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  is_pro BOOLEAN DEFAULT false,
  pro_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 2: NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'new_patch', 'new_news', 'game_release', 'ai_digest', 'price_drop', 'system'
  )),
  title TEXT NOT NULL,
  body TEXT,
  priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  patch_id UUID REFERENCES patch_notes(id) ON DELETE SET NULL,
  news_id UUID REFERENCES news_items(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, is_read, created_at DESC)
  WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

-- Push subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);

-- ============================================================================
-- PART 3: ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE patch_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_followed_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Games: public read
CREATE POLICY "Games are viewable by everyone" ON games FOR SELECT USING (true);
CREATE POLICY "Service role can manage games" ON games FOR ALL TO service_role USING (true);

-- Patch notes: public read
CREATE POLICY "Patch notes are viewable by everyone" ON patch_notes FOR SELECT USING (true);
CREATE POLICY "Service role can manage patch notes" ON patch_notes FOR ALL TO service_role USING (true);

-- News: public read
CREATE POLICY "News is viewable by everyone" ON news_items FOR SELECT USING (true);
CREATE POLICY "Service role can manage news" ON news_items FOR ALL TO service_role USING (true);

-- Notifications: user only
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all notifications" ON notifications FOR ALL TO service_role USING (true);

-- Push subscriptions: user only
CREATE POLICY "Users can manage own push subscriptions" ON push_subscriptions FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all push subscriptions" ON push_subscriptions FOR ALL TO service_role USING (true);

-- User followed games
CREATE POLICY "Users can view own followed games" ON user_followed_games FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own followed games" ON user_followed_games FOR ALL TO authenticated USING (auth.uid() = user_id);

-- User games
CREATE POLICY "Users can view own games" ON user_games FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own games" ON user_games FOR ALL TO authenticated USING (auth.uid() = user_id);

-- User profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Service role can manage profiles" ON user_profiles FOR ALL TO service_role USING (true);

-- ============================================================================
-- PART 4: TRIGGERS FOR AUTO-NOTIFICATIONS
-- ============================================================================

-- Function to notify followers when a patch is added
CREATE OR REPLACE FUNCTION notify_followers_of_patch()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, body, priority, game_id, patch_id)
  SELECT
    uf.user_id,
    'new_patch',
    g.name || ' - New Patch',
    COALESCE(NEW.summary_tldr, LEFT(NEW.title, 100)),
    CASE
      WHEN NEW.impact_score >= 80 THEN 5
      WHEN NEW.impact_score >= 60 THEN 4
      WHEN NEW.impact_score >= 40 THEN 3
      ELSE 2
    END,
    NEW.game_id,
    NEW.id
  FROM user_followed_games uf
  JOIN games g ON g.id = NEW.game_id
  WHERE uf.game_id = NEW.game_id AND uf.notify_patches = true;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_patch ON patch_notes;
CREATE TRIGGER trigger_notify_patch
  AFTER INSERT ON patch_notes
  FOR EACH ROW
  EXECUTE FUNCTION notify_followers_of_patch();

-- Function to notify followers when news is added
CREATE OR REPLACE FUNCTION notify_followers_of_news()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.game_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, body, priority, game_id, news_id)
    SELECT
      uf.user_id,
      'new_news',
      g.name || ' - ' || CASE WHEN NEW.is_rumor THEN 'Rumor' ELSE 'News' END,
      COALESCE(NEW.why_it_matters, LEFT(NEW.summary, 100)),
      CASE
        WHEN 'Launch' = ANY(NEW.topics) THEN 5
        WHEN 'DLC' = ANY(NEW.topics) THEN 4
        ELSE 3
      END,
      NEW.game_id,
      NEW.id
    FROM user_followed_games uf
    JOIN games g ON g.id = NEW.game_id
    WHERE uf.game_id = NEW.game_id AND uf.notify_news = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_news ON news_items;
CREATE TRIGGER trigger_notify_news
  AFTER INSERT ON news_items
  FOR EACH ROW
  EXECUTE FUNCTION notify_followers_of_news();

-- ============================================================================
-- PART 5: ENABLE REAL-TIME
-- ============================================================================

-- Enable real-time for notifications table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;

-- ============================================================================
-- PART 6: SEED DATA (Sample Games & Patches)
-- ============================================================================

-- Insert sample games
INSERT INTO games (id, name, slug, cover_url, brand_color, platforms, igdb_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Cyberpunk 2077', 'cyberpunk-2077',
   'https://images.igdb.com/igdb/image/upload/t_cover_big/co4hkw.jpg',
   '#fcee0a', ARRAY['pc', 'ps5', 'xbox_series'], 1877),
  ('22222222-2222-2222-2222-222222222222', 'Elden Ring', 'elden-ring',
   'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg',
   '#c9a227', ARRAY['pc', 'ps5', 'xbox_series'], 119133),
  ('33333333-3333-3333-3333-333333333333', 'Baldur''s Gate 3', 'baldurs-gate-3',
   'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.jpg',
   '#8b0000', ARRAY['pc', 'ps5', 'xbox_series'], 119171),
  ('44444444-4444-4444-4444-444444444444', 'Valorant', 'valorant',
   'https://images.igdb.com/igdb/image/upload/t_cover_big/co2mvt.jpg',
   '#ff4655', ARRAY['pc'], 126459),
  ('55555555-5555-5555-5555-555555555555', 'Fortnite', 'fortnite',
   'https://images.igdb.com/igdb/image/upload/t_cover_big/co3wk8.jpg',
   '#9d4dbb', ARRAY['pc', 'ps5', 'xbox_series', 'switch', 'mobile'], 1905),
  ('66666666-6666-6666-6666-666666666666', 'League of Legends', 'league-of-legends',
   'https://images.igdb.com/igdb/image/upload/t_cover_big/co49wj.jpg',
   '#c89b3c', ARRAY['pc'], 115),
  ('77777777-7777-7777-7777-777777777777', 'Minecraft', 'minecraft',
   'https://images.igdb.com/igdb/image/upload/t_cover_big/co49x5.jpg',
   '#5d8731', ARRAY['pc', 'ps5', 'xbox_series', 'switch', 'mobile'], 121),
  ('88888888-8888-8888-8888-888888888888', 'Call of Duty: Warzone', 'call-of-duty-warzone',
   'https://images.igdb.com/igdb/image/upload/t_cover_big/co6hbm.jpg',
   '#00ff00', ARRAY['pc', 'ps5', 'xbox_series'], 131800)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = EXCLUDED.cover_url,
  brand_color = EXCLUDED.brand_color;

-- Insert sample patch notes
INSERT INTO patch_notes (id, game_id, title, version, published_at, summary_tldr, key_changes, tags, impact_score) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'Update 2.2 - Phantom Liberty Enhancements', '2.2',
   NOW() - INTERVAL '2 days',
   'Major performance improvements and new gameplay features.',
   '["New vehicle combat", "60+ bug fixes", "Ray tracing optimizations"]'::jsonb,
   ARRAY['major', 'performance'], 85),
  ('aaaa2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   'Regulation Version 1.13', '1.13',
   NOW() - INTERVAL '1 day',
   'Balance adjustments and DLC preparation.',
   '["Boss difficulty adjustments", "PvP balance fixes", "New NPC quests"]'::jsonb,
   ARRAY['balance', 'dlc'], 72),
  ('aaaa3333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444',
   'Episode 8 Act 3 Patch Notes', '8.11',
   NOW() - INTERVAL '3 hours',
   'New agent Vyse released with major map updates.',
   '["New Agent: Vyse", "Abyss map changes", "Weapon balance"]'::jsonb,
   ARRAY['major', 'content', 'agent'], 88),
  ('aaaa4444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555',
   'Chapter 5 Season 4 Update', 'v31.10',
   NOW() - INTERVAL '6 hours',
   'Marvel collaboration with new mythic weapons.',
   '["Marvel crossover", "New mythic weapons", "Map changes"]'::jsonb,
   ARRAY['major', 'collab'], 95)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  summary_tldr = EXCLUDED.summary_tldr;

-- Insert sample news
INSERT INTO news_items (id, game_id, title, published_at, source_name, summary, why_it_matters, topics, is_rumor) VALUES
  ('bbbb1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'CD Projekt Red Announces Next Cyberpunk Game',
   NOW() - INTERVAL '1 day',
   'IGN',
   'CD Projekt Red has announced a new Cyberpunk game, codenamed Project Orion.',
   'Confirms the franchise will continue beyond 2077.',
   ARRAY['announcement', 'sequel'], false),
  ('bbbb2222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444',
   'Valorant Console Beta Starts Next Month',
   NOW() - INTERVAL '12 hours',
   'The Verge',
   'Riot Games announces limited beta for Valorant on PS5 and Xbox.',
   'Major expansion of Valorant player base with console support.',
   ARRAY['console', 'beta'], false)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary;

-- ============================================================================
-- DONE! Your database is now set up for real-time notifications.
--
-- NEXT STEPS:
-- 1. Sign up on your app at https://patchpulse.app
-- 2. Follow some games
-- 3. When new patches/news are added, you'll get real-time notifications!
-- ============================================================================
