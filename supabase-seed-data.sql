-- =====================================================
-- PatchPulse Demo Seed Data
-- Run this after the main schema migrations
-- =====================================================

-- 1. Insert demo games
-- =====================================================
INSERT INTO games (id, name, slug, cover_url, logo_url, brand_color, platforms, igdb_id, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Cyberpunk 2077', 'cyberpunk-2077',
   'https://images.igdb.com/igdb/image/upload/t_cover_big/co4hkw.jpg',
   NULL, '#fcee0a', ARRAY['pc', 'ps5', 'xbox_series'], 1877, NOW()),

  ('22222222-2222-2222-2222-222222222222', 'Elden Ring', 'elden-ring',
   'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg',
   NULL, '#c9a227', ARRAY['pc', 'ps5', 'xbox_series'], 119133, NOW()),

  ('33333333-3333-3333-3333-333333333333', 'Baldur''s Gate 3', 'baldurs-gate-3',
   'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.jpg',
   NULL, '#8b0000', ARRAY['pc', 'ps5', 'xbox_series'], 119171, NOW()),

  ('44444444-4444-4444-4444-444444444444', 'Valorant', 'valorant',
   'https://images.igdb.com/igdb/image/upload/t_cover_big/co2mvt.jpg',
   NULL, '#ff4655', ARRAY['pc'], 126459, NOW()),

  ('55555555-5555-5555-5555-555555555555', 'Fortnite', 'fortnite',
   'https://images.igdb.com/igdb/image/upload/t_cover_big/co3wk8.jpg',
   NULL, '#9d4dbb', ARRAY['pc', 'ps5', 'xbox_series', 'switch', 'mobile'], 1905, NOW()),

  ('66666666-6666-6666-6666-666666666666', 'Call of Duty: Warzone', 'call-of-duty-warzone',
   'https://images.igdb.com/igdb/image/upload/t_cover_big/co6hbm.jpg',
   NULL, '#00ff00', ARRAY['pc', 'ps5', 'xbox_series'], 131800, NOW()),

  ('77777777-7777-7777-7777-777777777777', 'League of Legends', 'league-of-legends',
   'https://images.igdb.com/igdb/image/upload/t_cover_big/co49wj.jpg',
   NULL, '#c89b3c', ARRAY['pc'], 115, NOW()),

  ('88888888-8888-8888-8888-888888888888', 'Minecraft', 'minecraft',
   'https://images.igdb.com/igdb/image/upload/t_cover_big/co49x5.jpg',
   NULL, '#5d8731', ARRAY['pc', 'ps5', 'xbox_series', 'switch', 'mobile'], 121, NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = EXCLUDED.cover_url,
  brand_color = EXCLUDED.brand_color;

-- 2. Insert patch notes for demo games
-- =====================================================
INSERT INTO patch_notes (id, game_id, title, version, published_at, source_url, summary_tldr, key_changes, tags, impact_score, created_at) VALUES
  -- Cyberpunk 2077
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'Update 2.2 - Phantom Liberty Enhancements', '2.2',
   NOW() - INTERVAL '2 days',
   'https://www.cyberpunk.net/updates',
   'Major performance improvements and new gameplay features for Phantom Liberty expansion.',
   '["New vehicle combat system", "60+ bug fixes", "Ray tracing optimizations", "New weapons added"]'::jsonb,
   ARRAY['major', 'performance', 'content'],
   85, NOW()),

  -- Elden Ring
  ('aaaa2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   'Regulation Version 1.13', '1.13',
   NOW() - INTERVAL '5 days',
   'https://www.bandainamcoent.com/games/elden-ring',
   'Balance adjustments and DLC preparation update.',
   '["Boss difficulty adjustments", "New NPC quests", "Shadow of the Erdtree prep", "PvP balance fixes"]'::jsonb,
   ARRAY['balance', 'dlc'],
   72, NOW()),

  -- Baldur's Gate 3
  ('aaaa3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
   'Hotfix 27 - Modding Tools Update', '4.1.27',
   NOW() - INTERVAL '1 day',
   'https://baldursgate3.game/news',
   'Official modding toolkit released with improved mod support.',
   '["Official mod toolkit", "Cross-save improvements", "New character customization", "Performance fixes"]'::jsonb,
   ARRAY['major', 'modding', 'tools'],
   90, NOW()),

  -- Valorant
  ('aaaa4444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444',
   'Episode 8 Act 3 Patch Notes', '8.11',
   NOW() - INTERVAL '3 days',
   'https://playvalorant.com/news/game-updates',
   'New agent Vyse released with major map updates.',
   '["New Agent: Vyse", "Abyss map changes", "Ranked system updates", "Weapon balance"]'::jsonb,
   ARRAY['major', 'content', 'agent'],
   88, NOW()),

  -- Fortnite
  ('aaaa5555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555',
   'Chapter 5 Season 4 Update', 'v31.10',
   NOW() - INTERVAL '6 hours',
   'https://www.fortnite.com/news',
   'Marvel collaboration with new mythic weapons and POIs.',
   '["Marvel crossover content", "New mythic weapons", "Map changes", "Battle Pass items"]'::jsonb,
   ARRAY['major', 'collab', 'content'],
   95, NOW()),

  -- Warzone
  ('aaaa6666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666',
   'Season 6 Mid-Season Update', '1.68',
   NOW() - INTERVAL '4 days',
   'https://www.callofduty.com/warzone',
   'New Resurgence map and weapon tuning.',
   '["New Resurgence map", "Weapon balance pass", "Anti-cheat improvements", "Bug fixes"]'::jsonb,
   ARRAY['content', 'balance', 'anticheat'],
   78, NOW()),

  -- League of Legends
  ('aaaa7777-7777-7777-7777-777777777777', '77777777-7777-7777-7777-777777777777',
   'Patch 14.21 Notes', '14.21',
   NOW() - INTERVAL '1 day',
   'https://www.leagueoflegends.com/news',
   'Worlds 2024 patch with champion adjustments.',
   '["20+ champion changes", "Worlds 2024 prep", "Item adjustments", "Jungle changes"]'::jsonb,
   ARRAY['balance', 'esports', 'major'],
   82, NOW()),

  -- Minecraft
  ('aaaa8888-8888-8888-8888-888888888888', '88888888-8888-8888-8888-888888888888',
   'The Garden Awakens Update', '1.21.4',
   NOW() - INTERVAL '12 hours',
   'https://www.minecraft.net/updates',
   'New biome with unique mobs and building blocks.',
   '["Pale Garden biome", "Creaking mob", "New wood types", "Ambient sounds"]'::jsonb,
   ARRAY['major', 'content', 'biome'],
   91, NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  summary_tldr = EXCLUDED.summary_tldr,
  key_changes = EXCLUDED.key_changes;

-- 3. Insert news items
-- =====================================================
INSERT INTO news_items (id, game_id, title, published_at, source_name, source_url, summary, why_it_matters, topics, is_rumor, created_at) VALUES
  ('bbbb1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   'CD Projekt Red Announces Next Cyberpunk Game',
   NOW() - INTERVAL '1 day',
   'IGN', 'https://ign.com',
   'CD Projekt Red has officially announced development of a new Cyberpunk game, codenamed Project Orion.',
   'This confirms the Cyberpunk franchise will continue beyond 2077, with potential for expanded multiplayer features.',
   ARRAY['announcement', 'sequel'],
   false, NOW()),

  ('bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   'Elden Ring DLC Sells 5 Million Copies in 3 Days',
   NOW() - INTERVAL '3 days',
   'GameSpot', 'https://gamespot.com',
   'Shadow of the Erdtree has become the fastest-selling DLC in FromSoftware history.',
   'Demonstrates the massive demand for Souls-like content and the success of single-player DLC.',
   ARRAY['sales', 'dlc'],
   false, NOW()),

  ('bbbb3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
   'Baldur''s Gate 3 Xbox Split-Screen Patch Coming',
   NOW() - INTERVAL '2 days',
   'Eurogamer', 'https://eurogamer.net',
   'Larian Studios confirms split-screen co-op coming to Xbox Series X version.',
   'Addresses one of the main feature gaps between PlayStation and Xbox versions.',
   ARRAY['feature', 'xbox'],
   false, NOW()),

  ('bbbb4444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444',
   'Valorant Console Beta Starts Next Month',
   NOW() - INTERVAL '12 hours',
   'The Verge', 'https://theverge.com',
   'Riot Games announces limited beta for Valorant on PlayStation 5 and Xbox Series X.',
   'Major expansion of Valorant''s player base with console support finally arriving.',
   ARRAY['console', 'beta'],
   false, NOW()),

  ('bbbb5555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555',
   'Fortnite OG Mode Returns Permanently',
   NOW() - INTERVAL '6 hours',
   'Epic Games', 'https://fortnite.com',
   'Due to overwhelming player demand, Fortnite OG will become a permanent game mode.',
   'Shows Epic''s willingness to listen to community feedback and maintain classic experiences.',
   ARRAY['announcement', 'og'],
   false, NOW()),

  ('bbbb6666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666',
   'Warzone Mobile Global Launch Date Revealed',
   NOW() - INTERVAL '5 days',
   'Activision', 'https://activision.com',
   'Call of Duty: Warzone Mobile launching globally on March 21st for iOS and Android.',
   'Expands the Warzone ecosystem to mobile, competing with PUBG Mobile and Apex Legends Mobile.',
   ARRAY['mobile', 'launch'],
   false, NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary;

-- 4. Link games to platforms (if platforms table exists)
-- =====================================================
INSERT INTO game_platforms (game_id, platform_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'pc'),
  ('11111111-1111-1111-1111-111111111111', 'ps5'),
  ('11111111-1111-1111-1111-111111111111', 'xbox_series'),
  ('22222222-2222-2222-2222-222222222222', 'pc'),
  ('22222222-2222-2222-2222-222222222222', 'ps5'),
  ('22222222-2222-2222-2222-222222222222', 'xbox_series'),
  ('33333333-3333-3333-3333-333333333333', 'pc'),
  ('33333333-3333-3333-3333-333333333333', 'ps5'),
  ('33333333-3333-3333-3333-333333333333', 'xbox_series'),
  ('44444444-4444-4444-4444-444444444444', 'pc'),
  ('55555555-5555-5555-5555-555555555555', 'pc'),
  ('55555555-5555-5555-5555-555555555555', 'ps5'),
  ('55555555-5555-5555-5555-555555555555', 'xbox_series'),
  ('55555555-5555-5555-5555-555555555555', 'switch'),
  ('55555555-5555-5555-5555-555555555555', 'mobile'),
  ('66666666-6666-6666-6666-666666666666', 'pc'),
  ('66666666-6666-6666-6666-666666666666', 'ps5'),
  ('66666666-6666-6666-6666-666666666666', 'xbox_series'),
  ('77777777-7777-7777-7777-777777777777', 'pc'),
  ('88888888-8888-8888-8888-888888888888', 'pc'),
  ('88888888-8888-8888-8888-888888888888', 'ps5'),
  ('88888888-8888-8888-8888-888888888888', 'xbox_series'),
  ('88888888-8888-8888-8888-888888888888', 'switch'),
  ('88888888-8888-8888-8888-888888888888', 'mobile')
ON CONFLICT DO NOTHING;

-- 5. NOTE: After running this, you need to link your user to these games
-- Run this after logging in (replace YOUR_USER_ID with your actual user ID from auth.users):
--
-- INSERT INTO user_games (user_id, game_id, source) VALUES
--   ('YOUR_USER_ID', '11111111-1111-1111-1111-111111111111', 'manual'),
--   ('YOUR_USER_ID', '22222222-2222-2222-2222-222222222222', 'manual'),
--   ('YOUR_USER_ID', '33333333-3333-3333-3333-333333333333', 'manual'),
--   ('YOUR_USER_ID', '44444444-4444-4444-4444-444444444444', 'manual'),
--   ('YOUR_USER_ID', '55555555-5555-5555-5555-555555555555', 'manual'),
--   ('YOUR_USER_ID', '66666666-6666-6666-6666-666666666666', 'manual'),
--   ('YOUR_USER_ID', '77777777-7777-7777-7777-777777777777', 'manual'),
--   ('YOUR_USER_ID', '88888888-8888-8888-8888-888888888888', 'manual');
