-- Add missing columns to games table
-- These are used by steam-discovery.ts

-- Add description column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'description'
  ) THEN
    ALTER TABLE games ADD COLUMN description TEXT;
  END IF;
END $$;

-- Add developer column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'developer'
  ) THEN
    ALTER TABLE games ADD COLUMN developer TEXT;
  END IF;
END $$;

-- Add publisher column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'publisher'
  ) THEN
    ALTER TABLE games ADD COLUMN publisher TEXT;
  END IF;
END $$;

-- Fix game_discovery_queue table - add game_id if missing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'game_discovery_queue') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'game_discovery_queue' AND column_name = 'game_id'
    ) THEN
      ALTER TABLE game_discovery_queue ADD COLUMN game_id UUID REFERENCES games(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Create index on game_id for game_discovery_queue
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'game_discovery_queue') THEN
    CREATE INDEX IF NOT EXISTS idx_game_discovery_queue_game_id ON game_discovery_queue(game_id);
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
