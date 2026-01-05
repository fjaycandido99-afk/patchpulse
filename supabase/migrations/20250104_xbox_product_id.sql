-- Add xbox_product_id column for Xbox Game Pass game launching
-- Product ID format: alphanumeric like "9NBLGGH4R5PB"
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS xbox_product_id TEXT;

-- Create index for lookups
CREATE INDEX IF NOT EXISTS idx_games_xbox_product_id ON public.games(xbox_product_id) WHERE xbox_product_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.games.xbox_product_id IS 'Microsoft Store product ID for Xbox Game Pass launching (e.g., 9NBLGGH4R5PB)';
