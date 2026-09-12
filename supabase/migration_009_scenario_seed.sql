-- Fluent — migration 009: seed a handful of real_life_scenarios passages
-- per scenario_type so /scenarios has real content immediately, without
-- requiring `npm run generate:passages` first. Half include the
-- {trigger_word_slot} personalization placeholder.

insert into public.text_bank (content, pace_tag, length_tag, category, difficulty, scenario_type) values
  ('Hi, thank you for having me. My name is Sam, and I''ve been looking forward to this conversation.', 'medium', 'medium', 'real_life_scenarios', 'easy', 'interview'),
  ('I''m excited to be here today. I''d love to start by telling you a bit about {trigger_word_slot}.', 'medium', 'medium', 'real_life_scenarios', 'medium', 'interview'),
  ('Thanks for the introduction. To start, I want to share why {trigger_word_slot} matters to me and how it shaped my path here.', 'slow', 'long', 'real_life_scenarios', 'medium', 'interview'),

  ('Good morning, everyone. Thank you for being here — let''s get started.', 'medium', 'short', 'real_life_scenarios', 'easy', 'lecture'),
  ('Welcome, everyone. Today I want to talk about {trigger_word_slot}, and why it matters more than we usually admit.', 'medium', 'medium', 'real_life_scenarios', 'medium', 'lecture'),
  ('Thank you all for coming. Over the next few minutes, I''m going to walk you through {trigger_word_slot}, one step at a time, so bear with me.', 'slow', 'long', 'real_life_scenarios', 'hard', 'lecture'),

  ('Today I''m going to read a short passage about the ocean.', 'medium', 'short', 'real_life_scenarios', 'easy', 'classroom'),
  ('The passage I chose today is about {trigger_word_slot}, because it reminded me of something we talked about last week.', 'medium', 'medium', 'real_life_scenarios', 'medium', 'classroom'),
  ('For my reading today, I picked something about {trigger_word_slot} — I hope you find it as interesting as I did when I first read it.', 'slow', 'long', 'real_life_scenarios', 'medium', 'classroom'),

  ('Hey everyone, welcome back to the show. Glad to have you here.', 'medium', 'short', 'real_life_scenarios', 'easy', 'hosting'),
  ('Welcome back, everyone. Today''s episode is all about {trigger_word_slot}, and I think you''re going to love this one.', 'medium', 'medium', 'real_life_scenarios', 'medium', 'hosting'),
  ('Alright, let''s get into it. Today we''re diving into {trigger_word_slot}, and I''ve got a great story to kick things off.', 'slow', 'long', 'real_life_scenarios', 'hard', 'hosting')
on conflict do nothing;
