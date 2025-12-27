-- Seed upcoming_releases with test data
-- Run this in Supabase SQL Editor

-- First, let's see what games we have
-- SELECT id, name FROM games LIMIT 10;

-- Insert sample releases for existing games
INSERT INTO upcoming_releases (game_id, title, release_type, release_date, release_window, is_confirmed, confidence_score)
SELECT
  g.id,
  g.name || ' - Winter Update 2024',
  'update',
  CURRENT_DATE + INTERVAL '7 days',
  'Late December 2024',
  true,
  0.9
FROM games g
LIMIT 5
ON CONFLICT (game_id, title) DO NOTHING;

INSERT INTO upcoming_releases (game_id, title, release_type, release_date, release_window, is_confirmed, confidence_score)
SELECT
  g.id,
  g.name || ' - Season 2',
  'season',
  CURRENT_DATE + INTERVAL '14 days',
  'January 2025',
  false,
  0.75
FROM games g
LIMIT 5
ON CONFLICT (game_id, title) DO NOTHING;

INSERT INTO upcoming_releases (game_id, title, release_type, release_date, release_window, is_confirmed, confidence_score)
SELECT
  g.id,
  g.name || ' - New DLC',
  'dlc',
  CURRENT_DATE + INTERVAL '30 days',
  'Q1 2025',
  false,
  0.6
FROM games g
LIMIT 3
ON CONFLICT (game_id, title) DO NOTHING;

-- Check results
SELECT
  ur.title,
  ur.release_type,
  ur.release_date,
  ur.is_confirmed,
  g.name as game_name1
FROM upcoming_releases ur
JOIN games g ON g.id = ur.game_id
ORDER BY ur.release_date;
