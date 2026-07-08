import { computeStreak } from "@/lib/streak";
import type { PracticeSession } from "@/lib/database.types";

export type Badge = { key: string; title: string; description: string };

export function computeBadges(sessions: PracticeSession[]): Badge[] {
  const badges: Badge[] = [];

  const byType = (type: PracticeSession["practice_type"]) =>
    sessions.filter((s) => s.practice_type === type);

  const overallStreak = computeStreak(sessions.map((s) => s.created_at));
  if (overallStreak >= 5) {
    badges.push({
      key: "consistency_master",
      title: "Consistency Master",
      description: "Practiced 5 days in a row.",
    });
  }

  const wellRated = sessions.filter((s) => (s.self_rating ?? 0) >= 4).length;
  if (wellRated >= 5) {
    badges.push({
      key: "clarity_champion",
      title: "Clarity Champion",
      description: "Felt good or effortless in 5 sessions.",
    });
  }

  const varnamalaLevels = new Set(byType("varnamala").map((s) => s.phrase_id));
  if (varnamalaLevels.has("vowels") && varnamalaLevels.has("consonants") && varnamalaLevels.has("combinations")) {
    badges.push({
      key: "sound_explorer",
      title: "Sound Explorer",
      description: "Completed every Sound Foundations level.",
    });
  }

  const distinctTriggerWords = new Set(byType("trigger_words").map((s) => s.phrase_id));
  if (distinctTriggerWords.size >= 10) {
    badges.push({
      key: "word_warrior",
      title: "Word Warrior",
      description: "Practiced 10 words that used to feel hard.",
    });
  }

  const mantraStreak = computeStreak(byType("mantra").map((s) => s.created_at));
  if (mantraStreak >= 7) {
    badges.push({
      key: "mantra_streak",
      title: "Mantra Streak",
      description: "7 days of mantra practice, back to back.",
    });
  }

  return badges;
}
