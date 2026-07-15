-- Fluent — migration 005: reading difficulty tiers (Easy / Medium / Hard).
-- Hard-tier passages lean on words with consonant clusters and blends that
-- are commonly harder to produce, framed as a challenge to grow into, never
-- as a test to fail.

alter table public.text_bank
  add column if not exists difficulty text not null default 'medium'
    check (difficulty in ('easy', 'medium', 'hard'));

-- Backfill existing seed content with a more accurate tier.
update public.text_bank set difficulty = 'easy' where content in (
  'My breath leads. My voice follows.',
  'I speak at my own pace, and that pace is enough.',
  'My voice does not need to hurry to be worth listening to.',
  'Good morning. I slept well and I am ready for today.',
  'Could you pass the salt, please? Thank you so much.',
  'Let us decide what to cook for dinner tonight, together.',
  'Good morning, team. Let us walk through today''s agenda.',
  'Can we take five minutes before the next call?',
  'I felt proud of myself today, even in a small way.',
  'I am learning to be patient with myself, one sentence at a time.',
  'Once upon a time, there was a small boat that was afraid of the sea.',
  'The dog barked once, then curled up by the fire and fell asleep.',
  'Hi, I would like to order a coffee, please. Small, with milk.',
  'Can I get the check, please?',
  'I am sorry I am running a few minutes late. I will be there shortly.'
);

-- Everything else seeded in migration_002 stays at the 'medium' default.

-- New hard-tier passages: consonant clusters, blends, and longer breath
-- groups that are genuinely more demanding to read aloud.
insert into public.text_bank (content, pace_tag, length_tag, category, difficulty) values
  ('Statistically speaking, strategic planning strengthens structural stability.', 'slow', 'short', 'affirmations', 'hard'),
  ('I approach each unpredictable, extraordinarily complex circumstance with steady, unshaken confidence.', 'slow', 'medium', 'affirmations', 'hard'),
  ('Vulnerability is not a weakness I must strategically suppress — it is proof of my willingness to speak truthfully, however imperfectly.', 'slow', 'long', 'affirmations', 'hard'),

  ('The specific prescription requires refrigeration and strict, structured scheduling.', 'slow', 'short', 'daily_life', 'hard'),
  ('We rescheduled the electrician''s appointment because the thermostat''s wiring was unexpectedly complicated.', 'slow', 'medium', 'daily_life', 'hard'),
  ('The grocery list included fresh strawberries, sparkling water, whole-grain crackers, and a particularly stubborn stain remover.', 'medium', 'long', 'daily_life', 'hard'),

  ('Quarterly projections require cross-departmental collaboration and careful prioritization.', 'slow', 'short', 'work', 'hard'),
  ('The spreadsheet''s pivot table summarizes procurement expenditures across six distinct subsidiaries.', 'slow', 'medium', 'work', 'hard'),
  ('Before finalizing the proposal, I want to acknowledge the logistical complexities our infrastructure team flagged during yesterday''s retrospective.', 'slow', 'long', 'work', 'hard'),

  ('Unexpectedly, gratitude and grief can occupy the same breath.', 'slow', 'short', 'emotions', 'hard'),
  ('Acknowledging uncomfortable, unresolved feelings takes more strength than pretending they aren''t there.', 'slow', 'medium', 'emotions', 'hard'),
  ('I''m still practicing distinguishing between constructive self-reflection and the familiar, exhausting habit of self-criticism.', 'slow', 'long', 'emotions', 'hard'),

  ('The shipwrecked sailors spotted an unfamiliar archipelago through the fog.', 'slow', 'short', 'storytelling', 'hard'),
  ('Beneath the crumbling, moss-covered bridge, the twins discovered a mysterious, rust-streaked key.', 'medium', 'medium', 'storytelling', 'hard'),
  ('The astronomer, squinting through her weather-beaten telescope, whispered that the constellation had shifted imperceptibly overnight.', 'slow', 'long', 'storytelling', 'hard'),

  ('Excuse me, could you clarify the cancellation and refund policy?', 'slow', 'short', 'real_life_scenarios', 'hard'),
  ('I''d like to dispute a discrepancy on my most recent statement, specifically the third transaction.', 'slow', 'medium', 'real_life_scenarios', 'hard'),
  ('Hello, I''m following up regarding the previously submitted paperwork — I believe there may have been a miscommunication about the required documentation.', 'slow', 'long', 'real_life_scenarios', 'hard')
on conflict do nothing;
