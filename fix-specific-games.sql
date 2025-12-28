-- Fix specific game images
-- Run in Supabase SQL Editor

-- Metroid Prime 4: Beyond (Nintendo - use IGDB)
UPDATE games SET
  cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co8t3e.jpg'
WHERE LOWER(name) LIKE '%metroid prime 4%';

-- 007 First Light (IO Interactive - use IGDB)
UPDATE games SET
  cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co7xlm.jpg'
WHERE LOWER(name) LIKE '%007%' OR LOWER(name) LIKE '%first light%';

-- Octopath Traveler (Square Enix - Steam 921570)
UPDATE games SET
  cover_url = 'https://cdn.akamai.steamstatic.com/steam/apps/921570/library_600x900_2x.jpg'
WHERE LOWER(name) LIKE '%octopath traveler%' AND LOWER(name) NOT LIKE '%ii%' AND LOWER(name) NOT LIKE '%2%' AND LOWER(name) NOT LIKE '%0%';

-- Octopath Traveler 0 (Square Enix - Steam 3014320)
UPDATE games SET
  cover_url = 'https://cdn.akamai.steamstatic.com/steam/apps/3014320/library_600x900_2x.jpg'
WHERE LOWER(name) LIKE '%octopath traveler 0%' OR LOWER(name) LIKE '%octopath traveler zero%';

-- Nioh 3 (Team Ninja - use IGDB placeholder from Nioh 2)
UPDATE games SET
  cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co1wzo.jpg'
WHERE LOWER(name) LIKE '%nioh 3%';

-- Resident Evil Requiem (Capcom - use IGDB)
UPDATE games SET
  cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co8l9n.jpg'
WHERE LOWER(name) LIKE '%resident evil%requiem%' OR LOWER(name) LIKE '%resident evil 9%';

-- Pragmata (Capcom - use IGDB)
UPDATE games SET
  cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co2qk9.jpg'
WHERE LOWER(name) LIKE '%pragmata%';

-- Phantom Blade Zero (S-Game - use IGDB)
UPDATE games SET
  cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co6k9x.jpg'
WHERE LOWER(name) LIKE '%phantom blade%';

-- Marvel's Wolverine (Insomniac - use IGDB)
UPDATE games SET
  cover_url = 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co7k9b.jpg'
WHERE LOWER(name) LIKE '%wolverine%';

-- Verify the updates
SELECT name, cover_url FROM games
WHERE LOWER(name) LIKE '%metroid%'
   OR LOWER(name) LIKE '%007%'
   OR LOWER(name) LIKE '%octopath%'
   OR LOWER(name) LIKE '%nioh%'
   OR LOWER(name) LIKE '%resident evil%'
   OR LOWER(name) LIKE '%pragmata%'
   OR LOWER(name) LIKE '%phantom blade%'
   OR LOWER(name) LIKE '%wolverine%';
