-- Add studio/developer fields to games table
-- Run this migration in Supabase SQL Editor

-- Add developer field
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS developer text;

-- Add publisher field
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS publisher text;

-- Add studio type (AAA, AA, indie)
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS studio_type text
CHECK (studio_type IN ('AAA', 'AA', 'indie', null));

-- Add IGDB ID for easier lookups
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS igdb_id integer;

-- Add similar games as text array (game names for display)
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS similar_games text[];

-- Add developer's notable games
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS developer_notable_games text[];

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_games_igdb_id ON public.games(igdb_id);
CREATE INDEX IF NOT EXISTS idx_games_developer ON public.games(developer);

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'games'
AND column_name IN ('developer', 'publisher', 'studio_type', 'igdb_id', 'similar_games', 'developer_notable_games');
