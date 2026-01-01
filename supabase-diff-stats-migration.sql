-- Add diff_stats column to patch_notes table
-- Run this in Supabase SQL Editor

ALTER TABLE patch_notes
ADD COLUMN IF NOT EXISTS diff_stats JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN patch_notes.diff_stats IS 'AI-generated diff classification: {buffs, nerfs, new_systems, bug_fixes, ignore_safe}';

-- Create index for querying patches by diff_stats properties
CREATE INDEX IF NOT EXISTS idx_patch_notes_diff_stats ON patch_notes USING GIN (diff_stats);
