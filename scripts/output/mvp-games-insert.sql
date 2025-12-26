-- ============================================================================
-- MVP GAMES INSERT
-- Generated: 2025-12-23T08:32:48.083Z
-- Total games: 674
-- ============================================================================

-- Run supabase-mvp-games.sql first to add the required columns!

-- Upsert games (insert or update on conflict)

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Counter-Strike 2', 'counter-strike-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg', ARRAY['PC']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Dota 2', 'dota-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg', ARRAY['PC']::text[], 'MOBA', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('PUBG: BATTLEGROUNDS', 'pubg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/578080/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Battle Royale', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Apex Legends', 'apex-legends', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Battle Royale', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Grand Theft Auto V', 'gta-v', 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Rust', 'rust', 'https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg', ARRAY['PC']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Tom Clancy''s Rainbow Six Siege', 'rainbow-six-siege', 'https://cdn.cloudflare.steamstatic.com/steam/apps/359550/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Destiny 2', 'destiny-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1085660/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Looter Shooter', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Team Fortress 2', 'team-fortress-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/440/header.jpg', ARRAY['PC']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('ARK: Survival Evolved', 'ark-survival-evolved', 'https://cdn.cloudflare.steamstatic.com/steam/apps/346110/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Warframe', 'warframe', 'https://cdn.cloudflare.steamstatic.com/steam/apps/230410/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Action RPG', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Path of Exile', 'path-of-exile', 'https://cdn.cloudflare.steamstatic.com/steam/apps/238960/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action RPG', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Dead by Daylight', 'dead-by-daylight', 'https://cdn.cloudflare.steamstatic.com/steam/apps/381210/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Horror', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Rocket League', 'rocket-league', 'https://cdn.cloudflare.steamstatic.com/steam/apps/252950/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Sports', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Elder Scrolls Online', 'elder-scrolls-online', 'https://cdn.cloudflare.steamstatic.com/steam/apps/306130/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'MMORPG', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('War Thunder', 'war-thunder', 'https://cdn.cloudflare.steamstatic.com/steam/apps/236390/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Terraria', 'terraria', 'https://cdn.cloudflare.steamstatic.com/steam/apps/105600/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile']::text[], 'Sandbox', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Euro Truck Simulator 2', 'euro-truck-simulator-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/227300/header.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Elden Ring', 'elden-ring', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Monster Hunter: World', 'monster-hunter-world', 'https://cdn.cloudflare.steamstatic.com/steam/apps/582010/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Hunt: Showdown', 'hunt-showdown', 'https://cdn.cloudflare.steamstatic.com/steam/apps/594650/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Escape from Tarkov', 'escape-from-tarkov', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1irs.jpg', ARRAY['PC']::text[], 'FPS', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Sea of Thieves', 'sea-of-thieves', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172620/header.jpg', ARRAY['PC', 'Xbox']::text[], 'Adventure', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('NARAKA: BLADEPOINT', 'naraka-bladepoint', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1203220/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Battle Royale', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Baldur''s Gate 3', 'baldurs-gate-3', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Lost Ark', 'lost-ark', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1599340/header.jpg', ARRAY['PC']::text[], 'MMORPG', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('New World', 'new-world', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1063730/header.jpg', ARRAY['PC']::text[], 'MMORPG', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Witcher 3: Wild Hunt', 'witcher-3', 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Cyberpunk 2077', 'cyberpunk-2077', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'RPG', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Hogwarts Legacy', 'hogwarts-legacy', 'https://cdn.cloudflare.steamstatic.com/steam/apps/990080/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Palworld', 'palworld', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1623730/header.jpg', ARRAY['PC', 'Xbox']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Lethal Company', 'lethal-company', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1966720/header.jpg', ARRAY['PC']::text[], 'Horror', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Helldivers 2', 'helldivers-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/553850/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Action', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Stardew Valley', 'stardew-valley', 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile']::text[], 'Simulation', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Valheim', 'valheim', 'https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg', ARRAY['PC', 'Xbox']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Among Us', 'among-us', 'https://cdn.cloudflare.steamstatic.com/steam/apps/945360/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile']::text[], 'Party', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Phasmophobia', 'phasmophobia', 'https://cdn.cloudflare.steamstatic.com/steam/apps/739630/header.jpg', ARRAY['PC']::text[], 'Horror', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Satisfactory', 'satisfactory', 'https://cdn.cloudflare.steamstatic.com/steam/apps/526870/header.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Deep Rock Galactic', 'deep-rock-galactic', 'https://cdn.cloudflare.steamstatic.com/steam/apps/548430/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Hades', 'hades', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Hades II', 'hades-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145350/header.jpg', ARRAY['PC']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Risk of Rain 2', 'risk-of-rain-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/632360/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Rimworld', 'rimworld', 'https://cdn.cloudflare.steamstatic.com/steam/apps/294100/header.jpg', ARRAY['PC']::text[], 'Simulation', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Cities: Skylines', 'cities-skylines', 'https://cdn.cloudflare.steamstatic.com/steam/apps/255710/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Simulation', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Cities: Skylines II', 'cities-skylines-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/949230/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Civilization VI', 'civilization-6', 'https://cdn.cloudflare.steamstatic.com/steam/apps/289070/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Strategy', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Total War: WARHAMMER III', 'total-war-warhammer-3', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1142710/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Crusader Kings III', 'crusader-kings-3', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1158310/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Europa Universalis IV', 'europa-universalis-4', 'https://cdn.cloudflare.steamstatic.com/steam/apps/236850/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Hearts of Iron IV', 'hearts-of-iron-4', 'https://cdn.cloudflare.steamstatic.com/steam/apps/394360/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Stellaris', 'stellaris', 'https://cdn.cloudflare.steamstatic.com/steam/apps/281990/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Age of Empires II: Definitive Edition', 'age-of-empires-2-de', 'https://cdn.cloudflare.steamstatic.com/steam/apps/813780/header.jpg', ARRAY['PC', 'Xbox']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Age of Empires IV', 'age-of-empires-4', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1466860/header.jpg', ARRAY['PC', 'Xbox']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Starcraft II', 'starcraft-2', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rs4.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Company of Heroes 3', 'company-of-heroes-3', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1677280/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('FIFA 24', 'ea-fc-24', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6p5e.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Sports', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('NBA 2K24', 'nba-2k24', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2338770/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Sports', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Madden NFL 24', 'madden-nfl-24', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6hxv.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Sports', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('F1 23', 'f1-23', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2108330/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Racing', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Forza Horizon 5', 'forza-horizon-5', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/header.jpg', ARRAY['PC', 'Xbox']::text[], 'Racing', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Gran Turismo 7', 'gran-turismo-7', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3dq5.jpg', ARRAY['PlayStation']::text[], 'Racing', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Assetto Corsa Competizione', 'assetto-corsa-competizione', 'https://cdn.cloudflare.steamstatic.com/steam/apps/805550/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Racing', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('iRacing', 'iracing', 'https://cdn.cloudflare.steamstatic.com/steam/apps/266410/header.jpg', ARRAY['PC']::text[], 'Racing', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Resident Evil 4 (2023)', 'resident-evil-4-2023', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2050650/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Horror', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Resident Evil Village', 'resident-evil-village', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1196590/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Horror', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Last of Us Part I', 'last-of-us-part-1', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1888930/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('God of War Ragnarok', 'god-of-war-ragnarok', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2322010/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('God of War (2018)', 'god-of-war-2018', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Horizon Zero Dawn', 'horizon-zero-dawn', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1151640/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Horizon Forbidden West', 'horizon-forbidden-west', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2420110/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Spider-Man Remastered', 'spider-man-remastered', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1817070/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Spider-Man: Miles Morales', 'spider-man-miles-morales', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1817190/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Ghost of Tsushima', 'ghost-of-tsushima', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2215430/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Sekiro: Shadows Die Twice', 'sekiro', 'https://cdn.cloudflare.steamstatic.com/steam/apps/814380/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Dark Souls III', 'dark-souls-3', 'https://cdn.cloudflare.steamstatic.com/steam/apps/374320/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Dark Souls Remastered', 'dark-souls-remastered', 'https://cdn.cloudflare.steamstatic.com/steam/apps/570940/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Bloodborne', 'bloodborne', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rba.jpg', ARRAY['PlayStation']::text[], 'Action RPG', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Armored Core VI', 'armored-core-6', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1888160/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Final Fantasy XIV', 'final-fantasy-14', 'https://cdn.cloudflare.steamstatic.com/steam/apps/39210/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'MMORPG', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Final Fantasy XVI', 'final-fantasy-16', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2515020/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Final Fantasy VII Rebirth', 'final-fantasy-7-rebirth', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6bcc.jpg', ARRAY['PlayStation']::text[], 'Action RPG', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Final Fantasy VII Remake', 'final-fantasy-7-remake', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1462040/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Dragon''s Dogma 2', 'dragons-dogma-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2054970/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Monster Hunter Rise', 'monster-hunter-rise', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1446780/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Street Fighter 6', 'street-fighter-6', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1364780/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Fighting', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Tekken 8', 'tekken-8', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1778820/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Fighting', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Mortal Kombat 1', 'mortal-kombat-1', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1971870/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Fighting', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Guilty Gear Strive', 'guilty-gear-strive', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1384160/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Fighting', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Dragon Ball FighterZ', 'dragon-ball-fighterz', 'https://cdn.cloudflare.steamstatic.com/steam/apps/678950/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Fighting', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Granblue Fantasy Versus: Rising', 'granblue-fantasy-versus-rising', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2157560/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Fighting', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Persona 5 Royal', 'persona-5-royal', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1687950/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Persona 3 Reload', 'persona-3-reload', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2161700/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Metaphor: ReFantazio', 'metaphor-refantazio', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2679460/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Like a Dragon: Infinite Wealth', 'like-a-dragon-infinite-wealth', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2072450/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Yakuza: Like a Dragon', 'yakuza-like-a-dragon', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1235140/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Diablo IV', 'diablo-4', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2344520/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action RPG', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Diablo II: Resurrected', 'diablo-2-resurrected', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2q5e.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Action RPG', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('World of Warcraft', 'world-of-warcraft', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2l7z.jpg', ARRAY['PC']::text[], 'MMORPG', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Hearthstone', 'hearthstone', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2dpf.jpg', ARRAY['PC', 'Mobile']::text[], 'Card Game', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Overwatch 2', 'overwatch-2', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5tkh.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'FPS', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Starfield', 'starfield', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1716740/header.jpg', ARRAY['PC', 'Xbox']::text[], 'RPG', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Elder Scrolls V: Skyrim', 'skyrim', 'https://cdn.cloudflare.steamstatic.com/steam/apps/489830/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Fallout 4', 'fallout-4', 'https://cdn.cloudflare.steamstatic.com/steam/apps/377160/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Fallout 76', 'fallout-76', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1151340/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'MMORPG', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('No Man''s Sky', 'no-mans-sky', 'https://cdn.cloudflare.steamstatic.com/steam/apps/275850/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Subnautica', 'subnautica', 'https://cdn.cloudflare.steamstatic.com/steam/apps/264710/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Survival', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Forest', 'the-forest', 'https://cdn.cloudflare.steamstatic.com/steam/apps/242760/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Survival', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Sons of the Forest', 'sons-of-the-forest', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1326470/header.jpg', ARRAY['PC']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('V Rising', 'v-rising', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1604030/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Grounded', 'grounded', 'https://cdn.cloudflare.steamstatic.com/steam/apps/962130/header.jpg', ARRAY['PC', 'Xbox']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Raft', 'raft', 'https://cdn.cloudflare.steamstatic.com/steam/apps/648800/header.jpg', ARRAY['PC']::text[], 'Survival', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Green Hell', 'green-hell', 'https://cdn.cloudflare.steamstatic.com/steam/apps/815370/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('7 Days to Die', '7-days-to-die', 'https://cdn.cloudflare.steamstatic.com/steam/apps/251570/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('DayZ', 'dayz', 'https://cdn.cloudflare.steamstatic.com/steam/apps/221100/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Enshrouded', 'enshrouded', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1203620/header.jpg', ARRAY['PC']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Astroneer', 'astroneer', 'https://cdn.cloudflare.steamstatic.com/steam/apps/361420/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Sunkenland', 'sunkenland', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2080690/header.jpg', ARRAY['PC']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Core Keeper', 'core-keeper', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1621690/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Hollow Knight', 'hollow-knight', 'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Metroidvania', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Hollow Knight: Silksong', 'hollow-knight-silksong', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1030300/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Metroidvania', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Celeste', 'celeste', 'https://cdn.cloudflare.steamstatic.com/steam/apps/504230/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Platformer', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Cuphead', 'cuphead', 'https://cdn.cloudflare.steamstatic.com/steam/apps/268910/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Platformer', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Dead Cells', 'dead-cells', 'https://cdn.cloudflare.steamstatic.com/steam/apps/588650/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Slay the Spire', 'slay-the-spire', 'https://cdn.cloudflare.steamstatic.com/steam/apps/646570/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Vampire Survivors', 'vampire-survivors', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1794680/header.jpg', ARRAY['PC', 'Xbox', 'Switch', 'Mobile']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Cult of the Lamb', 'cult-of-the-lamb', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1313140/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Enter the Gungeon', 'enter-the-gungeon', 'https://cdn.cloudflare.steamstatic.com/steam/apps/311690/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Returnal', 'returnal', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1649240/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Inscryption', 'inscryption', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1092790/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Card Game', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Balatro', 'balatro', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile']::text[], 'Card Game', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Marvel Snap', 'marvel-snap', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co581c.jpg', ARRAY['PC', 'Mobile']::text[], 'Card Game', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Yu-Gi-Oh! Master Duel', 'yugioh-master-duel', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1449850/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile']::text[], 'Card Game', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Legends of Runeterra', 'legends-of-runeterra', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co23rz.jpg', ARRAY['PC', 'Mobile']::text[], 'Card Game', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Magic: The Gathering Arena', 'mtg-arena', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1t8o.jpg', ARRAY['PC', 'Mobile']::text[], 'Card Game', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Gwent: The Witcher Card Game', 'gwent', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1284410/header.jpg', ARRAY['PC', 'Mobile']::text[], 'Card Game', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('It Takes Two', 'it-takes-two', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1426210/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('A Way Out', 'a-way-out', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1222700/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Unravel Two', 'unravel-two', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1225570/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Platformer', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Portal 2', 'portal-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/620/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Left 4 Dead 2', 'left-4-dead-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/550/header.jpg', ARRAY['PC', 'Xbox']::text[], 'FPS', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Back 4 Blood', 'back-4-blood', 'https://cdn.cloudflare.steamstatic.com/steam/apps/924970/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('World War Z', 'world-war-z', 'https://cdn.cloudflare.steamstatic.com/steam/apps/699130/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Action', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Payday 2', 'payday-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/218620/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Payday 3', 'payday-3', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1272080/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('GTFO', 'gtfo', 'https://cdn.cloudflare.steamstatic.com/steam/apps/493520/header.jpg', ARRAY['PC']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Outlast Trials', 'outlast-trials', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1304930/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Horror', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Killing Floor 2', 'killing-floor-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/232090/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Warhammer 40K: Darktide', 'warhammer-40k-darktide', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1361210/header.jpg', ARRAY['PC', 'Xbox']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Warhammer: Vermintide 2', 'warhammer-vermintide-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/552500/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Ready or Not', 'ready-or-not', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1144200/header.jpg', ARRAY['PC']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Ground Branch', 'ground-branch', 'https://cdn.cloudflare.steamstatic.com/steam/apps/16900/header.jpg', ARRAY['PC']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Squad', 'squad', 'https://cdn.cloudflare.steamstatic.com/steam/apps/393380/header.jpg', ARRAY['PC']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Hell Let Loose', 'hell-let-loose', 'https://cdn.cloudflare.steamstatic.com/steam/apps/686810/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Post Scriptum', 'post-scriptum', 'https://cdn.cloudflare.steamstatic.com/steam/apps/736220/header.jpg', ARRAY['PC']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Insurgency: Sandstorm', 'insurgency-sandstorm', 'https://cdn.cloudflare.steamstatic.com/steam/apps/581320/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Arma 3', 'arma-3', 'https://cdn.cloudflare.steamstatic.com/steam/apps/107410/header.jpg', ARRAY['PC']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Arma Reforger', 'arma-reforger', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1874880/header.jpg', ARRAY['PC', 'Xbox']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Rising Storm 2: Vietnam', 'rising-storm-2-vietnam', 'https://cdn.cloudflare.steamstatic.com/steam/apps/418460/header.jpg', ARRAY['PC']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Battlefield 2042', 'battlefield-2042', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1517290/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Battlefield V', 'battlefield-5', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1238810/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Battlefield 1', 'battlefield-1', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1238840/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Titanfall 2', 'titanfall-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1237970/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Division 2', 'the-division-2', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1ivi.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Looter Shooter', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Borderlands 3', 'borderlands-3', 'https://cdn.cloudflare.steamstatic.com/steam/apps/397540/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Looter Shooter', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Tiny Tina''s Wonderlands', 'tiny-tinas-wonderlands', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1286680/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Looter Shooter', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Outriders', 'outriders', 'https://cdn.cloudflare.steamstatic.com/steam/apps/680420/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Looter Shooter', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Remnant II', 'remnant-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1282100/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Looter Shooter', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Remnant: From the Ashes', 'remnant-from-the-ashes', 'https://cdn.cloudflare.steamstatic.com/steam/apps/617290/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Looter Shooter', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Doom Eternal', 'doom-eternal', 'https://cdn.cloudflare.steamstatic.com/steam/apps/782330/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'FPS', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Wolfenstein II: The New Colossus', 'wolfenstein-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/612880/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'FPS', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Metro Exodus', 'metro-exodus', 'https://cdn.cloudflare.steamstatic.com/steam/apps/412020/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('S.T.A.L.K.E.R. 2', 'stalker-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1643320/header.jpg', ARRAY['PC', 'Xbox']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Atomic Heart', 'atomic-heart', 'https://cdn.cloudflare.steamstatic.com/steam/apps/668580/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Control', 'control', 'https://cdn.cloudflare.steamstatic.com/steam/apps/870780/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Alan Wake 2', 'alan-wake-2', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6cl4.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Horror', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Lies of P', 'lies-of-p', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1627720/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Lords of the Fallen (2023)', 'lords-of-the-fallen-2023', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1501750/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action RPG', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Wo Long: Fallen Dynasty', 'wo-long-fallen-dynasty', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1448440/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Nioh 2', 'nioh-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1325200/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Code Vein', 'code-vein', 'https://cdn.cloudflare.steamstatic.com/steam/apps/678960/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Sifu', 'sifu', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2138710/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Ghostrunner', 'ghostrunner', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1139900/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Ghostrunner 2', 'ghostrunner-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2144740/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Hi-Fi Rush', 'hi-fi-rush', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1817230/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Ultrakill', 'ultrakill', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1229490/header.jpg', ARRAY['PC']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('DUSK', 'dusk', 'https://cdn.cloudflare.steamstatic.com/steam/apps/519860/header.jpg', ARRAY['PC', 'Switch']::text[], 'FPS', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Amid Evil', 'amid-evil', 'https://cdn.cloudflare.steamstatic.com/steam/apps/673130/header.jpg', ARRAY['PC']::text[], 'FPS', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Prodeus', 'prodeus', 'https://cdn.cloudflare.steamstatic.com/steam/apps/964800/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'FPS', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Warhammer 40K: Space Marine 2', 'warhammer-40k-space-marine-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2183900/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Star Wars Jedi: Survivor', 'star-wars-jedi-survivor', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1774580/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Star Wars Jedi: Fallen Order', 'star-wars-jedi-fallen-order', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172380/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Star Wars Battlefront II', 'star-wars-battlefront-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1237950/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Star Wars: Squadrons', 'star-wars-squadrons', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1222730/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Simulation', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Halo Infinite', 'halo-infinite', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1240440/header.jpg', ARRAY['PC', 'Xbox']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Halo: The Master Chief Collection', 'halo-mcc', 'https://cdn.cloudflare.steamstatic.com/steam/apps/976730/header.jpg', ARRAY['PC', 'Xbox']::text[], 'FPS', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Gears 5', 'gears-5', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1097840/header.jpg', ARRAY['PC', 'Xbox']::text[], 'Action', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Microsoft Flight Simulator', 'microsoft-flight-simulator', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1250410/header.jpg', ARRAY['PC', 'Xbox']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Elite Dangerous', 'elite-dangerous', 'https://cdn.cloudflare.steamstatic.com/steam/apps/359320/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Star Citizen', 'star-citizen', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5jym.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('X4: Foundations', 'x4-foundations', 'https://cdn.cloudflare.steamstatic.com/steam/apps/392160/header.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Kerbal Space Program', 'kerbal-space-program', 'https://cdn.cloudflare.steamstatic.com/steam/apps/220200/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Simulation', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Kerbal Space Program 2', 'kerbal-space-program-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/954850/header.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('American Truck Simulator', 'american-truck-simulator', 'https://cdn.cloudflare.steamstatic.com/steam/apps/270880/header.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Farming Simulator 22', 'farming-simulator-22', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1248130/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Snowrunner', 'snowrunner', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1465360/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Train Sim World 4', 'train-sim-world-4', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2362411/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Planet Zoo', 'planet-zoo', 'https://cdn.cloudflare.steamstatic.com/steam/apps/703080/header.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Planet Coaster', 'planet-coaster', 'https://cdn.cloudflare.steamstatic.com/steam/apps/493340/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Simulation', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Jurassic World Evolution 2', 'jurassic-world-evolution-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1244460/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Two Point Hospital', 'two-point-hospital', 'https://cdn.cloudflare.steamstatic.com/steam/apps/535930/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Simulation', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Two Point Campus', 'two-point-campus', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1649080/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Oxygen Not Included', 'oxygen-not-included', 'https://cdn.cloudflare.steamstatic.com/steam/apps/457140/header.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Frostpunk', 'frostpunk', 'https://cdn.cloudflare.steamstatic.com/steam/apps/323190/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Simulation', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Frostpunk 2', 'frostpunk-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1601580/header.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Factorio', 'factorio', 'https://cdn.cloudflare.steamstatic.com/steam/apps/427520/header.jpg', ARRAY['PC', 'Switch']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Dyson Sphere Program', 'dyson-sphere-program', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1366540/header.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Shapez', 'shapez', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1318690/header.jpg', ARRAY['PC']::text[], 'Puzzle', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Mindustry', 'mindustry', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1127400/header.jpg', ARRAY['PC', 'Mobile']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Against the Storm', 'against-the-storm', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1336490/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Manor Lords', 'manor-lords', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1363080/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Farthest Frontier', 'farthest-frontier', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1044720/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Going Medieval', 'going-medieval', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1029780/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Foundation', 'foundation', 'https://cdn.cloudflare.steamstatic.com/steam/apps/690830/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Banished', 'banished', 'https://cdn.cloudflare.steamstatic.com/steam/apps/242920/header.jpg', ARRAY['PC']::text[], 'Strategy', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Anno 1800', 'anno-1800', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1u7w.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Tropico 6', 'tropico-6', 'https://cdn.cloudflare.steamstatic.com/steam/apps/492720/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Northgard', 'northgard', 'https://cdn.cloudflare.steamstatic.com/steam/apps/466560/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Dune: Spice Wars', 'dune-spice-wars', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1605220/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Homeworld 3', 'homeworld-3', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1840080/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Ashes of the Singularity', 'ashes-of-the-singularity', 'https://cdn.cloudflare.steamstatic.com/steam/apps/507490/header.jpg', ARRAY['PC']::text[], 'Strategy', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('They Are Billions', 'they-are-billions', 'https://cdn.cloudflare.steamstatic.com/steam/apps/644930/header.jpg', ARRAY['PC']::text[], 'Strategy', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Creeper World 4', 'creeper-world-4', 'https://cdn.cloudflare.steamstatic.com/steam/apps/848480/header.jpg', ARRAY['PC']::text[], 'Strategy', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('XCOM 2', 'xcom-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/268500/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Strategy', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Phoenix Point', 'phoenix-point', 'https://cdn.cloudflare.steamstatic.com/steam/apps/839770/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Strategy', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Jagged Alliance 3', 'jagged-alliance-3', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1084160/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Wartales', 'wartales', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1527950/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Battle Brothers', 'battle-brothers', 'https://cdn.cloudflare.steamstatic.com/steam/apps/365360/header.jpg', ARRAY['PC', 'Switch']::text[], 'Strategy', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Darkest Dungeon', 'darkest-dungeon', 'https://cdn.cloudflare.steamstatic.com/steam/apps/262060/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Darkest Dungeon II', 'darkest-dungeon-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1940340/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('BATTLETECH', 'battletech', 'https://cdn.cloudflare.steamstatic.com/steam/apps/637090/header.jpg', ARRAY['PC']::text[], 'Strategy', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('MechWarrior 5: Mercenaries', 'mechwarrior-5', 'https://cdn.cloudflare.steamstatic.com/steam/apps/784080/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Satisfactory', 'satisfactory', 'https://cdn.cloudflare.steamstatic.com/steam/apps/526870/header.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Stationeers', 'stationeers', 'https://cdn.cloudflare.steamstatic.com/steam/apps/544550/header.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Space Engineers', 'space-engineers', 'https://cdn.cloudflare.steamstatic.com/steam/apps/244850/header.jpg', ARRAY['PC', 'Xbox']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Empyrion', 'empyrion-galactic-survival', 'https://cdn.cloudflare.steamstatic.com/steam/apps/383120/header.jpg', ARRAY['PC']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Captain of Industry', 'captain-of-industry', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1594320/header.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Workers & Resources: Soviet Republic', 'workers-resources', 'https://cdn.cloudflare.steamstatic.com/steam/apps/784150/header.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Timberborn', 'timberborn', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1062090/header.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Songs of Syx', 'songs-of-syx', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1162750/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Kingdoms Reborn', 'kingdoms-reborn', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1307890/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Patron', 'patron', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1538570/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Settlement Survival', 'settlement-survival', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1309950/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Diplomacy is Not an Option', 'diplomacy-is-not-an-option', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1272320/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Riftbreaker', 'riftbreaker', 'https://cdn.cloudflare.steamstatic.com/steam/apps/780310/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Rogue Tower', 'rogue-tower', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1843760/header.jpg', ARRAY['PC']::text[], 'Strategy', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Bloons TD 6', 'bloons-td-6', 'https://cdn.cloudflare.steamstatic.com/steam/apps/960090/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Kingdom Two Crowns', 'kingdom-two-crowns', 'https://cdn.cloudflare.steamstatic.com/steam/apps/701160/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('They Are Billions', 'they-are-billions', 'https://cdn.cloudflare.steamstatic.com/steam/apps/644930/header.jpg', ARRAY['PC']::text[], 'Strategy', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Orcs Must Die! 3', 'orcs-must-die-3', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1522820/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Strategy', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Dungeon Defenders: Going Rogue', 'dungeon-defenders-going-rogue', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1401510/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Soulstone Survivors', 'soulstone-survivors', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2066020/header.jpg', ARRAY['PC']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Brotato', 'brotato', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1942280/header.jpg', ARRAY['PC', 'Switch', 'Mobile']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('20 Minutes Till Dawn', '20-minutes-till-dawn', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1966900/header.jpg', ARRAY['PC', 'Switch', 'Mobile']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Nova Drift', 'nova-drift', 'https://cdn.cloudflare.steamstatic.com/steam/apps/858210/header.jpg', ARRAY['PC']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Gunfire Reborn', 'gunfire-reborn', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1217060/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Roboquest', 'roboquest', 'https://cdn.cloudflare.steamstatic.com/steam/apps/692890/header.jpg', ARRAY['PC', 'Xbox']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Wizard of Legend', 'wizard-of-legend', 'https://cdn.cloudflare.steamstatic.com/steam/apps/445980/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Noita', 'noita', 'https://cdn.cloudflare.steamstatic.com/steam/apps/881100/header.jpg', ARRAY['PC']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Loop Hero', 'loop-hero', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1282730/header.jpg', ARRAY['PC', 'Switch', 'Mobile']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Monster Train', 'monster-train', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1102190/header.jpg', ARRAY['PC', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Gordian Quest', 'gordian-quest', 'https://cdn.cloudflare.steamstatic.com/steam/apps/981430/header.jpg', ARRAY['PC']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Griftlands', 'griftlands', 'https://cdn.cloudflare.steamstatic.com/steam/apps/601840/header.jpg', ARRAY['PC', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Roguebook', 'roguebook', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1076200/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Across the Obelisk', 'across-the-obelisk', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1385380/header.jpg', ARRAY['PC']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Arcanium', 'arcanium', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1056360/header.jpg', ARRAY['PC']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Tainted Grail: Conquest', 'tainted-grail-conquest', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1199030/header.jpg', ARRAY['PC']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Fights in Tight Spaces', 'fights-in-tight-spaces', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1265820/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Neon Abyss', 'neon-abyss', 'https://cdn.cloudflare.steamstatic.com/steam/apps/788100/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Skul: The Hero Slayer', 'skul-hero-slayer', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1147560/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Crown Trick', 'crown-trick', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1000010/header.jpg', ARRAY['PC', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Curse of the Dead Gods', 'curse-of-the-dead-gods', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1123770/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Going Under', 'going-under', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1154810/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Dreamscaper', 'dreamscaper', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1040420/header.jpg', ARRAY['PC', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Spelunky 2', 'spelunky-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/418530/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Disc Room', 'disc-room', 'https://cdn.cloudflare.steamstatic.com/steam/apps/839550/header.jpg', ARRAY['PC', 'Switch']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Downwell', 'downwell', 'https://cdn.cloudflare.steamstatic.com/steam/apps/360740/header.jpg', ARRAY['PC', 'PlayStation', 'Switch', 'Mobile']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Geometry Dash', 'geometry-dash', 'https://cdn.cloudflare.steamstatic.com/steam/apps/322170/header.jpg', ARRAY['PC', 'Mobile']::text[], 'Platformer', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Super Meat Boy', 'super-meat-boy', 'https://cdn.cloudflare.steamstatic.com/steam/apps/40800/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Platformer', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Super Meat Boy Forever', 'super-meat-boy-forever', 'https://cdn.cloudflare.steamstatic.com/steam/apps/581660/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Platformer', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Shovel Knight', 'shovel-knight', 'https://cdn.cloudflare.steamstatic.com/steam/apps/250760/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Platformer', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Ori and the Will of the Wisps', 'ori-will-of-the-wisps', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1057090/header.jpg', ARRAY['PC', 'Xbox', 'Switch']::text[], 'Platformer', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Ori and the Blind Forest', 'ori-blind-forest', 'https://cdn.cloudflare.steamstatic.com/steam/apps/387290/header.jpg', ARRAY['PC', 'Xbox', 'Switch']::text[], 'Platformer', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Metroid Dread', 'metroid-dread', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3sa4.jpg', ARRAY['Switch']::text[], 'Metroidvania', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Blasphemous 2', 'blasphemous-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2114740/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Metroidvania', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Blasphemous', 'blasphemous', 'https://cdn.cloudflare.steamstatic.com/steam/apps/774361/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Metroidvania', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Salt and Sanctuary', 'salt-and-sanctuary', 'https://cdn.cloudflare.steamstatic.com/steam/apps/283640/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Metroidvania', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Salt and Sacrifice', 'salt-and-sacrifice', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1437400/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Metroidvania', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Bloodstained: Ritual of the Night', 'bloodstained-ritual-of-the-night', 'https://cdn.cloudflare.steamstatic.com/steam/apps/692850/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Metroidvania', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Messenger', 'the-messenger', 'https://cdn.cloudflare.steamstatic.com/steam/apps/764790/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Metroidvania', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Axiom Verge 2', 'axiom-verge-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1698020/header.jpg', ARRAY['PC', 'PlayStation', 'Switch']::text[], 'Metroidvania', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('F-Zero 99', 'f-zero-99', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6quc.jpg', ARRAY['Switch']::text[], 'Racing', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Mario Kart 8 Deluxe', 'mario-kart-8-deluxe', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co23jc.jpg', ARRAY['Switch']::text[], 'Racing', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Splatoon 3', 'splatoon-3', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4vbh.jpg', ARRAY['Switch']::text[], 'Action', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Super Smash Bros. Ultimate', 'super-smash-bros-ultimate', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2255.jpg', ARRAY['Switch']::text[], 'Fighting', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Legend of Zelda: Tears of the Kingdom', 'zelda-tears-of-the-kingdom', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg', ARRAY['Switch']::text[], 'Adventure', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Animal Crossing: New Horizons', 'animal-crossing-new-horizons', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3wls.jpg', ARRAY['Switch']::text[], 'Simulation', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Pokemon Scarlet & Violet', 'pokemon-scarlet-violet', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmp.jpg', ARRAY['Switch']::text[], 'RPG', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Fire Emblem Engage', 'fire-emblem-engage', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vbt.jpg', ARRAY['Switch']::text[], 'Strategy', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Xenoblade Chronicles 3', 'xenoblade-chronicles-3', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4prz.jpg', ARRAY['Switch']::text[], 'RPG', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('League of Legends', 'league-of-legends', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co49wj.jpg', ARRAY['PC']::text[], 'MOBA', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Valorant', 'valorant', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2mvt.jpg', ARRAY['PC']::text[], 'FPS', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Fortnite', 'fortnite', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3wk8.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile']::text[], 'Battle Royale', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Genshin Impact', 'genshin-impact', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2d.jpg', ARRAY['PC', 'PlayStation', 'Mobile']::text[], 'Action RPG', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Honkai: Star Rail', 'honkai-star-rail', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5w3k.jpg', ARRAY['PC', 'PlayStation', 'Mobile']::text[], 'Turn-based RPG', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Zenless Zone Zero', 'zenless-zone-zero', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7m8u.jpg', ARRAY['PC', 'PlayStation', 'Mobile']::text[], 'Action RPG', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Call of Duty: Warzone', 'call-of-duty-warzone', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2ket.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Battle Royale', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Call of Duty: Modern Warfare III', 'call-of-duty-mw3-2023', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6xi4.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Call of Duty: Modern Warfare II', 'call-of-duty-mw2-2022', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5psk.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Minecraft', 'minecraft', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co49x5.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile']::text[], 'Sandbox', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Roblox', 'roblox', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rog.jpg', ARRAY['PC', 'Xbox', 'Mobile']::text[], 'Platform', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Binding of Isaac: Rebirth', 'binding-of-isaac-rebirth', 'https://cdn.cloudflare.steamstatic.com/steam/apps/250900/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Dont Starve Together', 'dont-starve-together', 'https://cdn.cloudflare.steamstatic.com/steam/apps/322330/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Undertale', 'undertale', 'https://cdn.cloudflare.steamstatic.com/steam/apps/391540/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Deltarune', 'deltarune', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1671210/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'RPG', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('FTL: Faster Than Light', 'ftl-faster-than-light', 'https://cdn.cloudflare.steamstatic.com/steam/apps/212680/header.jpg', ARRAY['PC', 'Mobile']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Into the Breach', 'into-the-breach', 'https://cdn.cloudflare.steamstatic.com/steam/apps/590380/header.jpg', ARRAY['PC', 'Switch', 'Mobile']::text[], 'Strategy', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Papers Please', 'papers-please', 'https://cdn.cloudflare.steamstatic.com/steam/apps/239030/header.jpg', ARRAY['PC', 'Mobile']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Return of the Obra Dinn', 'return-of-the-obra-dinn', 'https://cdn.cloudflare.steamstatic.com/steam/apps/653530/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Outer Wilds', 'outer-wilds', 'https://cdn.cloudflare.steamstatic.com/steam/apps/753640/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Disco Elysium', 'disco-elysium', 'https://cdn.cloudflare.steamstatic.com/steam/apps/632470/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Tunic', 'tunic', 'https://cdn.cloudflare.steamstatic.com/steam/apps/553420/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Action Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Deaths Door', 'deaths-door', 'https://cdn.cloudflare.steamstatic.com/steam/apps/894020/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Action Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Rain World', 'rain-world', 'https://cdn.cloudflare.steamstatic.com/steam/apps/312520/header.jpg', ARRAY['PC', 'PlayStation', 'Switch']::text[], 'Adventure', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Baba Is You', 'baba-is-you', 'https://cdn.cloudflare.steamstatic.com/steam/apps/736260/header.jpg', ARRAY['PC', 'Switch', 'Mobile']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Hotline Miami', 'hotline-miami', 'https://cdn.cloudflare.steamstatic.com/steam/apps/219150/header.jpg', ARRAY['PC', 'PlayStation', 'Switch']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Hotline Miami 2: Wrong Number', 'hotline-miami-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/274170/header.jpg', ARRAY['PC', 'PlayStation', 'Switch']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Hyper Light Drifter', 'hyper-light-drifter', 'https://cdn.cloudflare.steamstatic.com/steam/apps/257850/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Inside', 'inside', 'https://cdn.cloudflare.steamstatic.com/steam/apps/304430/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Puzzle Platformer', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Limbo', 'limbo', 'https://cdn.cloudflare.steamstatic.com/steam/apps/48000/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile']::text[], 'Puzzle Platformer', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Little Nightmares', 'little-nightmares', 'https://cdn.cloudflare.steamstatic.com/steam/apps/424840/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Horror', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Little Nightmares II', 'little-nightmares-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/860510/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Horror', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Spiritfarer', 'spiritfarer', 'https://cdn.cloudflare.steamstatic.com/steam/apps/972660/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Firewatch', 'firewatch', 'https://cdn.cloudflare.steamstatic.com/steam/apps/383870/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Stanley Parable: Ultra Deluxe', 'stanley-parable-ultra-deluxe', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1703340/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('What Remains of Edith Finch', 'what-remains-of-edith-finch', 'https://cdn.cloudflare.steamstatic.com/steam/apps/501300/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Night in the Woods', 'night-in-the-woods', 'https://cdn.cloudflare.steamstatic.com/steam/apps/481510/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Darkwood', 'darkwood', 'https://cdn.cloudflare.steamstatic.com/steam/apps/274520/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Horror', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('SOMA', 'soma', 'https://cdn.cloudflare.steamstatic.com/steam/apps/282140/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Horror', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Amnesia: The Bunker', 'amnesia-the-bunker', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1944430/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Horror', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Visage', 'visage', 'https://cdn.cloudflare.steamstatic.com/steam/apps/594330/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Horror', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Layers of Fear', 'layers-of-fear', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1128300/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Horror', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Project Zomboid', 'project-zomboid', 'https://cdn.cloudflare.steamstatic.com/steam/apps/108600/header.jpg', ARRAY['PC']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Kenshi', 'kenshi', 'https://cdn.cloudflare.steamstatic.com/steam/apps/233860/header.jpg', ARRAY['PC']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Mount and Blade II: Bannerlord', 'mount-blade-2-bannerlord', 'https://cdn.cloudflare.steamstatic.com/steam/apps/261550/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'RPG', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Barotrauma', 'barotrauma', 'https://cdn.cloudflare.steamstatic.com/steam/apps/602960/header.jpg', ARRAY['PC']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Starbound', 'starbound', 'https://cdn.cloudflare.steamstatic.com/steam/apps/211820/header.jpg', ARRAY['PC']::text[], 'Sandbox', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Human: Fall Flat', 'human-fall-flat', 'https://cdn.cloudflare.steamstatic.com/steam/apps/477160/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Puzzle', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Gang Beasts', 'gang-beasts', 'https://cdn.cloudflare.steamstatic.com/steam/apps/285900/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Party', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Stick Fight: The Game', 'stick-fight-the-game', 'https://cdn.cloudflare.steamstatic.com/steam/apps/674940/header.jpg', ARRAY['PC', 'Switch']::text[], 'Party', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Ultimate Chicken Horse', 'ultimate-chicken-horse', 'https://cdn.cloudflare.steamstatic.com/steam/apps/386940/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Party', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('SpeedRunners', 'speedrunners', 'https://cdn.cloudflare.steamstatic.com/steam/apps/207140/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Racing', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Party Animals', 'party-animals', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1260320/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Party', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Golf With Your Friends', 'golf-with-your-friends', 'https://cdn.cloudflare.steamstatic.com/steam/apps/431240/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Sports', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Pummel Party', 'pummel-party', 'https://cdn.cloudflare.steamstatic.com/steam/apps/880940/header.jpg', ARRAY['PC']::text[], 'Party', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('PlateUp', 'plateup', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1599600/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Overcooked! All You Can Eat', 'overcooked-all-you-can-eat', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1243830/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Party', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Unrailed', 'unrailed', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1016920/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Party', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Content Warning', 'content-warning', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2881650/header.jpg', ARRAY['PC']::text[], 'Horror', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Supermarket Simulator', 'supermarket-simulator', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2670630/header.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Dave the Diver', 'dave-the-diver', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1868140/header.jpg', ARRAY['PC', 'PlayStation', 'Switch']::text[], 'Adventure', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Dredge', 'dredge', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1562430/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Another Crabs Treasure', 'another-crabs-treasure', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1887840/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Sea of Stars', 'sea-of-stars', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1244090/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Chained Echoes', 'chained-echoes', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1229240/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Citizen Sleeper', 'citizen-sleeper', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1578650/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Bomb Rush Cyberfunk', 'bomb-rush-cyberfunk', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1353230/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Tinykin', 'tinykin', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1599020/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Platformer', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Chicory: A Colorful Tale', 'chicory-a-colorful-tale', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1123450/header.jpg', ARRAY['PC', 'PlayStation', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Untitled Goose Game', 'untitled-goose-game', 'https://cdn.cloudflare.steamstatic.com/steam/apps/837470/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('A Short Hike', 'a-short-hike', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1055540/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Luck be a Landlord', 'luck-be-a-landlord', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1404850/header.jpg', ARRAY['PC', 'Switch', 'Mobile']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Backpack Hero', 'backpack-hero', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1970580/header.jpg', ARRAY['PC', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Stacklands', 'stacklands', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1948280/header.jpg', ARRAY['PC']::text[], 'Card Game', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Buckshot Roulette', 'buckshot-roulette', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2835570/header.jpg', ARRAY['PC']::text[], 'Horror', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Halls of Torment', 'halls-of-torment', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2218750/header.jpg', ARRAY['PC']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Children of Morta', 'children-of-morta', 'https://cdn.cloudflare.steamstatic.com/steam/apps/330020/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Moonlighter', 'moonlighter', 'https://cdn.cloudflare.steamstatic.com/steam/apps/606150/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('My Time at Portia', 'my-time-at-portia', 'https://cdn.cloudflare.steamstatic.com/steam/apps/666140/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Simulation', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('My Time at Sandrock', 'my-time-at-sandrock', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1084600/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Beat Saber', 'beat-saber', 'https://cdn.cloudflare.steamstatic.com/steam/apps/620980/header.jpg', ARRAY['PC']::text[], 'VR Rhythm', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Blade and Sorcery', 'blade-and-sorcery', 'https://cdn.cloudflare.steamstatic.com/steam/apps/629730/header.jpg', ARRAY['PC']::text[], 'VR Action', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Boneworks', 'boneworks', 'https://cdn.cloudflare.steamstatic.com/steam/apps/823500/header.jpg', ARRAY['PC']::text[], 'VR Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Bonelab', 'bonelab', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1592190/header.jpg', ARRAY['PC']::text[], 'VR Action', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Half-Life: Alyx', 'half-life-alyx', 'https://cdn.cloudflare.steamstatic.com/steam/apps/546560/header.jpg', ARRAY['PC']::text[], 'VR FPS', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Pavlov VR', 'pavlov-vr', 'https://cdn.cloudflare.steamstatic.com/steam/apps/555160/header.jpg', ARRAY['PC']::text[], 'VR FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('VRChat', 'vrchat', 'https://cdn.cloudflare.steamstatic.com/steam/apps/438100/header.jpg', ARRAY['PC']::text[], 'VR Social', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Gorilla Tag', 'gorilla-tag', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1533390/header.jpg', ARRAY['PC']::text[], 'VR Party', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Songs of Conquest', 'songs-of-conquest', 'https://cdn.cloudflare.steamstatic.com/steam/apps/867210/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Old World', 'old-world', 'https://cdn.cloudflare.steamstatic.com/steam/apps/597180/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Humankind', 'humankind', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1124300/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Octopath Traveler II', 'octopath-traveler-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1971650/header.jpg', ARRAY['PC', 'PlayStation', 'Switch']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Triangle Strategy', 'triangle-strategy', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1850510/header.jpg', ARRAY['PC', 'Switch']::text[], 'Strategy RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Dicey Dungeons', 'dicey-dungeons', 'https://cdn.cloudflare.steamstatic.com/steam/apps/861540/header.jpg', ARRAY['PC', 'Switch', 'Mobile']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('One Step From Eden', 'one-step-from-eden', 'https://cdn.cloudflare.steamstatic.com/steam/apps/960690/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Bad North', 'bad-north', 'https://cdn.cloudflare.steamstatic.com/steam/apps/688420/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile']::text[], 'Strategy', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Pico Park', 'pico-park', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1509960/header.jpg', ARRAY['PC', 'Switch']::text[], 'Party', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Getting Over It with Bennett Foddy', 'getting-over-it', 'https://cdn.cloudflare.steamstatic.com/steam/apps/240720/header.jpg', ARRAY['PC', 'Mobile']::text[], 'Platformer', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Jump King', 'jump-king', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1061090/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Platformer', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Pogostuck', 'pogostuck', 'https://cdn.cloudflare.steamstatic.com/steam/apps/688130/header.jpg', ARRAY['PC']::text[], 'Platformer', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Only Up', 'only-up', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2381590/header.jpg', ARRAY['PC']::text[], 'Platformer', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('I Wanna Be The Guy', 'i-wanna-be-the-guy', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1y6h.jpg', ARRAY['PC']::text[], 'Platformer', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Katana ZERO', 'katana-zero', 'https://cdn.cloudflare.steamstatic.com/steam/apps/460950/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Neon White', 'neon-white', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1533420/header.jpg', ARRAY['PC', 'PlayStation', 'Switch']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Broforce', 'broforce', 'https://cdn.cloudflare.steamstatic.com/steam/apps/274190/header.jpg', ARRAY['PC', 'PlayStation', 'Switch']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Anger Foot', 'anger-foot', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1978590/header.jpg', ARRAY['PC']::text[], 'Action', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Turbo Overkill', 'turbo-overkill', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1328350/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Selaco', 'selaco', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1592280/header.jpg', ARRAY['PC']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Wrath: Aeon of Ruin', 'wrath-aeon-of-ruin', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1000410/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Graven', 'graven', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1371690/header.jpg', ARRAY['PC']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Gloomwood', 'gloomwood', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1150760/header.jpg', ARRAY['PC']::text[], 'Stealth', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Signalis', 'signalis', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1262350/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Horror', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Norco', 'norco', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1221250/header.jpg', ARRAY['PC', 'PlayStation', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Roadwarden', 'roadwarden', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1155970/header.jpg', ARRAY['PC', 'Switch']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Case of the Golden Idol', 'case-of-the-golden-idol', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1677770/header.jpg', ARRAY['PC', 'Switch']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Voices of the Void', 'voices-of-the-void', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2377550/header.jpg', ARRAY['PC']::text[], 'Horror', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Iron Lung', 'iron-lung', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1846170/header.jpg', ARRAY['PC']::text[], 'Horror', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Suika Game', 'suika-game', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2683020/header.jpg', ARRAY['PC', 'Switch']::text[], 'Puzzle', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Lethal Company', 'lethal-company', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1966720/header.jpg', ARRAY['PC']::text[], 'Horror', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Webbed', 'webbed', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1390350/header.jpg', ARRAY['PC', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Eastward', 'eastward', 'https://cdn.cloudflare.steamstatic.com/steam/apps/977880/header.jpg', ARRAY['PC', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Cassette Beasts', 'cassette-beasts', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1321440/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Coromon', 'coromon', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1218210/header.jpg', ARRAY['PC', 'Switch', 'Mobile']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Temtem', 'temtem', 'https://cdn.cloudflare.steamstatic.com/steam/apps/745920/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'RPG', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Boyfriend Dungeon', 'boyfriend-dungeon', 'https://cdn.cloudflare.steamstatic.com/steam/apps/674930/header.jpg', ARRAY['PC', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Unpacking', 'unpacking', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1135690/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Wobbly Life', 'wobbly-life', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1211020/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Sandbox', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Slime Rancher 2', 'slime-rancher-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1657630/header.jpg', ARRAY['PC', 'Xbox']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Slime Rancher', 'slime-rancher', 'https://cdn.cloudflare.steamstatic.com/steam/apps/433340/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Simulation', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Subnautica: Below Zero', 'subnautica-below-zero', 'https://cdn.cloudflare.steamstatic.com/steam/apps/848450/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Survival', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Wandersong', 'wandersong', 'https://cdn.cloudflare.steamstatic.com/steam/apps/530320/header.jpg', ARRAY['PC', 'PlayStation', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Later Alligator', 'later-alligator', 'https://cdn.cloudflare.steamstatic.com/steam/apps/966320/header.jpg', ARRAY['PC', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Frog Detective 3', 'frog-detective-3', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1292030/header.jpg', ARRAY['PC', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Peglin', 'peglin', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1296610/header.jpg', ARRAY['PC', 'Switch']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Against the Storm', 'against-the-storm', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1336490/header.jpg', ARRAY['PC']::text[], 'Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Wildfrost', 'wildfrost', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1811990/header.jpg', ARRAY['PC', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Cobalt Core', 'cobalt-core', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2179850/header.jpg', ARRAY['PC', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Slice and Dice', 'slice-and-dice', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1775490/header.jpg', ARRAY['PC', 'Mobile']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Shogun Showdown', 'shogun-showdown', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2084000/header.jpg', ARRAY['PC']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Void Stranger', 'void-stranger', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2121980/header.jpg', ARRAY['PC']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Patrick Parabox', 'patricks-parabox', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1260520/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Cocoon', 'cocoon', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1497440/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Viewfinder', 'viewfinder', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1382070/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Islets', 'islets', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1669420/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Metroidvania', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Pronty', 'pronty', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1250080/header.jpg', ARRAY['PC', 'Switch']::text[], 'Metroidvania', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Aeterna Noctis', 'aeterna-noctis', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1517970/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Metroidvania', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Haiku the Robot', 'haiku-the-robot', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1353620/header.jpg', ARRAY['PC', 'Switch']::text[], 'Metroidvania', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Gato Roboto', 'gato-roboto', 'https://cdn.cloudflare.steamstatic.com/steam/apps/916730/header.jpg', ARRAY['PC', 'Switch']::text[], 'Metroidvania', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Last Faith', 'the-last-faith', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1274600/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Metroidvania', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('9 Years of Shadows', '9-years-of-shadows', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1733560/header.jpg', ARRAY['PC', 'Switch']::text[], 'Metroidvania', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Ultros', 'ultros', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1709770/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Metroidvania', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Animal Well', 'animal-well', 'https://cdn.cloudflare.steamstatic.com/steam/apps/813230/header.jpg', ARRAY['PC', 'PlayStation', 'Switch']::text[], 'Metroidvania', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('1000xResist', '1000xresist', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1675830/header.jpg', ARRAY['PC', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Lorelei and the Laser Eyes', 'lorelei-and-the-laser-eyes', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2008920/header.jpg', ARRAY['PC', 'Switch']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Arco', 'arco', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2366970/header.jpg', ARRAY['PC']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Thank Goodness Youre Here', 'thank-goodness-youre-here', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2366980/header.jpg', ARRAY['PC', 'PlayStation', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Neva', 'neva', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1443490/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Crow Country', 'crow-country', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1996010/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Horror', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Mouthwashing', 'mouthwashing', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2475490/header.jpg', ARRAY['PC']::text[], 'Horror', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Demonschool', 'demonschool', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1900480/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Strategy RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Tactical Breach Wizards', 'tactical-breach-wizards', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1043810/header.jpg', ARRAY['PC']::text[], 'Strategy', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Caves of Qud', 'caves-of-qud', 'https://cdn.cloudflare.steamstatic.com/steam/apps/333640/header.jpg', ARRAY['PC']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Cogmind', 'cogmind', 'https://cdn.cloudflare.steamstatic.com/steam/apps/722730/header.jpg', ARRAY['PC']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Dwarf Fortress', 'dwarf-fortress', 'https://cdn.cloudflare.steamstatic.com/steam/apps/975370/header.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Cataclysm: Dark Days Ahead', 'cataclysm-dda', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co24xm.jpg', ARRAY['PC']::text[], 'Roguelike', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('ADOM', 'adom', 'https://cdn.cloudflare.steamstatic.com/steam/apps/333300/header.jpg', ARRAY['PC']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Tales of Maj Eyal', 'tales-of-maj-eyal', 'https://cdn.cloudflare.steamstatic.com/steam/apps/259680/header.jpg', ARRAY['PC']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Stoneshard', 'stoneshard', 'https://cdn.cloudflare.steamstatic.com/steam/apps/625960/header.jpg', ARRAY['PC']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Jupiter Hell', 'jupiter-hell', 'https://cdn.cloudflare.steamstatic.com/steam/apps/811320/header.jpg', ARRAY['PC']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Streets of Rogue 2', 'streets-of-rogue-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2140820/header.jpg', ARRAY['PC']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Streets of Rogue', 'streets-of-rogue', 'https://cdn.cloudflare.steamstatic.com/steam/apps/512900/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Dungeon Crawl Stone Soup', 'dungeon-crawl-stone-soup', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1ygq.jpg', ARRAY['PC']::text[], 'Roguelike', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Vagante', 'vagante', 'https://cdn.cloudflare.steamstatic.com/steam/apps/323220/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Roguelike', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Crawl', 'crawl', 'https://cdn.cloudflare.steamstatic.com/steam/apps/293780/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('TowerFall Ascension', 'towerfall-ascension', 'https://cdn.cloudflare.steamstatic.com/steam/apps/251470/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Samurai Gunn 2', 'samurai-gunn-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1397790/header.jpg', ARRAY['PC', 'Switch']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Rivals of Aether', 'rivals-of-aether', 'https://cdn.cloudflare.steamstatic.com/steam/apps/383980/header.jpg', ARRAY['PC', 'Xbox', 'Switch']::text[], 'Fighting', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Rivals 2', 'rivals-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2217000/header.jpg', ARRAY['PC']::text[], 'Fighting', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Brawlhalla', 'brawlhalla', 'https://cdn.cloudflare.steamstatic.com/steam/apps/291550/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile']::text[], 'Fighting', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('MultiVersus', 'multiversus', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1818750/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Fighting', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Nickelodeon All-Star Brawl 2', 'nickelodeon-all-star-brawl-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2015460/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Fighting', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Them''s Fightin'' Herds', 'thems-fightin-herds', 'https://cdn.cloudflare.steamstatic.com/steam/apps/574980/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Fighting', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Skullgirls 2nd Encore', 'skullgirls-2nd-encore', 'https://cdn.cloudflare.steamstatic.com/steam/apps/245170/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Fighting', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Lethal League Blaze', 'lethal-league-blaze', 'https://cdn.cloudflare.steamstatic.com/steam/apps/553310/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Fighting', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Footsies', 'footsies', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1344740/header.jpg', ARRAY['PC']::text[], 'Fighting', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Pocket Bravery', 'pocket-bravery', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1586380/header.jpg', ARRAY['PC']::text[], 'Fighting', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Breakers Collection', 'breakers-collection', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1746170/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Fighting', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Art of Rally', 'art-of-rally', 'https://cdn.cloudflare.steamstatic.com/steam/apps/550320/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Racing', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('RACE', 'road-96', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1466640/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Distance', 'distance', 'https://cdn.cloudflare.steamstatic.com/steam/apps/233610/header.jpg', ARRAY['PC', 'PlayStation', 'Switch']::text[], 'Racing', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Inertial Drift', 'inertial-drift', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1184480/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Racing', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('GRIP: Combat Racing', 'grip-combat-racing', 'https://cdn.cloudflare.steamstatic.com/steam/apps/396900/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Racing', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Wreckfest', 'wreckfest', 'https://cdn.cloudflare.steamstatic.com/steam/apps/228380/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Racing', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('BeamNG.drive', 'beamng-drive', 'https://cdn.cloudflare.steamstatic.com/steam/apps/284160/header.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('My Summer Car', 'my-summer-car', 'https://cdn.cloudflare.steamstatic.com/steam/apps/516750/header.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Jalopy', 'jalopy', 'https://cdn.cloudflare.steamstatic.com/steam/apps/446020/header.jpg', ARRAY['PC']::text[], 'Simulation', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Car Mechanic Simulator 2021', 'car-mechanic-simulator-2021', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1190000/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('House Flipper 2', 'house-flipper-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1190970/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('House Flipper', 'house-flipper', 'https://cdn.cloudflare.steamstatic.com/steam/apps/613100/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('PowerWash Simulator', 'powerwash-simulator', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1290000/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Viscera Cleanup Detail', 'viscera-cleanup-detail', 'https://cdn.cloudflare.steamstatic.com/steam/apps/246900/header.jpg', ARRAY['PC']::text[], 'Simulation', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('PC Building Simulator 2', 'pc-building-simulator-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1525750/header.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Long Dark', 'the-long-dark', 'https://cdn.cloudflare.steamstatic.com/steam/apps/305620/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Stranded Deep', 'stranded-deep', 'https://cdn.cloudflare.steamstatic.com/steam/apps/313120/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('SCUM', 'scum', 'https://cdn.cloudflare.steamstatic.com/steam/apps/513710/header.jpg', ARRAY['PC']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Icarus', 'icarus', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1149460/header.jpg', ARRAY['PC']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Abiotic Factor', 'abiotic-factor', 'https://cdn.cloudflare.steamstatic.com/steam/apps/427410/header.jpg', ARRAY['PC']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Soulmask', 'soulmask', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2646460/header.jpg', ARRAY['PC']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Nightingale', 'nightingale', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1928980/header.jpg', ARRAY['PC']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Once Human', 'once-human', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2139460/header.jpg', ARRAY['PC']::text[], 'Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Horizon Call of the Mountain', 'horizon-call-of-the-mountain', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5rnq.jpg', ARRAY['PlayStation']::text[], 'VR Action', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Synth Riders', 'synth-riders', 'https://cdn.cloudflare.steamstatic.com/steam/apps/885000/header.jpg', ARRAY['PC']::text[], 'VR Rhythm', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Pistol Whip', 'pistol-whip', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1079800/header.jpg', ARRAY['PC']::text[], 'VR Rhythm', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('SUPERHOT VR', 'superhot-vr', 'https://cdn.cloudflare.steamstatic.com/steam/apps/617830/header.jpg', ARRAY['PC']::text[], 'VR FPS', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('SUPERHOT', 'superhot', 'https://cdn.cloudflare.steamstatic.com/steam/apps/322500/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'FPS', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('SUPERHOT: MIND CONTROL DELETE', 'superhot-mind-control-delete', 'https://cdn.cloudflare.steamstatic.com/steam/apps/690040/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'FPS', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Robo Recall', 'robo-recall', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1xpj.jpg', ARRAY['PC']::text[], 'VR FPS', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Lone Echo', 'lone-echo', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1udn.jpg', ARRAY['PC']::text[], 'VR Adventure', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Walking Dead: Saints and Sinners', 'walking-dead-saints-sinners', 'https://cdn.cloudflare.steamstatic.com/steam/apps/916840/header.jpg', ARRAY['PC']::text[], 'VR Action', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Arizona Sunshine', 'arizona-sunshine', 'https://cdn.cloudflare.steamstatic.com/steam/apps/342180/header.jpg', ARRAY['PC']::text[], 'VR FPS', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Green Hell VR', 'green-hell-vr', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1782330/header.jpg', ARRAY['PC']::text[], 'VR Survival', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Walkabout Mini Golf', 'walkabout-mini-golf', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1408230/header.jpg', ARRAY['PC']::text[], 'VR Sports', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Eleven Table Tennis', 'eleven-table-tennis', 'https://cdn.cloudflare.steamstatic.com/steam/apps/488310/header.jpg', ARRAY['PC']::text[], 'VR Sports', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Thrill of the Fight', 'thrill-of-the-fight', 'https://cdn.cloudflare.steamstatic.com/steam/apps/494150/header.jpg', ARRAY['PC']::text[], 'VR Sports', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Until You Fall', 'until-you-fall', 'https://cdn.cloudflare.steamstatic.com/steam/apps/858260/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'VR Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Moss', 'moss', 'https://cdn.cloudflare.steamstatic.com/steam/apps/846470/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'VR Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Moss: Book II', 'moss-book-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1903750/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'VR Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('I Expect You To Die', 'i-expect-you-to-die', 'https://cdn.cloudflare.steamstatic.com/steam/apps/587430/header.jpg', ARRAY['PC']::text[], 'VR Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Zenith: The Last City', 'zenith-the-last-city', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1403370/header.jpg', ARRAY['PC']::text[], 'VR MMORPG', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Resident Evil 4 VR', 'resident-evil-4-vr', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4gm8.jpg', ARRAY['PC']::text[], 'VR Horror', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Propagation: Paradise Hotel', 'propagation-paradise-hotel', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2086960/header.jpg', ARRAY['PC']::text[], 'VR Horror', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Into the Radius', 'into-the-radius', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1012790/header.jpg', ARRAY['PC']::text[], 'VR Survival', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Ghosts of Tabor', 'ghosts-of-tabor', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1957780/header.jpg', ARRAY['PC']::text[], 'VR FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('After the Fall', 'after-the-fall', 'https://cdn.cloudflare.steamstatic.com/steam/apps/751630/header.jpg', ARRAY['PC']::text[], 'VR FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Zero Caliber', 'zero-caliber', 'https://cdn.cloudflare.steamstatic.com/steam/apps/877200/header.jpg', ARRAY['PC']::text[], 'VR FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Contractors', 'contractors-vr', 'https://cdn.cloudflare.steamstatic.com/steam/apps/963930/header.jpg', ARRAY['PC']::text[], 'VR FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Onward', 'onward-vr', 'https://cdn.cloudflare.steamstatic.com/steam/apps/496240/header.jpg', ARRAY['PC']::text[], 'VR FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Population: One', 'population-one', 'https://cdn.cloudflare.steamstatic.com/steam/apps/691260/header.jpg', ARRAY['PC']::text[], 'VR Battle Royale', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Echo VR', 'echo-vr', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1ude.jpg', ARRAY['PC']::text[], 'VR Sports', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Demeo', 'demeo', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1484280/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'VR Strategy', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Kayak VR: Mirage', 'kayak-vr-mirage', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1683340/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'VR Sports', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Room VR: A Dark Matter', 'the-room-vr', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1104380/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'VR Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Red Matter 2', 'red-matter-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1777700/header.jpg', ARRAY['PC']::text[], 'VR Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Song in the Smoke', 'song-in-the-smoke', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1518750/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'VR Survival', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Compound', 'compound-vr', 'https://cdn.cloudflare.steamstatic.com/steam/apps/615120/header.jpg', ARRAY['PC']::text[], 'VR FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Hot Dogs Horseshoes and Hand Grenades', 'h3vr', 'https://cdn.cloudflare.steamstatic.com/steam/apps/450540/header.jpg', ARRAY['PC']::text[], 'VR FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Potionomics', 'potionomics', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1874490/header.jpg', ARRAY['PC']::text[], 'Simulation', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Strange Horticulture', 'strange-horticulture', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1574580/header.jpg', ARRAY['PC', 'Switch']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Potion Craft', 'potion-craft', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1210320/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Potion Permit', 'potion-permit', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1337760/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Simulation', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Wylde Flowers', 'wylde-flowers', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1419607/header.jpg', ARRAY['PC', 'Switch']::text[], 'Simulation', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Roots of Pacha', 'roots-of-pacha', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245560/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Simulation', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Coral Island', 'coral-island', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1158160/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Sun Haven', 'sun-haven', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1432860/header.jpg', ARRAY['PC', 'Switch']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Travellers Rest', 'travellers-rest', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1139980/header.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Bear and Breakfast', 'bear-and-breakfast', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1136370/header.jpg', ARRAY['PC', 'Switch']::text[], 'Simulation', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Spirittea', 'spirittea', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1931160/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Simulation', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Littlewood', 'littlewood', 'https://cdn.cloudflare.steamstatic.com/steam/apps/894940/header.jpg', ARRAY['PC', 'Switch']::text[], 'Simulation', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Graveyard Keeper', 'graveyard-keeper', 'https://cdn.cloudflare.steamstatic.com/steam/apps/599140/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile']::text[], 'Simulation', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Spiritfarer: Farewell Edition', 'spiritfarer-farewell', 'https://cdn.cloudflare.steamstatic.com/steam/apps/972660/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Dorfromantik', 'dorfromantik', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1455840/header.jpg', ARRAY['PC', 'Switch']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('TOEM', 'toem', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1307580/header.jpg', ARRAY['PC', 'PlayStation', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Minute of Islands', 'minute-of-islands', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1059310/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Genesis Noir', 'genesis-noir', 'https://cdn.cloudflare.steamstatic.com/steam/apps/735290/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Backbone', 'backbone', 'https://cdn.cloudflare.steamstatic.com/steam/apps/865610/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Mutazione', 'mutazione', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1080750/header.jpg', ARRAY['PC', 'PlayStation', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Old Mans Journey', 'old-mans-journey', 'https://cdn.cloudflare.steamstatic.com/steam/apps/581270/header.jpg', ARRAY['PC', 'PlayStation', 'Switch', 'Mobile']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Gris', 'gris', 'https://cdn.cloudflare.steamstatic.com/steam/apps/683320/header.jpg', ARRAY['PC', 'PlayStation', 'Switch', 'Mobile']::text[], 'Platformer', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Abzu', 'abzu', 'https://cdn.cloudflare.steamstatic.com/steam/apps/384190/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Journey', 'journey', 'https://cdn.cloudflare.steamstatic.com/steam/apps/638230/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Flower', 'flower', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x78.jpg', ARRAY['PC', 'PlayStation']::text[], 'Adventure', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Sky: Children of the Light', 'sky-children-of-the-light', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2325290/header.jpg', ARRAY['PC', 'PlayStation', 'Switch', 'Mobile']::text[], 'Adventure', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Rime', 'rime', 'https://cdn.cloudflare.steamstatic.com/steam/apps/493200/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Fe', 'fe', 'https://cdn.cloudflare.steamstatic.com/steam/apps/327050/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Lost Ember', 'lost-ember', 'https://cdn.cloudflare.steamstatic.com/steam/apps/563840/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Arise: A Simple Story', 'arise-a-simple-story', 'https://cdn.cloudflare.steamstatic.com/steam/apps/866140/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Jusant', 'jusant', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1977170/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Viewfinder', 'viewfinder-game', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1382070/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Talos Principle 2', 'talos-principle-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/835960/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Talos Principle', 'talos-principle', 'https://cdn.cloudflare.steamstatic.com/steam/apps/257510/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Witness', 'the-witness', 'https://cdn.cloudflare.steamstatic.com/steam/apps/210970/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Antichamber', 'antichamber', 'https://cdn.cloudflare.steamstatic.com/steam/apps/219890/header.jpg', ARRAY['PC']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Superliminal', 'superliminal', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1049410/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Maquette', 'maquette', 'https://cdn.cloudflare.steamstatic.com/steam/apps/762840/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Manifold Garden', 'manifold-garden', 'https://cdn.cloudflare.steamstatic.com/steam/apps/473950/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Fez', 'fez', 'https://cdn.cloudflare.steamstatic.com/steam/apps/224760/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Puzzle Platformer', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Braid', 'braid', 'https://cdn.cloudflare.steamstatic.com/steam/apps/26800/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Puzzle Platformer', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Braid Anniversary Edition', 'braid-anniversary-edition', 'https://cdn.cloudflare.steamstatic.com/steam/apps/499180/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Puzzle Platformer', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Swapper', 'the-swapper', 'https://cdn.cloudflare.steamstatic.com/steam/apps/231160/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('World of Goo', 'world-of-goo', 'https://cdn.cloudflare.steamstatic.com/steam/apps/22000/header.jpg', ARRAY['PC', 'Switch', 'Mobile']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('World of Goo 2', 'world-of-goo-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2562680/header.jpg', ARRAY['PC', 'Switch']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Human Resource Machine', 'human-resource-machine', 'https://cdn.cloudflare.steamstatic.com/steam/apps/375820/header.jpg', ARRAY['PC', 'Switch', 'Mobile']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('7 Billion Humans', '7-billion-humans', 'https://cdn.cloudflare.steamstatic.com/steam/apps/792100/header.jpg', ARRAY['PC', 'Switch', 'Mobile']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Opus Magnum', 'opus-magnum', 'https://cdn.cloudflare.steamstatic.com/steam/apps/558990/header.jpg', ARRAY['PC']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Infinifactory', 'infinifactory', 'https://cdn.cloudflare.steamstatic.com/steam/apps/300570/header.jpg', ARRAY['PC']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('SpaceChem', 'spacechem', 'https://cdn.cloudflare.steamstatic.com/steam/apps/92800/header.jpg', ARRAY['PC']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Shenzhen I/O', 'shenzhen-io', 'https://cdn.cloudflare.steamstatic.com/steam/apps/504210/header.jpg', ARRAY['PC']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('TIS-100', 'tis-100', 'https://cdn.cloudflare.steamstatic.com/steam/apps/370360/header.jpg', ARRAY['PC']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Exapunks', 'exapunks', 'https://cdn.cloudflare.steamstatic.com/steam/apps/716490/header.jpg', ARRAY['PC']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Last Call BBS', 'last-call-bbs', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1511780/header.jpg', ARRAY['PC']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Hacknet', 'hacknet', 'https://cdn.cloudflare.steamstatic.com/steam/apps/365450/header.jpg', ARRAY['PC']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Uplink', 'uplink', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1510/header.jpg', ARRAY['PC']::text[], 'Puzzle', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Nerts! Online', 'nerts-online', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1131190/header.jpg', ARRAY['PC']::text[], 'Card Game', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Tabletop Simulator', 'tabletop-simulator', 'https://cdn.cloudflare.steamstatic.com/steam/apps/286160/header.jpg', ARRAY['PC']::text[], 'Simulation', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Wingspan', 'wingspan', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1054490/header.jpg', ARRAY['PC', 'Switch']::text[], 'Card Game', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Root', 'root-board-game', 'https://cdn.cloudflare.steamstatic.com/steam/apps/965580/header.jpg', ARRAY['PC', 'Switch']::text[], 'Strategy', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Gloomhaven', 'gloomhaven', 'https://cdn.cloudflare.steamstatic.com/steam/apps/780290/header.jpg', ARRAY['PC']::text[], 'Strategy RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Terraforming Mars', 'terraforming-mars', 'https://cdn.cloudflare.steamstatic.com/steam/apps/800270/header.jpg', ARRAY['PC', 'Mobile']::text[], 'Strategy', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Spirit Island', 'spirit-island', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1236720/header.jpg', ARRAY['PC']::text[], 'Strategy', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Scythe', 'scythe-digital', 'https://cdn.cloudflare.steamstatic.com/steam/apps/718560/header.jpg', ARRAY['PC', 'Mobile']::text[], 'Strategy', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Black Myth: Wukong', 'black-myth-wukong', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2358720/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Stellar Blade', 'stellar-blade', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7kgs.jpg', ARRAY['PlayStation']::text[], 'Action', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Senuas Saga: Hellblade II', 'hellblade-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2461850/header.jpg', ARRAY['PC', 'Xbox']::text[], 'Action Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Skull and Bones', 'skull-and-bones', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2627380/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Granblue Fantasy: Relink', 'granblue-fantasy-relink', 'https://cdn.cloudflare.steamstatic.com/steam/apps/881020/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Prince of Persia: The Lost Crown', 'prince-of-persia-lost-crown', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2310680/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Metroidvania', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Dead Space Remake', 'dead-space-remake', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1693980/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Horror', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('The Finals', 'the-finals', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2073850/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Warhammer 40K: Rogue Trader', 'warhammer-40k-rogue-trader', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2186680/header.jpg', ARRAY['PC']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Suicide Squad: Kill the Justice League', 'suicide-squad-ktjl', 'https://cdn.cloudflare.steamstatic.com/steam/apps/315210/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Avatar: Frontiers of Pandora', 'avatar-frontiers-of-pandora', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6lix.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action Adventure', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Like a Dragon Gaiden', 'like-a-dragon-gaiden', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2375550/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Pacific Drive', 'pacific-drive', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1458140/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Survival', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Banishers: Ghosts of New Eden', 'banishers-ghosts-new-eden', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1708100/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Alone in the Dark', 'alone-in-the-dark-2024', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1760670/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Horror', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Rise of the Ronin', 'rise-of-the-ronin', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7ei8.jpg', ARRAY['PlayStation']::text[], 'Action RPG', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Eiyuden Chronicle: Hundred Heroes', 'eiyuden-chronicle', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1658280/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Sand Land', 'sand-land', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1979440/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Unicorn Overlord', 'unicorn-overlord', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7fb1.jpg', ARRAY['PlayStation', 'Xbox', 'Switch']::text[], 'Strategy RPG', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('No Rest for the Wicked', 'no-rest-for-the-wicked', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1371980/header.jpg', ARRAY['PC']::text[], 'Action RPG', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Hades II', 'hades-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145350/header.jpg', ARRAY['PC']::text[], 'Roguelike', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Splatoon 3', 'splatoon-3', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4s51.jpg', ARRAY['Switch']::text[], 'Shooter', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Super Mario Bros. Wonder', 'mario-bros-wonder', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6ozt.jpg', ARRAY['Switch']::text[], 'Platformer', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Pikmin 4', 'pikmin-4', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6co9.jpg', ARRAY['Switch']::text[], 'Strategy', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Princess Peach: Showtime!', 'princess-peach-showtime', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7gpt.jpg', ARRAY['Switch']::text[], 'Platformer', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Paper Mario: The Thousand-Year Door', 'paper-mario-ttyd', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7h9p.jpg', ARRAY['Switch']::text[], 'RPG', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Luigi''s Mansion 2 HD', 'luigis-mansion-2-hd', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7h9q.jpg', ARRAY['Switch']::text[], 'Adventure', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Fire Emblem Engage', 'fire-emblem-engage', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5l0w.jpg', ARRAY['Switch']::text[], 'Strategy RPG', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Persona 5 Tactica', 'persona-5-tactica', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2254740/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Strategy RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Persona 3 Reload', 'persona-3-reload', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2161700/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Indiana Jones and the Great Circle', 'indiana-jones-great-circle', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2677660/header.jpg', ARRAY['PC', 'Xbox']::text[], 'Action Adventure', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('S.T.A.L.K.E.R. 2', 'stalker-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1643320/header.jpg', ARRAY['PC', 'Xbox']::text[], 'FPS', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Path of Exile 2', 'path-of-exile-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2694490/header.jpg', ARRAY['PC']::text[], 'Action RPG', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Delta Force', 'delta-force-2024', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2217000/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Marvel Rivals', 'marvel-rivals', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2767030/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Wuthering Waves', 'wuthering-waves', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2384920/header.jpg', ARRAY['PC', 'PlayStation', 'Mobile']::text[], 'Action RPG', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Zenless Zone Zero', 'zenless-zone-zero', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2881280/header.jpg', ARRAY['PC', 'PlayStation', 'Mobile']::text[], 'Action RPG', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Dragon Age: The Veilguard', 'dragon-age-veilguard', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1845910/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Silent Hill 2 Remake', 'silent-hill-2-remake', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2124490/header.jpg', ARRAY['PC', 'PlayStation']::text[], 'Horror', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Call of Duty: Black Ops 6', 'call-of-duty-bo6', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8cbc.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Space Marine 2', 'warhammer-40k-space-marine-2', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2183900/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Star Wars Outlaws', 'star-wars-outlaws', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7rhx.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action Adventure', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Assassins Creed Shadows', 'assassins-creed-shadows', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7rhx.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action RPG', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Monster Hunter Wilds', 'monster-hunter-wilds', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2246340/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('GTA 6', 'gta-6', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7lhd.jpg', ARRAY['PlayStation', 'Xbox']::text[], 'Action', true, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Death Stranding 2', 'death-stranding-2', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7v96.jpg', ARRAY['PlayStation']::text[], 'Action Adventure', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Ghost of Yotei', 'ghost-of-yotei', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8fkg.jpg', ARRAY['PlayStation']::text[], 'Action', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('DOOM: The Dark Ages', 'doom-dark-ages', 'https://cdn.cloudflare.steamstatic.com/steam/apps/3017860/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Fable', 'fable-2025', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vly.jpg', ARRAY['PC', 'Xbox']::text[], 'RPG', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Avowed', 'avowed', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2181290/header.jpg', ARRAY['PC', 'Xbox']::text[], 'RPG', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Civilization VII', 'civilization-7', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1295660/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Strategy', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Elden Ring: Nightreign', 'elden-ring-nightreign', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2817020/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Action RPG', true, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Borderlands 4', 'borderlands-4', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2968290/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'Looter Shooter', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Judas', 'judas', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7fmz.jpg', ARRAY['PC', 'PlayStation', 'Xbox']::text[], 'FPS', false, true, 'full', true, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

INSERT INTO public.games (name, slug, cover_url, platforms, genre, is_live_service, mvp_eligible, support_tier, curated_exception, eligibility_checked_at)
VALUES ('Hollow Knight: Silksong', 'hollow-knight-silksong', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1030300/header.jpg', ARRAY['PC', 'PlayStation', 'Xbox', 'Switch']::text[], 'Metroidvania', false, true, 'full', false, now())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_url = COALESCE(games.cover_url, EXCLUDED.cover_url),
  platforms = EXCLUDED.platforms,
  genre = COALESCE(games.genre, EXCLUDED.genre),
  is_live_service = EXCLUDED.is_live_service,
  mvp_eligible = EXCLUDED.mvp_eligible,
  support_tier = EXCLUDED.support_tier,
  curated_exception = EXCLUDED.curated_exception,
  eligibility_checked_at = now();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT
  COUNT(*) FILTER (WHERE mvp_eligible = true) as mvp_games,
  COUNT(*) FILTER (WHERE is_live_service = true) as live_service_games,
  COUNT(*) FILTER (WHERE curated_exception = true) as curated_exceptions,
  COUNT(DISTINCT genre) as unique_genres
FROM public.games;