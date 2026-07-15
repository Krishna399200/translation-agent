import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TextBankEntry } from "@/lib/database.types";
import { PHRASE } from "@/lib/phrase";

export const CATEGORIES: { value: string; label: string }[] = [
  { value: "daily_life", label: "Daily Life" },
  { value: "work", label: "Work" },
  { value: "emotions", label: "Emotions" },
  { value: "storytelling", label: "Storytelling" },
  { value: "affirmations", label: "Affirmations" },
  { value: "real_life_scenarios", label: "Real-Life Scenarios" },
];

export type LengthTag = "short" | "medium" | "long";
export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTIES: { value: Difficulty; label: string; description: string }[] = [
  { value: "easy", label: "Easy", description: "Familiar words, short sentences" },
  { value: "medium", label: "Medium", description: "A steady, everyday challenge" },
  { value: "hard", label: "Hard", description: "Consonant clusters and longer phrases" },
];

/** A gentle default that nudges toward harder tiers as reading practice adds up. */
export function suggestDifficulty(readingSessionCount: number): Difficulty {
  if (readingSessionCount >= 15) return "hard";
  if (readingSessionCount >= 5) return "medium";
  return "easy";
}

const RECENT_KEY = (userId: string) => `fluent_recent_texts_${userId}`;

function getRecentIds(userId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY(userId)) ?? "[]");
  } catch {
    return [];
  }
}

export function rememberShownText(userId: string, id: string) {
  if (typeof window === "undefined") return;
  const recent = [id, ...getRecentIds(userId).filter((x) => x !== id)].slice(0, 3);
  localStorage.setItem(RECENT_KEY(userId), JSON.stringify(recent));
}

export async function pickText(
  supabase: SupabaseClient<Database>,
  userId: string,
  category: string,
  length: LengthTag,
  difficulty: Difficulty
): Promise<{ id: string; text: string }> {
  const recentIds = getRecentIds(userId);

  async function candidatesFor(matchDifficulty: boolean, excludeRecent: boolean) {
    // scenario_type rows are reserved for the Scenario Simulation module —
    // some contain an unfilled {trigger_word_slot} placeholder that would
    // render literally if it ever showed up in ordinary Reading Practice.
    let query = supabase
      .from("text_bank")
      .select("*")
      .eq("category", category)
      .eq("length_tag", length)
      .is("scenario_type", null);
    if (matchDifficulty) query = query.eq("difficulty", difficulty);
    if (excludeRecent && recentIds.length > 0) {
      query = query.not("id", "in", `(${recentIds.join(",")})`);
    }
    const { data } = await query;
    return (data ?? []) as TextBankEntry[];
  }

  // Cascading fallback: exact match -> ignore recency -> ignore difficulty -> static phrase.
  let candidates = await candidatesFor(true, true);
  if (candidates.length === 0) candidates = await candidatesFor(true, false);
  if (candidates.length === 0) candidates = await candidatesFor(false, false);

  if (candidates.length === 0) {
    return { id: PHRASE.id, text: PHRASE.text };
  }

  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  return { id: pick.id, text: pick.content };
}

export type ScenarioType = "interview" | "lecture" | "classroom" | "hosting";

/**
 * Picks a real_life_scenarios passage for the given scenario type. When the
 * user has saved trigger words, prefers passages containing the
 * {trigger_word_slot} placeholder and fills it with one of their words;
 * otherwise prefers plain passages with no placeholder at all.
 */
export async function pickScenarioPassage(
  supabase: SupabaseClient<Database>,
  userId: string,
  scenarioType: ScenarioType,
  savedTriggerWords: string[]
): Promise<{ id: string; text: string }> {
  const recentIds = getRecentIds(userId);

  let query = supabase
    .from("text_bank")
    .select("*")
    .eq("category", "real_life_scenarios")
    .eq("scenario_type", scenarioType);
  if (recentIds.length > 0) {
    query = query.not("id", "in", `(${recentIds.join(",")})`);
  }

  const { data } = await query;
  let candidates = (data ?? []) as TextBankEntry[];

  if (candidates.length === 0) {
    const { data: fallbackData } = await supabase
      .from("text_bank")
      .select("*")
      .eq("category", "real_life_scenarios")
      .eq("scenario_type", scenarioType);
    candidates = (fallbackData ?? []) as TextBankEntry[];
  }

  if (candidates.length === 0) {
    return { id: PHRASE.id, text: PHRASE.text };
  }

  const hasWords = savedTriggerWords.length > 0;
  const withSlot = candidates.filter((c) => c.content.includes("{trigger_word_slot}"));
  const withoutSlot = candidates.filter((c) => !c.content.includes("{trigger_word_slot}"));

  const pool = hasWords && withSlot.length > 0 ? withSlot : withoutSlot.length > 0 ? withoutSlot : candidates;
  const pick = pool[Math.floor(Math.random() * pool.length)];

  const text = hasWords
    ? pick.content.replace(
        "{trigger_word_slot}",
        savedTriggerWords[Math.floor(Math.random() * savedTriggerWords.length)]
      )
    : pick.content.replace("{trigger_word_slot}", "this");

  return { id: pick.id, text };
}
