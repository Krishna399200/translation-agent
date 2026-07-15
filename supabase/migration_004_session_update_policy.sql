-- Fluent — migration 004: allow updating a session's self_rating after the
-- fact. Practice sessions now save immediately on finish (self_rating null)
-- so replay never blocks on the feedback screen; the optional "How did that
-- feel?" flow updates the same row afterward instead of inserting a new one.
-- Without this policy, RLS silently blocks that update.

create policy "practice_sessions: update own" on public.practice_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
