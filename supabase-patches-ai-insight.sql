-- Add ai_insight column to patch_notes for storing AI-generated insights
-- This column stores a brief AI-generated insight about the patch's significance

ALTER TABLE patch_notes
ADD COLUMN IF NOT EXISTS ai_insight TEXT;

-- Add hero_url to games table for hero images (if not exists)
ALTER TABLE games
ADD COLUMN IF NOT EXISTS hero_url TEXT;

-- Add index for querying patches by impact score (for featured/biggest changes queries)
CREATE INDEX IF NOT EXISTS idx_patch_notes_impact_score ON patch_notes(impact_score DESC, published_at DESC);

-- Comment on columns for documentation
COMMENT ON COLUMN patch_notes.ai_insight IS 'AI-generated brief insight about the patch significance';
COMMENT ON COLUMN games.hero_url IS 'Hero/banner image URL for the game';
