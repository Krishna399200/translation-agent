-- Fluent — migration 003: in-the-moment comfort features.
-- Quick Calm exercises, "that was hard" check-ins, saved affirmations, and a
-- gentle daily mood check-in. None of these are scored or streak-tracked.
-- Run this in the SQL Editor after schema.sql and migration_002.

-- 1. Quick Calm usage log (silent, comfort-first, never surfaced as a task) --

create table if not exists public.quick_calm_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_type text not null check (exercise_type in
    ('physiological_sigh', 'box_breathing', 'alternate_nostril', 'third_eye_awareness')),
  created_at timestamptz not null default now()
);

alter table public.quick_calm_sessions enable row level security;

create policy "quick_calm_sessions: read own" on public.quick_calm_sessions
  for select using (auth.uid() = user_id);

create policy "quick_calm_sessions: insert own" on public.quick_calm_sessions
  for insert with check (auth.uid() = user_id);

-- 2. "That was hard" moment check-ins (no recording) -----------------------

create table if not exists public.moment_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  sentiment smallint not null check (sentiment between 1 and 5),
  note text,
  created_at timestamptz not null default now()
);

alter table public.moment_checkins enable row level security;

create policy "moment_checkins: read own" on public.moment_checkins
  for select using (auth.uid() = user_id);

create policy "moment_checkins: insert own" on public.moment_checkins
  for insert with check (auth.uid() = user_id);

create policy "moment_checkins: delete own" on public.moment_checkins
  for delete using (auth.uid() = user_id);

-- 3. Saved affirmations (bookmarks into text_bank) --------------------------

create table if not exists public.user_saved_affirmations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  text_bank_id uuid not null references public.text_bank (id) on delete cascade,
  saved_at timestamptz not null default now(),
  unique (user_id, text_bank_id)
);

alter table public.user_saved_affirmations enable row level security;

create policy "user_saved_affirmations: read own" on public.user_saved_affirmations
  for select using (auth.uid() = user_id);

create policy "user_saved_affirmations: insert own" on public.user_saved_affirmations
  for insert with check (auth.uid() = user_id);

create policy "user_saved_affirmations: delete own" on public.user_saved_affirmations
  for delete using (auth.uid() = user_id);

-- 4. Gentle daily check-in (independent of practice sessions) --------------

create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  sentiment smallint not null check (sentiment between 1 and 5),
  checkin_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, checkin_date)
);

alter table public.daily_checkins enable row level security;

create policy "daily_checkins: read own" on public.daily_checkins
  for select using (auth.uid() = user_id);

create policy "daily_checkins: insert own" on public.daily_checkins
  for insert with check (auth.uid() = user_id);
