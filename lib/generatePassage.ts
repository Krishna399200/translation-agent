import type { LengthTag, Difficulty } from "@/lib/textBank";

/**
 * Asks the server to generate a fresh passage via Gemini. Returns null on
 * any failure (no API key configured, network error, malformed response) so
 * callers can fall back to the static text_bank pool without surfacing an
 * error to the user — this is a nice-to-have enhancement, not a hard
 * dependency of the reading practice flow.
 */
export async function generatePassage(
  category: string,
  length: LengthTag,
  difficulty: Difficulty
): Promise<{ id: string; text: string } | null> {
  try {
    const response = await fetch("/api/generate-passage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, length, difficulty }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (typeof data.id !== "string" || typeof data.text !== "string") return null;
    return { id: data.id, text: data.text };
  } catch {
    return null;
  }
}
