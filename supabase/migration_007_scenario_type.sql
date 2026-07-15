-- Fluent — migration 007: tag real_life_scenarios passages by scenario, so
-- the batch generation script and the upcoming Scenario Simulation module
-- (Phase 2) can filter to a specific moment (interview, lecture, classroom,
-- hosting). Non-scenario passages leave this null.

alter table public.text_bank
  add column if not exists scenario_type text
    check (scenario_type in ('interview', 'lecture', 'classroom', 'hosting'));
