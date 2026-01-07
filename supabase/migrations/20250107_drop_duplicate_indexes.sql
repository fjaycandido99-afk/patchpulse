-- ============================================================================
-- DROP DUPLICATE INDEXES
-- Remove indexes that duplicate existing ones
-- ============================================================================

-- Find and drop duplicate indexes (keep the older one)
DO $$
DECLARE
  dup RECORD;
BEGIN
  FOR dup IN
    WITH index_info AS (
      SELECT
        t.relname as tablename,
        i.relname as indexname,
        array_to_string(array_agg(a.attname ORDER BY x.n), ',') as columns
      FROM pg_index ix
      JOIN pg_class t ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      JOIN LATERAL unnest(ix.indkey) WITH ORDINALITY AS x(attnum, n) ON TRUE
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = x.attnum
      WHERE n.nspname = 'public'
      GROUP BY t.relname, i.relname
    ),
    duplicates AS (
      SELECT
        a.tablename,
        a.indexname as keep_index,
        b.indexname as drop_index,
        a.columns
      FROM index_info a
      JOIN index_info b ON a.tablename = b.tablename
        AND a.columns = b.columns
        AND a.indexname < b.indexname
      WHERE b.indexname LIKE 'idx_%'  -- Only drop our new indexes
    )
    SELECT drop_index FROM duplicates
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS public.%I', dup.drop_index);
    RAISE NOTICE 'Dropped duplicate: %', dup.drop_index;
  END LOOP;
END $$;

SELECT 'Duplicate indexes removed' AS message;
