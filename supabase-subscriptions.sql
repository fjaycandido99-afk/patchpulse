-- ============================================================================
-- PATCHPULSE: SUBSCRIPTION & MONETIZATION SYSTEM
-- Supports both Stripe (web) and Apple IAP (iOS)
-- ============================================================================

-- ============================================================================
-- PART 1: SUBSCRIPTION TABLES
-- ============================================================================

-- User subscriptions (unified for Stripe + Apple)
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Subscription status
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'expired')),

  -- Payment provider info
  provider TEXT CHECK (provider IN ('stripe', 'apple', 'google', 'manual')),
  provider_subscription_id TEXT,  -- Stripe subscription ID or Apple original_transaction_id
  provider_customer_id TEXT,      -- Stripe customer ID

  -- Billing details
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_provider ON user_subscriptions(provider, provider_subscription_id);
CREATE INDEX idx_subscriptions_status ON user_subscriptions(status, current_period_end);

-- Subscription events (audit log)
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,  -- 'created', 'renewed', 'canceled', 'expired', 'upgraded', 'restored'
  provider TEXT,
  provider_event_id TEXT,    -- Stripe event ID or Apple transaction ID
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscription_events_user ON subscription_events(user_id, created_at DESC);

-- ============================================================================
-- PART 2: USAGE TRACKING
-- ============================================================================

-- Create a view for user usage stats
CREATE OR REPLACE VIEW user_usage_stats AS
SELECT
  u.id as user_id,
  COALESCE(s.plan, 'free') as plan,
  COALESCE(s.status, 'active') as subscription_status,
  (SELECT COUNT(*) FROM backlog_items bi WHERE bi.user_id = u.id) as backlog_count,
  (SELECT COUNT(*) FROM user_games ug WHERE ug.user_id = u.id AND ug.is_favorite = true) as favorites_count,
  (SELECT COUNT(*) FROM user_games ug WHERE ug.user_id = u.id) as followed_count
FROM auth.users u
LEFT JOIN user_subscriptions s ON s.user_id = u.id;

-- ============================================================================
-- PART 3: LIMIT CONSTANTS & CHECKING FUNCTIONS
-- ============================================================================

-- Free tier limits
CREATE OR REPLACE FUNCTION get_plan_limits(p_plan TEXT)
RETURNS TABLE(
  backlog_limit INT,
  favorites_limit INT,
  followed_limit INT,
  has_notifications BOOLEAN,
  has_ai_summaries BOOLEAN
) AS $$
BEGIN
  IF p_plan = 'pro' THEN
    RETURN QUERY SELECT
      999999::INT,  -- Effectively unlimited
      999999::INT,
      999999::INT,
      true,
      true;
  ELSE
    -- Free tier
    RETURN QUERY SELECT
      5::INT,   -- 5 backlog games
      5::INT,   -- 5 favorites
      10::INT,  -- 10 followed games
      false,
      false;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Check if user can add to backlog
CREATE OR REPLACE FUNCTION can_add_to_backlog(p_user_id UUID)
RETURNS TABLE(
  allowed BOOLEAN,
  current_count INT,
  max_count INT,
  plan TEXT
) AS $$
DECLARE
  v_plan TEXT;
  v_current INT;
  v_limit INT;
BEGIN
  -- Get user's plan
  SELECT COALESCE(s.plan, 'free') INTO v_plan
  FROM auth.users u
  LEFT JOIN user_subscriptions s ON s.user_id = u.id AND s.status = 'active'
  WHERE u.id = p_user_id;

  -- Get current count
  SELECT COUNT(*) INTO v_current
  FROM backlog_items
  WHERE user_id = p_user_id;

  -- Get limit
  SELECT l.backlog_limit INTO v_limit
  FROM get_plan_limits(v_plan) l;

  RETURN QUERY SELECT
    (v_current < v_limit),
    v_current,
    v_limit,
    v_plan;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can add to favorites
CREATE OR REPLACE FUNCTION can_add_favorite(p_user_id UUID)
RETURNS TABLE(
  allowed BOOLEAN,
  current_count INT,
  max_count INT,
  plan TEXT
) AS $$
DECLARE
  v_plan TEXT;
  v_current INT;
  v_limit INT;
BEGIN
  SELECT COALESCE(s.plan, 'free') INTO v_plan
  FROM auth.users u
  LEFT JOIN user_subscriptions s ON s.user_id = u.id AND s.status = 'active'
  WHERE u.id = p_user_id;

  SELECT COUNT(*) INTO v_current
  FROM user_games
  WHERE user_id = p_user_id AND is_favorite = true;

  SELECT l.favorites_limit INTO v_limit
  FROM get_plan_limits(v_plan) l;

  RETURN QUERY SELECT
    (v_current < v_limit),
    v_current,
    v_limit,
    v_plan;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can follow more games
CREATE OR REPLACE FUNCTION can_follow_game(p_user_id UUID)
RETURNS TABLE(
  allowed BOOLEAN,
  current_count INT,
  max_count INT,
  plan TEXT
) AS $$
DECLARE
  v_plan TEXT;
  v_current INT;
  v_limit INT;
BEGIN
  SELECT COALESCE(s.plan, 'free') INTO v_plan
  FROM auth.users u
  LEFT JOIN user_subscriptions s ON s.user_id = u.id AND s.status = 'active'
  WHERE u.id = p_user_id;

  SELECT COUNT(*) INTO v_current
  FROM user_games
  WHERE user_id = p_user_id;

  SELECT l.followed_limit INTO v_limit
  FROM get_plan_limits(v_plan) l;

  RETURN QUERY SELECT
    (v_current < v_limit),
    v_current,
    v_limit,
    v_plan;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's full subscription info
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS TABLE(
  plan TEXT,
  status TEXT,
  provider TEXT,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN,
  backlog_used INT,
  backlog_limit INT,
  favorites_used INT,
  favorites_limit INT,
  followed_used INT,
  followed_limit INT,
  has_notifications BOOLEAN,
  has_ai_summaries BOOLEAN
) AS $$
DECLARE
  v_plan TEXT;
  v_status TEXT;
  v_provider TEXT;
  v_period_end TIMESTAMPTZ;
  v_cancel BOOLEAN;
BEGIN
  -- Get subscription info
  SELECT
    COALESCE(s.plan, 'free'),
    COALESCE(s.status, 'active'),
    s.provider,
    s.current_period_end,
    COALESCE(s.cancel_at_period_end, false)
  INTO v_plan, v_status, v_provider, v_period_end, v_cancel
  FROM auth.users u
  LEFT JOIN user_subscriptions s ON s.user_id = u.id
  WHERE u.id = p_user_id;

  RETURN QUERY
  SELECT
    v_plan,
    v_status,
    v_provider,
    v_period_end,
    v_cancel,
    (SELECT COUNT(*)::INT FROM backlog_items WHERE user_id = p_user_id),
    (SELECT l.backlog_limit FROM get_plan_limits(v_plan) l),
    (SELECT COUNT(*)::INT FROM user_games WHERE user_id = p_user_id AND is_favorite = true),
    (SELECT l.favorites_limit FROM get_plan_limits(v_plan) l),
    (SELECT COUNT(*)::INT FROM user_games WHERE user_id = p_user_id),
    (SELECT l.followed_limit FROM get_plan_limits(v_plan) l),
    (SELECT l.has_notifications FROM get_plan_limits(v_plan) l),
    (SELECT l.has_ai_summaries FROM get_plan_limits(v_plan) l);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 4: RLS POLICIES
-- ============================================================================

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role manages subscriptions
DROP POLICY IF EXISTS "Service role manages subscriptions" ON user_subscriptions;
CREATE POLICY "Service role manages subscriptions"
  ON user_subscriptions FOR ALL
  USING (true);

-- Users can view their own events
DROP POLICY IF EXISTS "Users can view own subscription events" ON subscription_events;
CREATE POLICY "Users can view own subscription events"
  ON subscription_events FOR SELECT
  USING (auth.uid() = user_id);

-- Service role manages events
DROP POLICY IF EXISTS "Service role manages subscription events" ON subscription_events;
CREATE POLICY "Service role manages subscription events"
  ON subscription_events FOR ALL
  USING (true);

-- ============================================================================
-- PART 5: HELPER FUNCTIONS FOR WEBHOOKS
-- ============================================================================

-- Upsert subscription from Stripe webhook
CREATE OR REPLACE FUNCTION upsert_stripe_subscription(
  p_user_id UUID,
  p_subscription_id TEXT,
  p_customer_id TEXT,
  p_status TEXT,
  p_current_period_start TIMESTAMPTZ,
  p_current_period_end TIMESTAMPTZ,
  p_cancel_at_period_end BOOLEAN
) RETURNS void AS $$
BEGIN
  INSERT INTO user_subscriptions (
    user_id, plan, status, provider,
    provider_subscription_id, provider_customer_id,
    current_period_start, current_period_end,
    cancel_at_period_end, updated_at
  ) VALUES (
    p_user_id, 'pro', p_status, 'stripe',
    p_subscription_id, p_customer_id,
    p_current_period_start, p_current_period_end,
    p_cancel_at_period_end, now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan = 'pro',
    status = p_status,
    provider = 'stripe',
    provider_subscription_id = p_subscription_id,
    provider_customer_id = p_customer_id,
    current_period_start = p_current_period_start,
    current_period_end = p_current_period_end,
    cancel_at_period_end = p_cancel_at_period_end,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Upsert subscription from Apple IAP
CREATE OR REPLACE FUNCTION upsert_apple_subscription(
  p_user_id UUID,
  p_original_transaction_id TEXT,
  p_status TEXT,
  p_expires_date TIMESTAMPTZ
) RETURNS void AS $$
BEGIN
  INSERT INTO user_subscriptions (
    user_id, plan, status, provider,
    provider_subscription_id,
    current_period_end, updated_at
  ) VALUES (
    p_user_id, 'pro', p_status, 'apple',
    p_original_transaction_id,
    p_expires_date, now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan = 'pro',
    status = p_status,
    provider = 'apple',
    provider_subscription_id = p_original_transaction_id,
    current_period_end = p_expires_date,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Downgrade to free (on cancel/expire)
CREATE OR REPLACE FUNCTION downgrade_to_free(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_subscriptions
  SET plan = 'free', status = 'expired', updated_at = now()
  WHERE user_id = p_user_id;

  INSERT INTO subscription_events (user_id, event_type)
  VALUES (p_user_id, 'expired');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== SUBSCRIPTION SYSTEM CREATED ===';
  RAISE NOTICE 'Tables: user_subscriptions, subscription_events';
  RAISE NOTICE 'Functions: can_add_to_backlog, can_add_favorite, can_follow_game';
  RAISE NOTICE 'Functions: get_user_subscription, get_plan_limits';
  RAISE NOTICE 'Functions: upsert_stripe_subscription, upsert_apple_subscription';
  RAISE NOTICE '';
  RAISE NOTICE 'Free tier limits: 5 backlog, 5 favorites, 10 followed';
  RAISE NOTICE 'Pro tier: unlimited + notifications + AI summaries';
  RAISE NOTICE '';
END $$;
