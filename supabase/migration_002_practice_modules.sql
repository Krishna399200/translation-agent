-- Fluent — migration 002: practice modules (Mantra, Sound Foundations, Words That
-- Challenge Me), dynamic text bank, journal, and persistent settings.
-- Run this in the SQL Editor after supabase/schema.sql.

-- 1. Profile settings ---------------------------------------------------------

alter table public.profiles
  add column if not exists tone_432hz_enabled boolean not null default false,
  add column if not exists no_pressure_mode boolean not null default false,
  add column if not exists last_journal_prompt_at timestamptz;

-- 2. practice_sessions: practice_type + unscored (journal / no-pressure) sessions --

alter table public.practice_sessions
  add column if not exists practice_type text not null default 'reading_text'
    check (practice_type in ('reading_text', 'mantra', 'varnamala', 'trigger_words', 'journal'));

alter table public.practice_sessions
  alter column self_rating drop not null;

-- 3. Dynamic text bank ---------------------------------------------------------

create table if not exists public.text_bank (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  pace_tag text not null check (pace_tag in ('slow', 'medium', 'fast')),
  length_tag text not null check (length_tag in ('short', 'medium', 'long')),
  category text not null check (category in
    ('daily_life', 'work', 'emotions', 'storytelling', 'affirmations', 'real_life_scenarios')),
  created_at timestamptz not null default now()
);

alter table public.text_bank enable row level security;

create policy "text_bank: read (any signed-in user)" on public.text_bank
  for select using (auth.role() = 'authenticated');

insert into public.text_bank (content, pace_tag, length_tag, category) values
  ('My breath leads. My voice follows.', 'slow', 'short', 'affirmations'),
  ('I speak at my own pace, and that pace is enough.', 'medium', 'short', 'affirmations'),
  ('Every word I offer today is worth hearing, exactly as it comes out.', 'medium', 'medium', 'affirmations'),
  ('I am not behind. I am not late. I am simply speaking in my own time, and that time belongs to me.', 'slow', 'long', 'affirmations'),
  ('My voice does not need to hurry to be worth listening to.', 'medium', 'short', 'affirmations'),
  ('There is nothing wrong with the shape of my sentences. They are mine, and they are enough.', 'slow', 'medium', 'affirmations'),

  ('Good morning. I slept well and I am ready for today.', 'medium', 'short', 'daily_life'),
  ('Could you pass the salt, please? Thank you so much.', 'medium', 'short', 'daily_life'),
  ('I need to stop by the store on my way home to pick up a few things for dinner.', 'medium', 'medium', 'daily_life'),
  ('This morning I made a cup of tea, sat by the window, and watched the street slowly wake up.', 'slow', 'long', 'daily_life'),
  ('The bus was a few minutes late today, so I had time to finish my coffee.', 'fast', 'medium', 'daily_life'),
  ('Let us decide what to cook for dinner tonight, together.', 'medium', 'short', 'daily_life'),

  ('Good morning, team. Let us walk through today’s agenda.', 'medium', 'short', 'work'),
  ('I would like to schedule a follow-up meeting to discuss the project timeline.', 'medium', 'medium', 'work'),
  ('Thank you for your patience while we worked through those changes together.', 'slow', 'medium', 'work'),
  ('Before we close, I want to walk the team through the three main takeaways from this quarter, one at a time.', 'medium', 'long', 'work'),
  ('Can we take five minutes before the next call?', 'fast', 'short', 'work'),
  ('I have prepared a short summary of our progress so far, and I am happy to answer questions.', 'medium', 'medium', 'work'),

  ('I felt proud of myself today, even in a small way.', 'slow', 'short', 'emotions'),
  ('It is okay to feel nervous before speaking. That feeling will pass.', 'medium', 'medium', 'emotions'),
  ('Some days my voice feels steady, and some days it does not. Both days are allowed.', 'slow', 'medium', 'emotions'),
  ('I noticed I was holding my breath, so I let it go, and I felt a little lighter.', 'slow', 'medium', 'emotions'),
  ('I am learning to be patient with myself, one sentence at a time.', 'medium', 'short', 'emotions'),
  ('Even when the words do not come easily, what I have to say still matters.', 'slow', 'long', 'emotions'),

  ('Once upon a time, there was a small boat that was afraid of the sea.', 'slow', 'short', 'storytelling'),
  ('The old lighthouse had stood on the cliff for a hundred years, guiding ships home through every storm.', 'medium', 'medium', 'storytelling'),
  ('She opened the door slowly, unsure of what she would find on the other side.', 'medium', 'medium', 'storytelling'),
  ('Long ago, in a quiet village between two mountains, a young musician learned to play by listening to the wind.', 'slow', 'long', 'storytelling'),
  ('The dog barked once, then curled up by the fire and fell asleep.', 'fast', 'short', 'storytelling'),
  ('Every evening, the baker left bread on the windowsill for anyone who needed it.', 'medium', 'medium', 'storytelling'),

  ('Hi, I would like to order a coffee, please. Small, with milk.', 'medium', 'short', 'real_life_scenarios'),
  ('Excuse me, could you tell me how to get to the train station from here?', 'medium', 'medium', 'real_life_scenarios'),
  ('Hello, I am calling to confirm my appointment for tomorrow afternoon.', 'medium', 'medium', 'real_life_scenarios'),
  ('Hi, my name is Sam, and it is nice to meet you. I am looking forward to working together.', 'slow', 'long', 'real_life_scenarios'),
  ('Can I get the check, please?', 'fast', 'short', 'real_life_scenarios'),
  ('I am sorry I am running a few minutes late. I will be there shortly.', 'medium', 'medium', 'real_life_scenarios')
on conflict do nothing;

-- 4. Trigger words (shared word bank + user-added custom words) ----------------

create table if not exists public.trigger_words (
  id uuid primary key default gen_random_uuid(),
  word text not null,
  category text not null,
  phrase_level_1 text not null,
  phrase_level_2 text not null,
  phrase_level_3 text not null
);

alter table public.trigger_words enable row level security;

create policy "trigger_words: read (any signed-in user)" on public.trigger_words
  for select using (auth.role() = 'authenticated');

insert into public.trigger_words (word, category, phrase_level_1, phrase_level_2, phrase_level_3) values
  ('Please', 'p_b_sounds', 'Please.', 'Please pass that.', 'Could you please pass that to me?'),
  ('Ball', 'p_b_sounds', 'Ball.', 'The ball rolled.', 'The ball rolled across the quiet room.'),
  ('Table', 't_d_sounds', 'Table.', 'The table.', 'The table is set for dinner tonight.'),
  ('Door', 't_d_sounds', 'Door.', 'Open the door.', 'Could you open the door for me, please?'),
  ('Coffee', 'k_g_sounds', 'Coffee.', 'A cup of coffee.', 'I would like a cup of coffee, please.'),
  ('Good', 'k_g_sounds', 'Good.', 'That sounds good.', 'That sounds good to me, thank you.'),
  ('My name is', 'personal_identifiers', 'My name.', 'My name is Sam.', 'Hello, my name is Sam, nice to meet you.'),
  ('I live in', 'personal_identifiers', 'I live.', 'I live nearby.', 'I live just a few minutes from here.'),
  ('I work as', 'professional_words', 'I work.', 'I work in design.', 'I work as a designer at a small studio.'),
  ('Presentation', 'professional_words', 'Presentation.', 'Give a presentation.', 'I will give a short presentation this afternoon.')
on conflict do nothing;

create table if not exists public.user_trigger_words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  word text not null,
  added_at timestamptz not null default now()
);

alter table public.user_trigger_words enable row level security;

create policy "user_trigger_words: read own" on public.user_trigger_words
  for select using (auth.uid() = user_id);

create policy "user_trigger_words: insert own" on public.user_trigger_words
  for insert with check (auth.uid() = user_id);

create policy "user_trigger_words: delete own" on public.user_trigger_words
  for delete using (auth.uid() = user_id);
