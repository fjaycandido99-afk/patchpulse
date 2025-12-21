-- ============================================================================
-- CONNECTED ACCOUNTS & GAME LIBRARY
-- Run after supabase-setup.sql
-- ============================================================================

-- ============================================================================
-- 1. CONNECTED ACCOUNTS (Steam, Xbox, PSN, etc.)
-- ============================================================================

create table if not exists public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('steam', 'xbox', 'psn', 'epic', 'battlenet', 'riot')),
  external_user_id text not null,
  display_name text,
  avatar_url text,
  access_token text,
  refresh_token text,
  scopes text[],
  last_sync_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  unique(user_id, provider)
);

alter table public.connected_accounts enable row level security;

drop policy if exists "Users can view their own connected accounts" on public.connected_accounts;
create policy "Users can view their own connected accounts"
  on public.connected_accounts for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own connected accounts" on public.connected_accounts;
create policy "Users can insert their own connected accounts"
  on public.connected_accounts for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own connected accounts" on public.connected_accounts;
create policy "Users can update their own connected accounts"
  on public.connected_accounts for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own connected accounts" on public.connected_accounts;
create policy "Users can delete their own connected accounts"
  on public.connected_accounts for delete using (auth.uid() = user_id);

create index if not exists connected_accounts_user_idx
  on public.connected_accounts(user_id);

-- ============================================================================
-- 2. USER LIBRARY GAMES (Imported from Steam, etc.)
-- ============================================================================

create table if not exists public.user_library_games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,
  provider_game_id text not null,
  name text not null,
  cover_url text,
  playtime_minutes int default 0,
  last_played_at timestamp with time zone,
  game_id uuid references public.games(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, provider, provider_game_id)
);

alter table public.user_library_games enable row level security;

drop policy if exists "Users can view their own library" on public.user_library_games;
create policy "Users can view their own library"
  on public.user_library_games for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own library" on public.user_library_games;
create policy "Users can insert their own library"
  on public.user_library_games for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own library" on public.user_library_games;
create policy "Users can update their own library"
  on public.user_library_games for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own library" on public.user_library_games;
create policy "Users can delete their own library"
  on public.user_library_games for delete using (auth.uid() = user_id);

create index if not exists user_library_games_user_idx
  on public.user_library_games(user_id);

create index if not exists user_library_games_provider_idx
  on public.user_library_games(user_id, provider);

-- ============================================================================
-- 3. SYNC JOBS (For background imports)
-- ============================================================================

create table if not exists public.sync_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null,
  job_type text not null check (job_type in ('library_import', 'recent_games')),
  status text not null default 'pending' check (status in ('pending', 'running', 'done', 'failed')),
  games_imported int default 0,
  last_error text,
  created_at timestamp with time zone default now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone
);

alter table public.sync_jobs enable row level security;

drop policy if exists "Users can view their own sync jobs" on public.sync_jobs;
create policy "Users can view their own sync jobs"
  on public.sync_jobs for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own sync jobs" on public.sync_jobs;
create policy "Users can insert their own sync jobs"
  on public.sync_jobs for insert with check (auth.uid() = user_id);

create index if not exists sync_jobs_user_idx
  on public.sync_jobs(user_id, created_at desc);

-- ============================================================================
-- DONE
-- ============================================================================

select 'Connected accounts tables created' as message;
