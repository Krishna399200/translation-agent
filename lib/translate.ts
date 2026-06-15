/**
 * STEP 2 — Translation with Gemini
 *
 * Large documents are split into chunks so we stay within token limits.
 * Excel cells are translated in batches (faster than one API call per cell).
 */
import { getGeminiClient, TRANSLATION_MODEL } from "./gemini";

const MAX_CHUNK_CHARS = 3000;
const CELL_BATCH_SIZE = 20;
const BATCH_DELAY_MS = 1500;
const MAX_RETRIES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isQuotaError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const maybeStatus = (error as { status?: number }).status;
  if (maybeStatus === 429) return true;
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("429") || message.includes("RESOURCE_EXHAUSTED");
}

function quotaErrorMessage(): string {
  return `Gemini quota exceeded for model "${TRANSLATION_MODEL}". Wait a minute and try again, or set GEMINI_MODEL=gemini-2.5-flash-lite in .env.local. Check usage: https://ai.dev/rate-limit`;
}

/** Retry Gemini calls when rate-limited (429). */
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isQuotaError(error) || attempt === MAX_RETRIES - 1) {
        throw error;
      }
      const waitMs = (attempt + 1) * 5000;
      await sleep(waitMs);
    }
  }

  throw lastError;
}

/** Split long text into smaller pieces for the API. */
function chunkText(text: string): string[] {
  if (text.length <= MAX_CHUNK_CHARS) return [text];

  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + MAX_CHUNK_CHARS));
    start += MAX_CHUNK_CHARS;
  }
  return chunks;
}

/** Ask Gemini for a plain-text translation. */
export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const chunks = chunkText(trimmed);
  const translatedChunks: string[] = [];

  const ai = getGeminiClient();

  for (const chunk of chunks) {
    const response = await withRetry(() =>
      ai.models.generateContent({
        model: TRANSLATION_MODEL,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Translate the following text to ${targetLanguage}.

Rules:
- Return ONLY the translated text (no explanations).
- Keep numbers, dates, currency, and product codes unchanged.
- Preserve line breaks.

Text:
${chunk}`,
              },
            ],
          },
        ],
      })
    );

    const translated = response.text?.trim();
    if (!translated) {
      throw new Error("Gemini returned an empty translation.");
    }
    translatedChunks.push(translated);
  }

  return translatedChunks.join("");
}

/**
 * Translate many short strings at once (used for Excel cells).
 * Gemini returns a JSON array in the same order as the input.
 */
export async function translateTextBatch(
  texts: string[],
  targetLanguage: string
): Promise<string[]> {
  if (texts.length === 0) return [];

  const ai = getGeminiClient();

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: TRANSLATION_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Translate each string in this JSON array to ${targetLanguage}.

Rules:
- Return ONLY a valid JSON array of strings.
- Same length and order as the input.
- Keep numbers, dates, and codes unchanged.
- Empty strings stay empty.

Input:
${JSON.stringify(texts)}`,
            },
          ],
        },
      ],
    })
  );

  const raw = response.text?.trim() ?? "";
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Gemini did not return a JSON array for batch translation.");
  }

  const parsed: unknown = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(parsed) || parsed.length !== texts.length) {
    throw new Error("Batch translation returned the wrong number of items.");
  }

  return parsed.map((item, index) => {
    if (typeof item !== "string") {
      return texts[index];
    }
    return item;
  });
}

/** Translate a long list by sending batches per API call. */
export async function translateMany(
  texts: string[],
  targetLanguage: string
): Promise<string[]> {
  const results: string[] = [];

  for (let i = 0; i < texts.length; i += CELL_BATCH_SIZE) {
    if (i > 0) {
      await sleep(BATCH_DELAY_MS);
    }

    const batch = texts.slice(i, i + CELL_BATCH_SIZE);
    const translated = await translateTextBatch(batch, targetLanguage);
    results.push(...translated);
  }

  return results;
}

export { isQuotaError, quotaErrorMessage };
