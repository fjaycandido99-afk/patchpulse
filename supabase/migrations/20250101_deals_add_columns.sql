-- Add new columns to deals table for CheapShark integration
-- Run this in Supabase SQL Editor

-- Add store column (Steam, GOG, Epic, etc.)
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS store TEXT DEFAULT 'Steam';

-- Add steam_app_id for direct Steam links
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS steam_app_id TEXT;

-- Add metacritic score
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS metacritic_score INTEGER;

-- Add deal rating from CheapShark
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS deal_rating DECIMAL(3,1);

-- Create index on store for filtering
CREATE INDEX IF NOT EXISTS idx_deals_store ON public.deals(store);

-- Create index on metacritic for sorting by quality
CREATE INDEX IF NOT EXISTS idx_deals_metacritic ON public.deals(metacritic_score DESC NULLS LAST);
