-- ============================================================================
-- AI FEATURES - Job Queue & Cache
-- Run this migration after supabase-setup.sql
-- ============================================================================

-- ============================================================================
-- 1. AI JOBS TABLE (Background processing queue)
-- ============================================================================

create table if not exists public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null check (job_type in ('PATCH_SUMMARY', 'NEWS_SUMMARY')),
  entity_id uuid not null,
  status text not null default 'pending' check (status in ('pending', 'running', 'done', 'failed')),
  attempts int not null default 0,
  max_attempts int not null default 3,
  error_message text,
  result jsonb,
  created_at timestamp with time zone default now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone
);

-- Index for worker to find pending jobs
create index if not exists ai_jobs_pending_idx
  on public.ai_jobs(status, created_at)
  where status = 'pending';

-- Index for finding jobs by entity
create index if not exists ai_jobs_entity_idx
  on public.ai_jobs(job_type, entity_id);

-- RLS: Only service role can access
alter table public.ai_jobs enable row level security;

-- Claim next pending job atomically
create or replace function claim_next_ai_job(p_job_type text default null)
returns setof ai_jobs
language plpgsql
as $$
declare
  v_job ai_jobs;
begin
  update ai_jobs
  set
    status = 'running',
    started_at = now(),
    attempts = attempts + 1
  where id = (
    select id from ai_jobs
    where status = 'pending'
      and (p_job_type is null or job_type = p_job_type)
      and attempts < max_attempts
    order by created_at
    limit 1
    for update skip locked
  )
  returning * into v_job;

  if v_job.id is not null then
    return next v_job;
  end if;
  return;
end;
$$;

-- Mark job done
create or replace function complete_ai_job(p_job_id uuid, p_result jsonb)
returns void
language plpgsql
as $$
begin
  update ai_jobs
  set status = 'done', result = p_result, completed_at = now()
  where id = p_job_id;
end;
$$;

-- Mark job failed (retries if under max_attempts)
create or replace function fail_ai_job(p_job_id uuid, p_error text)
returns void
language plpgsql
as $$
begin
  update ai_jobs
  set
    status = case when attempts >= max_attempts then 'failed' else 'pending' end,
    error_message = p_error
  where id = p_job_id;
end;
$$;

-- ============================================================================
-- 2. WHAT'S NEW CACHE (Personalized summaries)
-- ============================================================================

create table if not exists public.whats_new_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  since_date timestamp with time zone not null,
  summary text not null,
  patch_count int not null default 0,
  news_count int not null default 0,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default now(),
  unique(user_id, game_id)
);

alter table public.whats_new_cache enable row level security;

-- RLS policies
drop policy if exists "Users can view their own cache" on public.whats_new_cache;
create policy "Users can view their own cache"
  on public.whats_new_cache for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own cache" on public.whats_new_cache;
create policy "Users can insert their own cache"
  on public.whats_new_cache for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own cache" on public.whats_new_cache;
create policy "Users can update their own cache"
  on public.whats_new_cache for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own cache" on public.whats_new_cache;
create policy "Users can delete their own cache"
  on public.whats_new_cache for delete using (auth.uid() = user_id);

-- Indexes
create index if not exists whats_new_cache_lookup_idx
  on public.whats_new_cache(user_id, game_id);

create index if not exists whats_new_cache_expires_idx
  on public.whats_new_cache(expires_at);

-- Cleanup expired cache entries
create or replace function cleanup_expired_whats_new_cache()
returns int
language plpgsql
security definer
as $$
declare
  deleted_count int;
begin
  delete from public.whats_new_cache where expires_at < now();
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- ============================================================================
-- DONE
-- ============================================================================

select 'AI tables created: ai_jobs, whats_new_cache' as message;
