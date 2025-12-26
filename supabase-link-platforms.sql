-- =====================================================
-- PatchPulse: Link Platforms to Games
-- Run this AFTER running supabase-visual-system.sql
-- =====================================================

-- First, ensure the visual system tables exist
-- (This will do nothing if already run)

-- Create platforms table if not exists
CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon_url TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert standard platforms (skip if exist)
INSERT INTO platforms (id, name, icon_url, color, sort_order) VALUES
  ('pc', 'PC', '/icons/platforms/pc.svg', '#1a1a2e', 1),
  ('ps5', 'PlayStation 5', '/icons/platforms/playstation.svg', '#003087', 2),
  ('ps4', 'PlayStation 4', '/icons/platforms/playstation.svg', '#003087', 3),
  ('xbox_series', 'Xbox Series X|S', '/icons/platforms/xbox.svg', '#107C10', 4),
  ('xbox_one', 'Xbox One', '/icons/platforms/xbox.svg', '#107C10', 5),
  ('switch', 'Nintendo Switch', '/icons/platforms/switch.svg', '#E60012', 6),
  ('mobile', 'Mobile', '/icons/platforms/mobile.svg', '#6366f1', 7),
  ('steam', 'Steam', '/icons/platforms/steam.svg', '#1b2838', 8),
  ('epic', 'Epic Games', '/icons/platforms/epic.svg', '#2f2f2f', 9)
ON CONFLICT (id) DO NOTHING;

-- Add branding columns to games if not exist
ALTER TABLE games ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS brand_color TEXT;

-- Create game_platforms junction table if not exists
CREATE TABLE IF NOT EXISTS game_platforms (
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  platform_id TEXT REFERENCES platforms(id) ON DELETE CASCADE,
  PRIMARY KEY (game_id, platform_id)
);

-- Enable RLS
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_platforms ENABLE ROW LEVEL SECURITY;

-- Public read policies (create only if not exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view platforms') THEN
    CREATE POLICY "Anyone can view platforms" ON platforms FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view game_platforms') THEN
    CREATE POLICY "Anyone can view game_platforms" ON game_platforms FOR SELECT USING (true);
  END IF;
END $$;

-- =====================================================
-- LINK ALL GAMES TO PC BY DEFAULT
-- =====================================================
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'pc' FROM games
ON CONFLICT DO NOTHING;

-- =====================================================
-- LINK POPULAR GAMES TO THEIR KNOWN PLATFORMS
-- =====================================================

-- Fortnite: PC, PS5, PS4, Xbox Series, Xbox One, Switch, Mobile
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps5' FROM games WHERE LOWER(name) LIKE '%fortnite%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps4' FROM games WHERE LOWER(name) LIKE '%fortnite%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_series' FROM games WHERE LOWER(name) LIKE '%fortnite%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_one' FROM games WHERE LOWER(name) LIKE '%fortnite%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'switch' FROM games WHERE LOWER(name) LIKE '%fortnite%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'mobile' FROM games WHERE LOWER(name) LIKE '%fortnite%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'epic' FROM games WHERE LOWER(name) LIKE '%fortnite%'
ON CONFLICT DO NOTHING;

-- Valorant: PC only
-- Already has PC from default

-- Apex Legends: PC, PS5, PS4, Xbox Series, Xbox One, Switch
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps5' FROM games WHERE LOWER(name) LIKE '%apex%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps4' FROM games WHERE LOWER(name) LIKE '%apex%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_series' FROM games WHERE LOWER(name) LIKE '%apex%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_one' FROM games WHERE LOWER(name) LIKE '%apex%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'switch' FROM games WHERE LOWER(name) LIKE '%apex%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'steam' FROM games WHERE LOWER(name) LIKE '%apex%'
ON CONFLICT DO NOTHING;

-- Call of Duty / Warzone: PC, PS5, PS4, Xbox Series, Xbox One
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps5' FROM games WHERE LOWER(name) LIKE '%call of duty%' OR LOWER(name) LIKE '%warzone%' OR LOWER(name) LIKE '%cod%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps4' FROM games WHERE LOWER(name) LIKE '%call of duty%' OR LOWER(name) LIKE '%warzone%' OR LOWER(name) LIKE '%cod%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_series' FROM games WHERE LOWER(name) LIKE '%call of duty%' OR LOWER(name) LIKE '%warzone%' OR LOWER(name) LIKE '%cod%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_one' FROM games WHERE LOWER(name) LIKE '%call of duty%' OR LOWER(name) LIKE '%warzone%' OR LOWER(name) LIKE '%cod%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'steam' FROM games WHERE LOWER(name) LIKE '%call of duty%' OR LOWER(name) LIKE '%warzone%' OR LOWER(name) LIKE '%cod%'
ON CONFLICT DO NOTHING;

-- Overwatch 2: PC, PS5, PS4, Xbox Series, Xbox One, Switch
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps5' FROM games WHERE LOWER(name) LIKE '%overwatch%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps4' FROM games WHERE LOWER(name) LIKE '%overwatch%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_series' FROM games WHERE LOWER(name) LIKE '%overwatch%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_one' FROM games WHERE LOWER(name) LIKE '%overwatch%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'switch' FROM games WHERE LOWER(name) LIKE '%overwatch%'
ON CONFLICT DO NOTHING;

-- League of Legends: PC only (already has PC)

-- Counter-Strike 2 / CS:GO: PC, Steam
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'steam' FROM games WHERE LOWER(name) LIKE '%counter-strike%' OR LOWER(name) LIKE '%cs2%' OR LOWER(name) LIKE '%csgo%'
ON CONFLICT DO NOTHING;

-- Destiny 2: PC, PS5, PS4, Xbox Series, Xbox One, Steam, Epic
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps5' FROM games WHERE LOWER(name) LIKE '%destiny%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps4' FROM games WHERE LOWER(name) LIKE '%destiny%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_series' FROM games WHERE LOWER(name) LIKE '%destiny%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_one' FROM games WHERE LOWER(name) LIKE '%destiny%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'steam' FROM games WHERE LOWER(name) LIKE '%destiny%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'epic' FROM games WHERE LOWER(name) LIKE '%destiny%'
ON CONFLICT DO NOTHING;

-- Rocket League: PC, PS5, PS4, Xbox Series, Xbox One, Switch, Epic
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps5' FROM games WHERE LOWER(name) LIKE '%rocket league%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps4' FROM games WHERE LOWER(name) LIKE '%rocket league%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_series' FROM games WHERE LOWER(name) LIKE '%rocket league%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_one' FROM games WHERE LOWER(name) LIKE '%rocket league%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'switch' FROM games WHERE LOWER(name) LIKE '%rocket league%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'epic' FROM games WHERE LOWER(name) LIKE '%rocket league%'
ON CONFLICT DO NOTHING;

-- Rainbow Six Siege: PC, PS5, PS4, Xbox Series, Xbox One, Steam
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps5' FROM games WHERE LOWER(name) LIKE '%rainbow six%' OR LOWER(name) LIKE '%r6%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps4' FROM games WHERE LOWER(name) LIKE '%rainbow six%' OR LOWER(name) LIKE '%r6%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_series' FROM games WHERE LOWER(name) LIKE '%rainbow six%' OR LOWER(name) LIKE '%r6%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_one' FROM games WHERE LOWER(name) LIKE '%rainbow six%' OR LOWER(name) LIKE '%r6%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'steam' FROM games WHERE LOWER(name) LIKE '%rainbow six%' OR LOWER(name) LIKE '%r6%'
ON CONFLICT DO NOTHING;

-- Minecraft: PC, PS5, PS4, Xbox Series, Xbox One, Switch, Mobile
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps5' FROM games WHERE LOWER(name) LIKE '%minecraft%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps4' FROM games WHERE LOWER(name) LIKE '%minecraft%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_series' FROM games WHERE LOWER(name) LIKE '%minecraft%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_one' FROM games WHERE LOWER(name) LIKE '%minecraft%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'switch' FROM games WHERE LOWER(name) LIKE '%minecraft%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'mobile' FROM games WHERE LOWER(name) LIKE '%minecraft%'
ON CONFLICT DO NOTHING;

-- GTA / Grand Theft Auto: PC, PS5, PS4, Xbox Series, Xbox One, Steam
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps5' FROM games WHERE LOWER(name) LIKE '%gta%' OR LOWER(name) LIKE '%grand theft auto%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps4' FROM games WHERE LOWER(name) LIKE '%gta%' OR LOWER(name) LIKE '%grand theft auto%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_series' FROM games WHERE LOWER(name) LIKE '%gta%' OR LOWER(name) LIKE '%grand theft auto%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_one' FROM games WHERE LOWER(name) LIKE '%gta%' OR LOWER(name) LIKE '%grand theft auto%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'steam' FROM games WHERE LOWER(name) LIKE '%gta%' OR LOWER(name) LIKE '%grand theft auto%'
ON CONFLICT DO NOTHING;

-- Elden Ring / Dark Souls / FromSoftware: PC, PS5, PS4, Xbox Series, Xbox One, Steam
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps5' FROM games WHERE LOWER(name) LIKE '%elden ring%' OR LOWER(name) LIKE '%dark souls%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps4' FROM games WHERE LOWER(name) LIKE '%elden ring%' OR LOWER(name) LIKE '%dark souls%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_series' FROM games WHERE LOWER(name) LIKE '%elden ring%' OR LOWER(name) LIKE '%dark souls%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_one' FROM games WHERE LOWER(name) LIKE '%elden ring%' OR LOWER(name) LIKE '%dark souls%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'steam' FROM games WHERE LOWER(name) LIKE '%elden ring%' OR LOWER(name) LIKE '%dark souls%'
ON CONFLICT DO NOTHING;

-- Diablo 4: PC, PS5, PS4, Xbox Series, Xbox One, Steam
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps5' FROM games WHERE LOWER(name) LIKE '%diablo%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps4' FROM games WHERE LOWER(name) LIKE '%diablo%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_series' FROM games WHERE LOWER(name) LIKE '%diablo%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_one' FROM games WHERE LOWER(name) LIKE '%diablo%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'steam' FROM games WHERE LOWER(name) LIKE '%diablo%'
ON CONFLICT DO NOTHING;

-- Baldur's Gate 3: PC, PS5, Xbox Series, Steam
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps5' FROM games WHERE LOWER(name) LIKE '%baldur%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_series' FROM games WHERE LOWER(name) LIKE '%baldur%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'steam' FROM games WHERE LOWER(name) LIKE '%baldur%'
ON CONFLICT DO NOTHING;

-- Helldivers 2: PC, PS5, Steam
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps5' FROM games WHERE LOWER(name) LIKE '%helldivers%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'steam' FROM games WHERE LOWER(name) LIKE '%helldivers%'
ON CONFLICT DO NOTHING;

-- Palworld: PC, Xbox Series, Steam
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_series' FROM games WHERE LOWER(name) LIKE '%palworld%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'steam' FROM games WHERE LOWER(name) LIKE '%palworld%'
ON CONFLICT DO NOTHING;

-- FIFA / EA FC: PC, PS5, PS4, Xbox Series, Xbox One, Switch, Steam
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps5' FROM games WHERE LOWER(name) LIKE '%fifa%' OR LOWER(name) LIKE '%ea fc%' OR LOWER(name) LIKE '%ea sports fc%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps4' FROM games WHERE LOWER(name) LIKE '%fifa%' OR LOWER(name) LIKE '%ea fc%' OR LOWER(name) LIKE '%ea sports fc%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_series' FROM games WHERE LOWER(name) LIKE '%fifa%' OR LOWER(name) LIKE '%ea fc%' OR LOWER(name) LIKE '%ea sports fc%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_one' FROM games WHERE LOWER(name) LIKE '%fifa%' OR LOWER(name) LIKE '%ea fc%' OR LOWER(name) LIKE '%ea sports fc%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'switch' FROM games WHERE LOWER(name) LIKE '%fifa%' OR LOWER(name) LIKE '%ea fc%' OR LOWER(name) LIKE '%ea sports fc%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'steam' FROM games WHERE LOWER(name) LIKE '%fifa%' OR LOWER(name) LIKE '%ea fc%' OR LOWER(name) LIKE '%ea sports fc%'
ON CONFLICT DO NOTHING;

-- Genshin Impact / Honkai: PC, PS5, PS4, Mobile
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps5' FROM games WHERE LOWER(name) LIKE '%genshin%' OR LOWER(name) LIKE '%honkai%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps4' FROM games WHERE LOWER(name) LIKE '%genshin%' OR LOWER(name) LIKE '%honkai%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'mobile' FROM games WHERE LOWER(name) LIKE '%genshin%' OR LOWER(name) LIKE '%honkai%'
ON CONFLICT DO NOTHING;

-- PUBG: PC, PS5, PS4, Xbox Series, Xbox One, Mobile, Steam
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps5' FROM games WHERE LOWER(name) LIKE '%pubg%' OR LOWER(name) LIKE '%playerunknown%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps4' FROM games WHERE LOWER(name) LIKE '%pubg%' OR LOWER(name) LIKE '%playerunknown%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_series' FROM games WHERE LOWER(name) LIKE '%pubg%' OR LOWER(name) LIKE '%playerunknown%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_one' FROM games WHERE LOWER(name) LIKE '%pubg%' OR LOWER(name) LIKE '%playerunknown%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'mobile' FROM games WHERE LOWER(name) LIKE '%pubg%' OR LOWER(name) LIKE '%playerunknown%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'steam' FROM games WHERE LOWER(name) LIKE '%pubg%' OR LOWER(name) LIKE '%playerunknown%'
ON CONFLICT DO NOTHING;

-- Dota 2: PC, Steam only
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'steam' FROM games WHERE LOWER(name) LIKE '%dota%'
ON CONFLICT DO NOTHING;

-- World of Warcraft: PC only (already has PC)

-- Final Fantasy XIV: PC, PS5, PS4, Steam
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps5' FROM games WHERE LOWER(name) LIKE '%final fantasy xiv%' OR LOWER(name) LIKE '%ffxiv%' OR LOWER(name) LIKE '%ff14%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps4' FROM games WHERE LOWER(name) LIKE '%final fantasy xiv%' OR LOWER(name) LIKE '%ffxiv%' OR LOWER(name) LIKE '%ff14%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'steam' FROM games WHERE LOWER(name) LIKE '%final fantasy xiv%' OR LOWER(name) LIKE '%ffxiv%' OR LOWER(name) LIKE '%ff14%'
ON CONFLICT DO NOTHING;

-- Monster Hunter: PC, PS5, PS4, Xbox Series, Switch, Steam
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps5' FROM games WHERE LOWER(name) LIKE '%monster hunter%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'ps4' FROM games WHERE LOWER(name) LIKE '%monster hunter%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'xbox_series' FROM games WHERE LOWER(name) LIKE '%monster hunter%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'switch' FROM games WHERE LOWER(name) LIKE '%monster hunter%'
ON CONFLICT DO NOTHING;
INSERT INTO game_platforms (game_id, platform_id)
SELECT id, 'steam' FROM games WHERE LOWER(name) LIKE '%monster hunter%'
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERY - Run this to see results
-- =====================================================
-- SELECT g.name, array_agg(p.name ORDER BY p.sort_order) as platforms
-- FROM games g
-- LEFT JOIN game_platforms gp ON g.id = gp.game_id
-- LEFT JOIN platforms p ON gp.platform_id = p.id
-- GROUP BY g.id, g.name
-- ORDER BY g.name;

-- Done! Check your games now have platforms linked.
