import type { PracticeSession, ScenarioSession } from "@/lib/database.types";
import { describeSession } from "@/lib/describeSession";
import { getScenario } from "@/lib/scenarios";

/**
 * A common shape for displaying practice_sessions and scenario_sessions
 * side by side in Progress — they're separate tables (see
 * migration_008_scenario_sessions.sql) but the same thing from the user's
 * point of view: a recording of them practicing.
 */
export type UnifiedSession = {
  id: string;
  table: "practice_sessions" | "scenario_sessions";
  created_at: string;
  audio_url: string;
  duration_seconds: number;
  self_rating: number | null;
  kind: PracticeSession["practice_type"] | "scenario";
  label: string;
};

export function fromPracticeSession(s: PracticeSession): UnifiedSession {
  return {
    id: s.id,
    table: "practice_sessions",
    created_at: s.created_at,
    audio_url: s.audio_url,
    duration_seconds: s.duration_seconds,
    self_rating: s.self_rating,
    kind: s.practice_type,
    label: describeSession(s),
  };
}

export function fromScenarioSession(s: ScenarioSession): UnifiedSession {
  return {
    id: s.id,
    table: "scenario_sessions",
    created_at: s.created_at,
    audio_url: s.audio_url,
    duration_seconds: s.duration_seconds,
    self_rating: s.self_rating,
    kind: "scenario",
    label: `Practice a Moment: ${getScenario(s.scenario_type).title}`,
  };
}
