-- ============================================================================
-- MIGRATION: Track failed game searches for manual review
-- Run this in your Supabase SQL editor
-- ============================================================================

-- Create search_requests table
CREATE TABLE IF NOT EXISTS public.search_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  search_count INTEGER DEFAULT 1,
  last_searched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Status for admin review
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'added', 'ignored')),
  notes TEXT
);

-- Unique constraint on query (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_search_requests_query
ON public.search_requests(LOWER(query));

-- Index for admin dashboard
CREATE INDEX IF NOT EXISTS idx_search_requests_status
ON public.search_requests(status, search_count DESC);

-- Enable RLS
ALTER TABLE public.search_requests ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for server actions and admin)
CREATE POLICY "Service role can manage search_requests"
  ON public.search_requests FOR ALL
  USING (auth.role() = 'service_role');

-- Verify table created
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'search_requests'
ORDER BY ordinal_position;
