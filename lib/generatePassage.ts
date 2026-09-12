import type { LengthTag, Difficulty } from "@/lib/textBank";
import type { Pace } from "@/lib/phrase";

/**
 * Asks the server to generate fresh passages via Gemini in real time (all
 * generated passages are saved to text_bank, not just the one returned, so
 * the pool keeps growing from ordinary use). Returns null on any failure
 * (no API key configured, network error, malformed response) so callers
 * fall back to the curated text_bank pool without surfacing an error.
 */
export async function generatePassage(
  category: string,
  length: LengthTag,
  difficulty: Difficulty,
  pace: Pace
): Promise<{ id: string; text: string } | null> {
  try {
    const response = await fetch("/api/generate-passage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, length, difficulty, pace }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      console.error(
        `[generatePassage] server returned ${response.status}: ${body?.error ?? "(no error detail)"} — falling back to the curated pool.`
      );
      return null;
    }
    const data = await response.json();
    if (typeof data.id !== "string" || typeof data.text !== "string") {
      console.error("[generatePassage] malformed response, falling back to the curated pool:", data);
      return null;
    }
    return { id: data.id, text: data.text };
  } catch (err) {
    console.error("[generatePassage] request errored, falling back to the curated pool:", err);
    return null;
  }
}
