-- Fix game images with correct Steam CDN URLs
-- Run this in Supabase SQL Editor

-- Monster Hunter Wilds (Steam App ID: 2246340)
UPDATE games SET
  cover_url = 'https://cdn.akamai.steamstatic.com/steam/apps/2246340/library_600x900_2x.jpg',
  hero_url = 'https://cdn.akamai.steamstatic.com/steam/apps/2246340/library_hero.jpg',
  steam_app_id = 2246340
WHERE slug = 'monster-hunter-wilds';

-- Indiana Jones and the Great Circle (Steam App ID: 2677660)
UPDATE games SET
  cover_url = 'https://cdn.akamai.steamstatic.com/steam/apps/2677660/library_600x900_2x.jpg',
  hero_url = 'https://cdn.akamai.steamstatic.com/steam/apps/2677660/library_hero.jpg',
  steam_app_id = 2677660
WHERE slug = 'indiana-jones-great-circle';

-- Path of Exile 2 (Steam App ID: 2694490)
UPDATE games SET
  cover_url = 'https://cdn.akamai.steamstatic.com/steam/apps/2694490/library_600x900_2x.jpg',
  hero_url = 'https://cdn.akamai.steamstatic.com/steam/apps/2694490/library_hero.jpg',
  steam_app_id = 2694490
WHERE slug = 'path-of-exile-2';

-- Marvel Rivals (Steam App ID: 2767030)
UPDATE games SET
  cover_url = 'https://cdn.akamai.steamstatic.com/steam/apps/2767030/library_600x900_2x.jpg',
  hero_url = 'https://cdn.akamai.steamstatic.com/steam/apps/2767030/library_hero.jpg',
  steam_app_id = 2767030
WHERE slug = 'marvel-rivals';

-- Civilization VII (Steam App ID: 1295660)
UPDATE games SET
  cover_url = 'https://cdn.akamai.steamstatic.com/steam/apps/1295660/library_600x900_2x.jpg',
  hero_url = 'https://cdn.akamai.steamstatic.com/steam/apps/1295660/library_hero.jpg',
  steam_app_id = 1295660
WHERE slug = 'civilization-vii' OR slug = 'civilization-7';

-- Elden Ring Nightreign (Steam App ID: 2622380)
UPDATE games SET
  cover_url = 'https://cdn.akamai.steamstatic.com/steam/apps/2622380/library_600x900_2x.jpg',
  hero_url = 'https://cdn.akamai.steamstatic.com/steam/apps/2622380/library_hero.jpg',
  steam_app_id = 2622380
WHERE slug = 'elden-ring-nightreign';

-- Death Stranding 2 (Steam App ID: 2668080)
UPDATE games SET
  cover_url = 'https://cdn.akamai.steamstatic.com/steam/apps/2668080/library_600x900_2x.jpg',
  hero_url = 'https://cdn.akamai.steamstatic.com/steam/apps/2668080/library_hero.jpg',
  steam_app_id = 2668080
WHERE slug = 'death-stranding-2';

-- Doom: The Dark Ages (Steam App ID: 2862570)
UPDATE games SET
  cover_url = 'https://cdn.akamai.steamstatic.com/steam/apps/2862570/library_600x900_2x.jpg',
  hero_url = 'https://cdn.akamai.steamstatic.com/steam/apps/2862570/library_hero.jpg',
  steam_app_id = 2862570
WHERE slug = 'doom-dark-ages';

-- Avowed (Steam App ID: 1618380)
UPDATE games SET
  cover_url = 'https://cdn.akamai.steamstatic.com/steam/apps/1618380/library_600x900_2x.jpg',
  hero_url = 'https://cdn.akamai.steamstatic.com/steam/apps/1618380/library_hero.jpg',
  steam_app_id = 1618380
WHERE slug = 'avowed';

-- Assassin's Creed Shadows (Steam App ID: 2429340)
UPDATE games SET
  cover_url = 'https://cdn.akamai.steamstatic.com/steam/apps/2429340/library_600x900_2x.jpg',
  hero_url = 'https://cdn.akamai.steamstatic.com/steam/apps/2429340/library_hero.jpg',
  steam_app_id = 2429340
WHERE slug = 'assassins-creed-shadows';

-- Kingdom Come Deliverance 2 (Steam App ID: 1771300)
UPDATE games SET
  cover_url = 'https://cdn.akamai.steamstatic.com/steam/apps/1771300/library_600x900_2x.jpg',
  hero_url = 'https://cdn.akamai.steamstatic.com/steam/apps/1771300/library_hero.jpg',
  steam_app_id = 1771300
WHERE slug = 'kingdom-come-deliverance-2';

-- Fable (2025) (Steam App ID: 1948820)
UPDATE games SET
  cover_url = 'https://cdn.akamai.steamstatic.com/steam/apps/1948820/library_600x900_2x.jpg',
  hero_url = 'https://cdn.akamai.steamstatic.com/steam/apps/1948820/library_hero.jpg',
  steam_app_id = 1948820
WHERE slug = 'fable' OR slug = 'fable-2025';

-- Stalker 2 (Steam App ID: 1643320)
UPDATE games SET
  cover_url = 'https://cdn.akamai.steamstatic.com/steam/apps/1643320/library_600x900_2x.jpg',
  hero_url = 'https://cdn.akamai.steamstatic.com/steam/apps/1643320/library_hero.jpg',
  steam_app_id = 1643320
WHERE slug = 'stalker-2' OR slug = 's-t-a-l-k-e-r-2';

-- Like a Dragon Pirate Yakuza in Hawaii (Steam App ID: 2614560)
UPDATE games SET
  cover_url = 'https://cdn.akamai.steamstatic.com/steam/apps/2614560/library_600x900_2x.jpg',
  hero_url = 'https://cdn.akamai.steamstatic.com/steam/apps/2614560/library_hero.jpg',
  steam_app_id = 2614560
WHERE slug LIKE '%pirate-yakuza%' OR slug LIKE '%like-a-dragon-pirate%';

-- GTA 6 - Use IGDB placeholder (no Steam page yet)
UPDATE games SET
  cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.jpg'
WHERE slug = 'gta-6' OR slug = 'grand-theft-auto-vi';

-- For games without specific Steam IDs, use IGDB format images
-- IGDB URL format: https://images.igdb.com/igdb/image/upload/t_cover_big/{image_id}.jpg

-- Verify updates
SELECT name, slug, cover_url, hero_url, steam_app_id
FROM games
WHERE release_date >= CURRENT_DATE - INTERVAL '30 days'
   OR release_date <= CURRENT_DATE + INTERVAL '365 days'
ORDER BY release_date;
