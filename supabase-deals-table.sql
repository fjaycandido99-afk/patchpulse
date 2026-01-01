-- ============================================================================
-- MIGRATION: Create deals table for caching Steam deals
-- Run this in your Supabase SQL editor
-- ============================================================================

-- Create deals table
CREATE TABLE IF NOT EXISTS public.deals (
  id TEXT PRIMARY KEY, -- Steam app ID
  title TEXT NOT NULL,
  sale_price DECIMAL(10,2) NOT NULL,
  normal_price DECIMAL(10,2) NOT NULL,
  discount_percent INTEGER NOT NULL,
  thumb_url TEXT,
  header_url TEXT,
  deal_url TEXT NOT NULL,
  expires_at TIMESTAMPTZ, -- When the sale ends (null if unknown)
  created_at TIMESTAMPTZ DEFAULT NOW(), -- When we first saw this deal
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_deals_discount ON public.deals(discount_percent DESC);
CREATE INDEX IF NOT EXISTS idx_deals_expires ON public.deals(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Public read access (deals are public)
CREATE POLICY "Deals are viewable by everyone"
  ON public.deals FOR SELECT
  USING (true);

-- Only service role can insert/update/delete (cron job)
CREATE POLICY "Service role can manage deals"
  ON public.deals FOR ALL
  USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_deals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS deals_updated_at ON public.deals;
CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION update_deals_updated_at();

-- Verify table created
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'deals'
ORDER BY ordinal_position;
