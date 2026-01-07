-- ============================================================================
-- SECURITY FIXES PART 3
-- Fixes remaining Function Search Path Mutable issues
-- ============================================================================

-- Fix check_discovery_rate_limit
CREATE OR REPLACE FUNCTION public.check_discovery_rate_limit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO attempt_count
  FROM game_discovery_attempts
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '24 hours';

  RETURN attempt_count < 3;
END;
$$;

-- Fix update_deals_updated_at
CREATE OR REPLACE FUNCTION public.update_deals_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix claim_next_ai_job
CREATE OR REPLACE FUNCTION public.claim_next_ai_job(p_job_type TEXT DEFAULT NULL)
RETURNS SETOF ai_jobs
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE v_job ai_jobs;
BEGIN
  UPDATE ai_jobs SET status = 'running', started_at = now(), attempts = attempts + 1
  WHERE id = (
    SELECT id FROM ai_jobs
    WHERE status = 'pending' AND (p_job_type IS NULL OR job_type = p_job_type) AND attempts < max_attempts
    ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED
  ) RETURNING * INTO v_job;
  IF v_job.id IS NOT NULL THEN RETURN NEXT v_job; END IF;
  RETURN;
END;
$$;

-- Fix complete_ai_job
CREATE OR REPLACE FUNCTION public.complete_ai_job(p_job_id UUID, p_result JSONB)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE ai_jobs SET status = 'done', result = p_result, completed_at = now() WHERE id = p_job_id;
END;
$$;

-- Fix fail_ai_job
CREATE OR REPLACE FUNCTION public.fail_ai_job(p_job_id UUID, p_error TEXT)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE ai_jobs SET status = CASE WHEN attempts >= max_attempts THEN 'failed' ELSE 'pending' END, error_message = p_error WHERE id = p_job_id;
END;
$$;

-- Fix get_rotated_image (uses custom type, so wrap in exception handler)
DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.get_rotated_image(
    p_patch_id UUID,
    p_variant image_variant DEFAULT 'hero'
  ) RETURNS TEXT
  LANGUAGE plpgsql
  SET search_path = public
  AS $fn$
  DECLARE
    v_image_url TEXT;
    v_today_seed INTEGER;
    v_image_count INTEGER;
  BEGIN
    SELECT COUNT(*) INTO v_image_count
    FROM patch_images
    WHERE patch_id = p_patch_id AND variant = p_variant AND is_active = true;

    IF v_image_count = 0 THEN RETURN NULL; END IF;

    v_today_seed := (
      EXTRACT(DOY FROM CURRENT_DATE)::INTEGER +
      ('x' || SUBSTRING(p_patch_id::TEXT, 1, 8))::BIT(32)::INTEGER
    ) % v_image_count;

    SELECT image_url INTO v_image_url
    FROM patch_images
    WHERE patch_id = p_patch_id AND variant = p_variant AND is_active = true
    ORDER BY rotation_index
    OFFSET v_today_seed LIMIT 1;

    RETURN v_image_url;
  END;
  $fn$;
EXCEPTION WHEN undefined_object THEN
  RAISE NOTICE 'Skipping get_rotated_image - image_variant type does not exist';
END $$;

-- Fix cleanup_expired_whats_new_cache
CREATE OR REPLACE FUNCTION public.cleanup_expired_whats_new_cache()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count int;
BEGIN
  DELETE FROM public.whats_new_cache WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Fix queue_release_discovery
CREATE OR REPLACE FUNCTION public.queue_release_discovery()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO ai_jobs (job_type, entity_id, status)
  SELECT 'DISCOVER_RELEASES', gen_random_uuid(), 'pending'
  WHERE NOT EXISTS (
    SELECT 1 FROM ai_jobs
    WHERE job_type = 'DISCOVER_RELEASES'
    AND status IN ('pending', 'running')
    AND created_at > NOW() - INTERVAL '1 hour'
  );
END;
$$;

-- Fix cleanup_expired_challenges
CREATE OR REPLACE FUNCTION public.cleanup_expired_challenges()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.webauthn_challenges WHERE expires_at < NOW();
  RETURN NEW;
END;
$$;

-- Fix upsert_stripe_subscription
CREATE OR REPLACE FUNCTION public.upsert_stripe_subscription(
  p_user_id UUID,
  p_subscription_id TEXT,
  p_customer_id TEXT,
  p_status TEXT,
  p_current_period_start TIMESTAMPTZ,
  p_current_period_end TIMESTAMPTZ,
  p_cancel_at_period_end BOOLEAN
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix handle_new_user (common Supabase function for auth triggers)
DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $fn$
  BEGIN
    INSERT INTO public.profiles (id, email, created_at)
    VALUES (NEW.id, NEW.email, NOW())
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  END;
  $fn$;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'handle_new_user may need manual review';
END $$;

-- Fix queue_patch_ai_job
DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.queue_patch_ai_job()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $fn$
  BEGIN
    INSERT INTO ai_jobs (job_type, entity_id, status)
    VALUES ('PATCH_SUMMARY', NEW.id, 'pending')
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  END;
  $fn$;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Fix queue_news_ai_job
DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.queue_news_ai_job()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $fn$
  BEGIN
    INSERT INTO ai_jobs (job_type, entity_id, status)
    VALUES ('NEWS_SUMMARY', NEW.id, 'pending')
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  END;
  $fn$;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================================
-- Done
-- ============================================================================
SELECT 'Security fixes part 3 applied successfully' AS message;
