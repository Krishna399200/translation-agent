import { MANTRAS } from "@/lib/mantras";
import { VARNAMALA_LEVELS } from "@/lib/varnamala";
import type { PracticeSession } from "@/lib/database.types";

export function describeSession(session: Pick<PracticeSession, "practice_type" | "phrase_id">) {
  switch (session.practice_type) {
    case "mantra": {
      const mantra = MANTRAS.find((m) => m.key === session.phrase_id);
      return mantra ? `Mantra: ${mantra.name}` : "Mantra practice";
    }
    case "varnamala": {
      const level = VARNAMALA_LEVELS.find((l) => l.key === session.phrase_id);
      return level ? `Sound Foundations: ${level.title}` : "Sound Foundations";
    }
    case "trigger_words":
      return `Word: ${session.phrase_id}`;
    case "journal":
      return "Weekly voice journal";
    default:
      return "Reading practice";
  }
}

export function typeLabel(type: PracticeSession["practice_type"]) {
  switch (type) {
    case "mantra":
      return "Mantra";
    case "varnamala":
      return "Sound Foundations";
    case "trigger_words":
      return "Trigger Words";
    case "journal":
      return "Journal";
    default:
      return "Reading";
  }
}
