-- ============================================================================
-- GAMING APP DATABASE SETUP
-- Safe to run multiple times - handles existing tables and policies
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text,
  avatar_url text,
  preferred_platforms text[] default '{}',
  playstyle text default 'casual',
  notifications_enabled boolean default true,
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ============================================================================
-- GAMES TABLE
-- ============================================================================

create table if not exists public.games (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  cover_url text,
  platforms text[] default '{}',
  release_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.games enable row level security;

drop policy if exists "Anyone can view games" on public.games;
create policy "Anyone can view games"
  on public.games for select
  using (true);

-- ============================================================================
-- USER_GAMES TABLE
-- ============================================================================

create table if not exists public.user_games (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  game_id uuid references public.games(id) on delete cascade not null,
  is_favorite boolean default false,
  notify_major_patches boolean default true,
  notify_all_patches boolean default false,
  notify_news boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, game_id)
);

alter table public.user_games enable row level security;

drop policy if exists "Users can view their own games" on public.user_games;
create policy "Users can view their own games"
  on public.user_games for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own games" on public.user_games;
create policy "Users can insert their own games"
  on public.user_games for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own games" on public.user_games;
create policy "Users can update their own games"
  on public.user_games for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own games" on public.user_games;
create policy "Users can delete their own games"
  on public.user_games for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- PATCH_NOTES TABLE
-- ============================================================================

create table if not exists public.patch_notes (
  id uuid default uuid_generate_v4() primary key,
  game_id uuid references public.games(id) on delete cascade not null,
  title text not null,
  published_at timestamp with time zone not null,
  source_url text,
  raw_text text,
  summary_tldr text,
  key_changes jsonb default '[]'::jsonb,
  tags text[] default '{}',
  impact_score integer default 5 check (impact_score >= 1 and impact_score <= 10),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.patch_notes enable row level security;

drop policy if exists "Anyone can view patch notes" on public.patch_notes;
create policy "Anyone can view patch notes"
  on public.patch_notes for select
  using (true);

-- ============================================================================
-- NEWS_ITEMS TABLE
-- ============================================================================

create table if not exists public.news_items (
  id uuid default uuid_generate_v4() primary key,
  game_id uuid references public.games(id) on delete set null,
  title text not null,
  published_at timestamp with time zone not null,
  source_name text,
  source_url text,
  summary text,
  why_it_matters text,
  topics text[] default '{}',
  is_rumor boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.news_items enable row level security;

drop policy if exists "Anyone can view news items" on public.news_items;
create policy "Anyone can view news items"
  on public.news_items for select
  using (true);

-- ============================================================================
-- BOOKMARKS TABLE
-- ============================================================================

create table if not exists public.bookmarks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  entity_type text not null check (entity_type in ('patch', 'news')),
  entity_id uuid not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, entity_type, entity_id)
);

alter table public.bookmarks enable row level security;

drop policy if exists "Users can view their own bookmarks" on public.bookmarks;
create policy "Users can view their own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own bookmarks" on public.bookmarks;
create policy "Users can insert their own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own bookmarks" on public.bookmarks;
create policy "Users can delete their own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- BACKLOG_ITEMS TABLE
-- ============================================================================

create table if not exists public.backlog_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  status text not null check (status in ('playing','paused','backlog','finished','dropped')),
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  next_note text,
  last_played_at timestamp with time zone,
  started_at timestamp with time zone,
  finished_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table public.backlog_items enable row level security;

drop policy if exists "Users manage their own backlog" on public.backlog_items;
create policy "Users manage their own backlog"
  on public.backlog_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create unique index if not exists backlog_items_unique
  on public.backlog_items(user_id, game_id);

-- ============================================================================
-- USER_EVENTS TABLE
-- ============================================================================

create table if not exists public.user_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid references public.games(id) on delete set null,
  event_type text not null,
  event_at timestamp with time zone default now(),
  metadata jsonb default '{}'::jsonb
);

alter table public.user_events enable row level security;

drop policy if exists "Users manage their own events" on public.user_events;
create policy "Users manage their own events"
  on public.user_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists user_events_user_date_idx
  on public.user_events(user_id, event_at desc);

-- ============================================================================
-- SEED DATA - GAMES
-- ============================================================================

insert into public.games (name, slug, platforms, cover_url) values
  ('Fortnite', 'fortnite', array['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'], 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3wk8.jpg'),
  ('Call of Duty: Warzone', 'warzone', array['PC', 'PlayStation', 'Xbox'], 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2ket.jpg'),
  ('League of Legends', 'league-of-legends', array['PC'], 'https://images.igdb.com/igdb/image/upload/t_cover_big/co49wj.jpg'),
  ('Valorant', 'valorant', array['PC'], 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2mvt.jpg'),
  ('Apex Legends', 'apex-legends', array['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wzo.jpg'),
  ('Dota 2', 'dota-2', array['PC'], 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg'),
  ('Counter-Strike 2', 'cs2', array['PC'], 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6v4a.jpg'),
  ('Overwatch 2', 'overwatch-2', array['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5tkh.jpg'),
  ('Rocket League', 'rocket-league', array['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'], 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5w0w.jpg'),
  ('Destiny 2', 'destiny-2', array['PC', 'PlayStation', 'Xbox'], 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1xhj.jpg')
on conflict (slug) do update set cover_url = excluded.cover_url;

-- ============================================================================
-- SEED DATA - PATCH NOTES
-- ============================================================================

insert into public.patch_notes (game_id, title, published_at, summary_tldr, key_changes, tags, impact_score)
select
  g.id,
  'Chapter 5 Season 1: Underground',
  timezone('utc'::text, now()) - interval '2 days',
  'Major map overhaul with underground areas, new weapons, and mobility items. Society Islands theme with trains and ziplines.',
  '[
    {"category": "Map", "change": "New underground POIs with train system"},
    {"category": "Weapons", "change": "Ballistic Shield and Cluster Clingers added"},
    {"category": "Mobility", "change": "Nitro Fists and Flowberry Fizz for enhanced movement"}
  ]'::jsonb,
  array['Map Update', 'New Weapons', 'Mobility'],
  9
from public.games g where g.slug = 'fortnite'
on conflict do nothing;

insert into public.patch_notes (game_id, title, published_at, summary_tldr, key_changes, tags, impact_score)
select
  g.id,
  'Season 1 Reloaded',
  timezone('utc'::text, now()) - interval '5 days',
  'Mid-season update with weapon balancing, new map areas, and gameplay adjustments.',
  '[
    {"category": "Weapons", "change": "SVA 545 damage reduced at range"},
    {"category": "Map", "change": "New areas in Urzikstan"},
    {"category": "Balance", "change": "Armor plate capacity increased to 4"}
  ]'::jsonb,
  array['Balance', 'Map Update'],
  7
from public.games g where g.slug = 'warzone'
on conflict do nothing;

insert into public.patch_notes (game_id, title, published_at, summary_tldr, key_changes, tags, impact_score)
select
  g.id,
  'Patch 14.1',
  timezone('utc'::text, now()) - interval '1 day',
  'Champion balance updates for Hwei, Smolder, and item adjustments for tank supports.',
  '[
    {"category": "Champions", "change": "Hwei Q damage increased early game"},
    {"category": "Champions", "change": "Smolder W cooldown reduced"},
    {"category": "Items", "change": "Solstice Sleigh buffed for tank supports"}
  ]'::jsonb,
  array['Balance', 'Champions', 'Items'],
  6
from public.games g where g.slug = 'league-of-legends'
on conflict do nothing;

-- ============================================================================
-- SEED DATA - NEWS ITEMS
-- ============================================================================

-- Patch/Studio news
insert into news_items (game_id, title, published_at, source_name, summary, why_it_matters, topics, is_rumor)
select g.id,
       'Developer update: balancing priorities for next patch',
       now() - interval '3 days',
       'Official',
       'Developers shared what they are focusing on in the next update.',
       'Gives an early hint of what will be buffed/nerfed and when to expect changes.',
       array['Patch','Studio'],
       false
from games g
where g.slug in ('apex-legends','league-of-legends','valorant')
on conflict do nothing;

-- DLC announcements
insert into news_items (game_id, title, published_at, source_name, summary, why_it_matters, topics, is_rumor)
select g.id,
       'New expansion announced with two new maps and 50+ cosmetics',
       now() - interval '1 day',
       'Official Blog',
       'The upcoming DLC pack includes two new arena maps, a battle pass, and over 50 weapon skins.',
       'First major paid content drop this year. Early supporters get exclusive rewards.',
       array['DLC','Season'],
       false
from games g
where g.slug = 'destiny-2'
on conflict do nothing;

-- Season launch
insert into news_items (game_id, title, published_at, source_name, summary, why_it_matters, topics, is_rumor)
select g.id,
       'Season 8 launches next week with ranked overhaul',
       now() - interval '2 days',
       'Official',
       'New season brings a complete ranked system rework, new agent, and map rotation changes.',
       'Ranked players will need to re-calibrate. New agent expected to shake up the meta.',
       array['Season','Launch'],
       false
from games g
where g.slug = 'valorant'
on conflict do nothing;

-- Delay news
insert into news_items (game_id, title, published_at, source_name, summary, why_it_matters, topics, is_rumor)
select g.id,
       'Major update delayed by two weeks for additional polish',
       now() - interval '4 days',
       'Developer Twitter',
       'The highly anticipated update has been pushed back to ensure quality and stability.',
       'Players will have to wait longer, but the extra time should mean fewer launch bugs.',
       array['Delay','Patch'],
       false
from games g
where g.slug = 'overwatch-2'
on conflict do nothing;

-- Beta announcement
insert into news_items (game_id, title, published_at, source_name, summary, why_it_matters, topics, is_rumor)
select g.id,
       'Closed beta signups open for new game mode',
       now() - interval '12 hours',
       'Official',
       'A new competitive mode is entering closed beta. Players can sign up now for early access.',
       'Early testers will influence the final design. Beta rewards likely for participants.',
       array['Beta','Launch'],
       false
from games g
where g.slug = 'cs2'
on conflict do nothing;

-- Studio news (general, no game)
insert into news_items (game_id, title, published_at, source_name, summary, why_it_matters, topics, is_rumor)
values (
  null,
  'Major publisher announces three new studios joining the family',
  now() - interval '6 hours',
  'Press Release',
  'Three independent studios have been acquired to work on unannounced projects.',
  'Could signal new IP announcements in the coming months.',
  array['Studio'],
  false
)
on conflict do nothing;

-- Rumor example
insert into news_items (game_id, title, published_at, source_name, summary, why_it_matters, topics, is_rumor)
select g.id,
       'Leak suggests crossover event with major anime franchise',
       now() - interval '8 hours',
       'Leaker Account',
       'Dataminers found files suggesting an upcoming collaboration with a popular anime series.',
       'If true, expect themed skins and possibly a limited-time mode.',
       array['DLC','Season'],
       true
from games g
where g.slug = 'fortnite'
on conflict do nothing;

-- Launch news
insert into news_items (game_id, title, published_at, source_name, summary, why_it_matters, topics, is_rumor)
select g.id,
       'Console version officially launches this month',
       now() - interval '5 days',
       'Official',
       'After years on PC, the game is finally coming to PlayStation and Xbox with cross-play support.',
       'Huge influx of new players expected. Cross-play means larger matchmaking pools.',
       array['Launch'],
       false
from games g
where g.slug = 'league-of-legends'
on conflict do nothing;

-- ============================================================================
-- COMPLETE
-- ============================================================================

-- Verify tables created
select
  'Tables created successfully. Run this query to verify:' as message
union all
select
  '  SELECT table_name FROM information_schema.tables WHERE table_schema = ''public'' ORDER BY table_name;'
;
