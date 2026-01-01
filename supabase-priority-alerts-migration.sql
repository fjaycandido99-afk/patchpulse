-- Priority Alert Rules for Pro users
-- Run this in Supabase SQL Editor

-- Create priority_alert_rules table
CREATE TABLE IF NOT EXISTS priority_alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Rule metadata
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true,

  -- Rule type (preset or custom)
  rule_type TEXT NOT NULL CHECK (rule_type IN (
    'major_patch',      -- Impact score >= threshold
    'balance_changes',  -- Significant buffs/nerfs (uses diff_stats)
    'resurfacing',      -- Dormant game gets update
    'new_content',      -- New systems/DLC detected
    'high_priority',    -- Any notification with priority >= threshold
    'custom'            -- Custom conditions
  )),

  -- Scope
  applies_to TEXT NOT NULL DEFAULT 'followed_games' CHECK (applies_to IN (
    'all_games',        -- All games in the system
    'followed_games',   -- Only games user follows
    'specific_games'    -- Specific game IDs
  )),
  game_ids UUID[] DEFAULT NULL, -- For specific_games scope

  -- Thresholds (used by different rule types)
  thresholds JSONB DEFAULT '{}',
  -- Examples:
  -- major_patch: { "impact_score": 7 }
  -- balance_changes: { "buffs_min": 3, "nerfs_min": 3 }
  -- high_priority: { "priority": 4 }

  -- Custom conditions (for custom rule_type)
  conditions JSONB DEFAULT NULL,
  -- Array of { field, operator, value }

  -- Actions
  priority_boost INTEGER DEFAULT 0 CHECK (priority_boost >= 0 AND priority_boost <= 2),
  force_push BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_priority_alert_rules_user_id
  ON priority_alert_rules(user_id);

CREATE INDEX IF NOT EXISTS idx_priority_alert_rules_enabled
  ON priority_alert_rules(user_id, enabled)
  WHERE enabled = true;

-- RLS policies
ALTER TABLE priority_alert_rules ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rules
CREATE POLICY "Users can view own rules"
  ON priority_alert_rules FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own rules
CREATE POLICY "Users can create own rules"
  ON priority_alert_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own rules
CREATE POLICY "Users can update own rules"
  ON priority_alert_rules FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own rules
CREATE POLICY "Users can delete own rules"
  ON priority_alert_rules FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_priority_alert_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_priority_alert_rules_timestamp
  BEFORE UPDATE ON priority_alert_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_priority_alert_rules_updated_at();

-- Comment for documentation
COMMENT ON TABLE priority_alert_rules IS 'User-defined priority alert rules for Pro users. Rules can boost notification priority or force push for matching content.';
