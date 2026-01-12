-- Cron job lock table to prevent overlapping runs
CREATE TABLE IF NOT EXISTS cron_locks (
  job_name TEXT PRIMARY KEY,
  locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_by TEXT,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_cron_locks_expires_at ON cron_locks(expires_at);

-- Function to acquire a lock (returns true if lock acquired)
CREATE OR REPLACE FUNCTION acquire_cron_lock(
  p_job_name TEXT,
  p_locked_by TEXT DEFAULT NULL,
  p_lock_duration_minutes INT DEFAULT 10
)
RETURNS BOOLEAN AS $$
DECLARE
  v_acquired BOOLEAN := FALSE;
BEGIN
  -- First, clean up expired locks
  DELETE FROM cron_locks WHERE expires_at < NOW();

  -- Try to insert a new lock
  INSERT INTO cron_locks (job_name, locked_by, expires_at)
  VALUES (p_job_name, p_locked_by, NOW() + (p_lock_duration_minutes || ' minutes')::INTERVAL)
  ON CONFLICT (job_name) DO NOTHING;

  -- Check if we got the lock
  SELECT TRUE INTO v_acquired
  FROM cron_locks
  WHERE job_name = p_job_name
    AND (locked_by = p_locked_by OR locked_by IS NULL);

  RETURN COALESCE(v_acquired, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Function to release a lock
CREATE OR REPLACE FUNCTION release_cron_lock(p_job_name TEXT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM cron_locks WHERE job_name = p_job_name;
END;
$$ LANGUAGE plpgsql;
