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
  length: LengthTag
): Promise<{ id: string; text: string }> {
  const recentIds = getRecentIds(userId);

  let query = supabase.from("text_bank").select("*").eq("category", category).eq("length_tag", length);
  if (recentIds.length > 0) {
    query = query.not("id", "in", `(${recentIds.join(",")})`);
  }

  const { data } = await query;
  let candidates = (data ?? []) as TextBankEntry[];

  if (candidates.length === 0) {
    const { data: fallbackData } = await supabase
      .from("text_bank")
      .select("*")
      .eq("category", category)
      .eq("length_tag", length);
    candidates = (fallbackData ?? []) as TextBankEntry[];
  }

  if (candidates.length === 0) {
    return { id: PHRASE.id, text: PHRASE.text };
  }

  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  return { id: pick.id, text: pick.content };
}
