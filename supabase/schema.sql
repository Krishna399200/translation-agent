-- Fluent — Supabase schema
-- Run this once in your Supabase project's SQL editor (Database → SQL Editor).

-- 1. Profiles ---------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  baseline_confidence smallint check (baseline_confidence between 1 and 10),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- 2. Practice sessions --------------------------------------------------------

create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  phrase_id text not null,
  audio_url text not null,
  duration_seconds numeric not null,
  self_rating smallint not null check (self_rating between 1 and 5),
  baseline_confidence smallint check (baseline_confidence between 1 and 10)
);

alter table public.practice_sessions enable row level security;

create policy "practice_sessions: read own" on public.practice_sessions
  for select using (auth.uid() = user_id);

create policy "practice_sessions: insert own" on public.practice_sessions
  for insert with check (auth.uid() = user_id);

create policy "practice_sessions: delete own" on public.practice_sessions
  for delete using (auth.uid() = user_id);

create index if not exists practice_sessions_user_created_idx
  on public.practice_sessions (user_id, created_at);

-- 3. Storage: private recordings bucket --------------------------------------
-- Files are stored under a path of the form "<user_id>/<session_id>.webm"
-- so RLS can scope access to the folder matching the signed-in user.

insert into storage.buckets (id, name, public)
values ('recordings', 'recordings', false)
on conflict (id) do nothing;

create policy "recordings: read own" on storage.objects
  for select using (
    bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "recordings: upload own" on storage.objects
  for insert with check (
    bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "recordings: delete own" on storage.objects
  for delete using (
    bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text
  );
