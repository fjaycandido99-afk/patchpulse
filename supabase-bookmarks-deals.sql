-- ============================================================================
-- MIGRATION: Add deal bookmarks support
-- Run this in your Supabase SQL editor
-- ============================================================================

-- Step 1: Drop the existing check constraint
ALTER TABLE public.bookmarks
DROP CONSTRAINT IF EXISTS bookmarks_entity_type_check;

-- Step 2: Change entity_id from UUID to TEXT to support deal IDs (Steam app IDs)
ALTER TABLE public.bookmarks
ALTER COLUMN entity_id TYPE text USING entity_id::text;

-- Step 3: Add new check constraint that includes 'deal'
ALTER TABLE public.bookmarks
ADD CONSTRAINT bookmarks_entity_type_check
CHECK (entity_type IN ('patch', 'news', 'deal'));

-- Step 4: Add metadata column for storing deal information
ALTER TABLE public.bookmarks
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT NULL;

-- Step 5: Drop and recreate unique constraint to handle text entity_id
ALTER TABLE public.bookmarks
DROP CONSTRAINT IF EXISTS bookmarks_user_id_entity_type_entity_id_key;

ALTER TABLE public.bookmarks
ADD CONSTRAINT bookmarks_user_id_entity_type_entity_id_key
UNIQUE (user_id, entity_type, entity_id);

-- Step 6: Create index for faster deal queries
CREATE INDEX IF NOT EXISTS idx_bookmarks_deals
ON public.bookmarks(user_id, entity_type)
WHERE entity_type = 'deal';

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookmarks'
ORDER BY ordinal_position;
