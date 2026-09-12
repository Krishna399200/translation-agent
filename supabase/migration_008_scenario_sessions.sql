-- Fluent — migration 008: Scenario Simulation (Phase 2, Level 1 — audio
-- only, no camera). Kept as its own table rather than folded into
-- practice_sessions since scenarios have a distinct shape (scenario_type,
-- no baseline_confidence/practice_type concerns).

create table if not exists public.scenario_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  scenario_type text not null check (scenario_type in ('interview', 'lecture', 'classroom', 'hosting')),
  text_bank_id uuid references public.text_bank (id) on delete set null,
  audio_url text not null,
  duration_seconds numeric not null,
  self_rating smallint check (self_rating between 1 and 5),
  created_at timestamptz not null default now()
);

alter table public.scenario_sessions enable row level security;

create policy "scenario_sessions: read own" on public.scenario_sessions
  for select using (auth.uid() = user_id);

create policy "scenario_sessions: insert own" on public.scenario_sessions
  for insert with check (auth.uid() = user_id);

create policy "scenario_sessions: update own" on public.scenario_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "scenario_sessions: delete own" on public.scenario_sessions
  for delete using (auth.uid() = user_id);
