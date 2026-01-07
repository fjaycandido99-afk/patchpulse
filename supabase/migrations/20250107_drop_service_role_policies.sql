-- ============================================================================
-- DROP SERVICE ROLE POLICIES
-- Service role bypasses RLS automatically, so these policies are unnecessary
-- and trigger "RLS Policy Always True" warnings
-- ============================================================================

-- Drop all "Service role manages..." policies
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE policyname LIKE 'Service role%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    RAISE NOTICE 'Dropped policy: % on %.%', r.policyname, r.schemaname, r.tablename;
  END LOOP;
END $$;

-- Drop other overly permissive policies on admin tables
DO $$ BEGIN DROP POLICY IF EXISTS "Anyone can view discovery attempts" ON game_discovery_attempts; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can manage discovery attempts" ON game_discovery_attempts; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Anyone can view discovery queue" ON game_discovery_queue; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can view all discovery requests" ON game_discovery_queue; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Admins can manage discovery queue" ON game_discovery_queue; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Anyone can view release queue" ON release_discovery_queue; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Anyone can view seasonal queue" ON seasonal_discovery_queue; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Anyone can view return suggestions" ON return_suggestions; EXCEPTION WHEN undefined_table THEN NULL; END $$;

SELECT 'Dropped service role and overly permissive policies' AS message;
