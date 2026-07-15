import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/textBank";

export const runtime = "nodejs";

type LengthTag = "short" | "medium" | "long";
type Difficulty = "easy" | "medium" | "hard";

const WORD_RANGE: Record<LengthTag, [number, number]> = {
  short: [15, 25],
  medium: [40, 65],
  long: [90, 140],
};

const DIFFICULTY_GUIDANCE: Record<Difficulty, string> = {
  easy: "Use short, familiar, everyday words. Keep sentences simple and comfortable to read aloud.",
  medium: "Use natural, everyday vocabulary with normal sentence variety — a steady, unremarkable challenge.",
  hard: "Deliberately include some words with challenging consonant clusters or blends (for example words " +
    "starting with st-, str-, sp-, or with several syllables) woven naturally into the sentences — a genuine " +
    "reading challenge to grow into, not a tongue-twister and not mean-spirited.",
};

const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

function buildPrompt(category: string, length: LengthTag, difficulty: Difficulty) {
  const [min, max] = WORD_RANGE[length];
  const categoryLabel = CATEGORY_LABELS[category] ?? category;

  return `You are writing a short reading passage for "Fluent," a calm, non-clinical daily speaking-practice app for people who stammer. The tone is warm, respectful, and never infantilizing or falsely cheerful — think a wise, encouraging friend, not a therapist or a children's book.

Write ONE passage in the category "${categoryLabel}", between ${min} and ${max} words long.
${DIFFICULTY_GUIDANCE[difficulty]}

Rules:
- Plain prose, no markdown, no quotation marks around the whole thing, no title or label.
- Never use clinical words like "disfluency," "stutter," "therapy," or "treatment."
- Never mention this is an exercise or a passage — just write the content itself.
- Do not include any preamble, introduction, or closing remark (no "Here is..." or "I hope this helps") — output ONLY the passage itself, nothing before or after it.`;
}

function extractWordCount(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

// Gemini sometimes ignores the "no preamble" instruction and wraps the
// passage in a lead-in line or a trailing remark. Strip the common shapes
// rather than reject a perfectly good passage over its wrapper text.
function cleanPassage(text: string): string {
  let cleaned = text.trim();

  // Strip a markdown-fenced block if the whole response is wrapped in one.
  const fenceMatch = cleaned.match(/^```(?:\w+)?\n([\s\S]*?)\n```$/);
  if (fenceMatch) cleaned = fenceMatch[1].trim();

  const lines = cleaned.split("\n").map((l) => l.trim()).filter(Boolean);
  const preambleRe = /^(here('?s| is)|sure|certainly|of course|okay|absolutely)\b/i;
  const postambleRe = /^(i hope|hope (this|that)|let me know|feel free|enjoy)\b/i;

  while (lines.length > 1 && preambleRe.test(lines[0])) lines.shift();
  while (lines.length > 1 && postambleRe.test(lines[lines.length - 1])) lines.pop();

  return lines.join(" ").replace(/^["']|["']$/g, "").trim();
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini is not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: { category?: string; length?: LengthTag; difficulty?: Difficulty };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const category = body.category ?? "affirmations";
  const length: LengthTag = body.length === "medium" || body.length === "long" ? body.length : "short";
  const difficulty: Difficulty = body.difficulty === "medium" || body.difficulty === "hard" ? body.difficulty : "easy";

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const prompt = buildPrompt(category, length, difficulty);

  let generated: string;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 1024,
            // gemini-2.5-* models "think" by default, and thinking tokens
            // count against maxOutputTokens — for a task this simple that
            // was silently eating the whole budget and leaving little or
            // nothing for the actual passage. Turn it off.
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
        signal: AbortSignal.timeout(20000),
      }
    );

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      console.error("[generate-passage] Gemini HTTP error", response.status, errBody.slice(0, 500));
      return NextResponse.json(
        { error: "Gemini request failed.", status: response.status, detail: errBody.slice(0, 300) },
        { status: 502 }
      );
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    const text = candidate?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";

    if (!text.trim()) {
      console.error(
        "[generate-passage] empty text from Gemini",
        JSON.stringify({ finishReason: candidate?.finishReason, promptFeedback: data?.promptFeedback })
      );
      return NextResponse.json(
        { error: "Empty response from Gemini.", finishReason: candidate?.finishReason ?? null },
        { status: 502 }
      );
    }
    generated = cleanPassage(text);
  } catch (err) {
    console.error("[generate-passage] request errored", err);
    return NextResponse.json({ error: "Gemini request errored." }, { status: 502 });
  }

  const wordCount = extractWordCount(generated);
  const [min, max] = WORD_RANGE[length];
  if (wordCount < min * 0.5 || wordCount > max * 1.8) {
    console.error("[generate-passage] out of range", { wordCount, min, max, preview: generated.slice(0, 200) });
    return NextResponse.json(
      {
        error: "Generated passage was out of range.",
        wordCount,
        expected: `${min}-${max}`,
        preview: generated.slice(0, 200),
      },
      { status: 502 }
    );
  }

  const { data: inserted, error: insertError } = await supabase
    .from("text_bank")
    .insert({
      content: generated,
      pace_tag: "medium",
      length_tag: length,
      category,
      difficulty,
    })
    .select("id, content")
    .single();

  if (insertError || !inserted) {
    console.error("[generate-passage] insert failed", insertError);
    return NextResponse.json({ error: "Could not save the generated passage." }, { status: 500 });
  }

  return NextResponse.json({ id: inserted.id, text: inserted.content });
}
