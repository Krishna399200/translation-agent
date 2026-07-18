-- Fluent — migration 010: AI Mentor companion, part 1 (consent, settings,
-- safety logging). Deliberately does NOT wire up feedback generation yet —
-- see the app code comments; that's a follow-up once the guardrail and
-- consent flow are reviewed.
--
-- Note: the original request said "alter table user_profiles" — this app's
-- actual table is named `profiles` (see supabase/schema.sql), so that's
-- what's altered here.

alter table public.profiles
  add column if not exists mentor_name text not null default 'Kai',
  add column if not exists mentor_feedback_enabled boolean not null default true,
  add column if not exists mentor_voice_enabled boolean not null default true,
  add column if not exists mentor_onboarded_at timestamptz;

create table if not exists public.mentor_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_id uuid, -- references whichever session table triggered it; no FK
                    -- since it can point at practice_sessions, scenario_sessions,
                    -- or moment_checkins depending on practice_type
  practice_type text,
  reflection_text text,
  flagged_for_safety boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.mentor_reflections enable row level security;

create policy "mentor_reflections: read own" on public.mentor_reflections
  for select using (auth.uid() = user_id);

create policy "mentor_reflections: insert own" on public.mentor_reflections
  for insert with check (auth.uid() = user_id);
