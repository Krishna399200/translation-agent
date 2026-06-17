/**
 * STEP 1 — Connect to Gemini
 *
 * This file creates a single shared Gemini client.
 * The API key lives in `.env.local` (never commit that file).
 *
 * Get a free key: https://aistudio.google.com/apikey
 */
import { GoogleGenAI } from "@google/genai";

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    const isNetlify = Boolean(process.env.NETLIFY);
    throw new Error(
      isNetlify
        ? "GEMINI_API_KEY is missing. Add it in Netlify → Site configuration → Environment variables, then redeploy."
        : "GEMINI_API_KEY is missing. Copy env.example to .env.local and add your key."
    );
  }
  return key;
}

/** One client for the whole app — created lazily on first use. */
let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: getApiKey() });
  }
  return client;
}


/**
 * Model used for translation.
 *
 * gemini-2.0-flash was shut down June 2026 — free-tier quota is 0.
 * Override in .env.local: GEMINI_MODEL=gemini-2.5-flash-lite
 */
export const TRANSLATION_MODEL =
  process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
