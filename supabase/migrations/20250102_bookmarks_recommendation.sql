-- MIGRATION: Add recommendation bookmarks support
-- Run this in Supabase SQL Editor

-- Drop the old constraint
ALTER TABLE public.bookmarks
DROP CONSTRAINT IF EXISTS bookmarks_entity_type_check;

-- Add the new constraint with 'recommendation' included
ALTER TABLE public.bookmarks
ADD CONSTRAINT bookmarks_entity_type_check
CHECK (entity_type IN ('patch', 'news', 'deal', 'recommendation'));

-- Add index for recommendation bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_recommendations
ON public.bookmarks(user_id, entity_type)
WHERE entity_type = 'recommendation';

-- Verify
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE table_name = 'bookmarks';
