import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/textBank";

export const runtime = "nodejs";

type LengthTag = "short" | "medium" | "long";
type Difficulty = "easy" | "medium" | "hard";
type Pace = "slow" | "medium" | "natural";

const WORD_RANGE: Record<LengthTag, [number, number]> = {
  short: [20, 30],
  medium: [50, 80],
  long: [120, 180],
};

const PACE_STYLE: Record<Pace, string> = {
  slow: "slow, deliberate",
  medium: "steady, medium-paced",
  natural: "natural, everyday conversational",
};

const DIFFICULTY_LINE: Record<Difficulty, string> = {
  easy: "Keep the words short and familiar, sentences simple and comfortable to read aloud.",
  medium: "",
  hard: "Deliberately include some genuinely harder words — consonant clusters or blends (st-, str-, sp-, " +
    "multi-syllable words) — woven naturally into the sentences, a real reading challenge but not a tongue-twister.",
};

const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

// The user's own template, used verbatim with {word_count_range} /
// {pace_style} / {category} substituted. The difficulty line is appended
// separately rather than folded into the template, since the template
// itself doesn't have a difficulty variable but the app's difficulty tiers
// are an existing feature this shouldn't silently drop.
function buildPrompt(category: string, length: LengthTag, pace: Pace, difficulty: Difficulty) {
  const [min, max] = WORD_RANGE[length];
  const wordCountRange = `${min}-${max}`;
  const categoryLabel = CATEGORY_LABELS[category] ?? category;
  const difficultyLine = DIFFICULTY_LINE[difficulty];

  return `Generate 10 short passages for a speech-fluency practice app. Each passage should be ${wordCountRange} words, written in a ${PACE_STYLE[pace]} natural spoken rhythm suitable for reading aloud, in the category "${categoryLabel}". Tone should be warm, human, and never clinical. Avoid repetitive sentence structures across the 10 passages. Return as a JSON array of strings, nothing else — no preamble, no markdown formatting.${difficultyLine ? `\n\n${difficultyLine}` : ""}`;
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
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

  let body: { category?: string; length?: LengthTag; difficulty?: Difficulty; pace?: Pace };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const category = body.category ?? "affirmations";
  const length: LengthTag = body.length === "medium" || body.length === "long" ? body.length : "short";
  const difficulty: Difficulty = body.difficulty === "medium" || body.difficulty === "hard" ? body.difficulty : "easy";
  const pace: Pace = body.pace === "slow" || body.pace === "natural" ? body.pace : "medium";

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const prompt = buildPrompt(category, length, pace, difficulty);

  let passages: string[];
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
            maxOutputTokens: 2048,
            thinkingConfig: { thinkingBudget: 0 },
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(20000),
      }
    );

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      console.error("[generate-passage] Gemini HTTP error", response.status, errBody.slice(0, 400));
      // Echoed to the client (never the key itself, just Gemini's own error
      // body) so the real reason shows up in the browser console — there's
      // otherwise no way to see this without access to Vercel's server logs.
      return NextResponse.json(
        { error: `Gemini request failed (HTTP ${response.status}): ${errBody.slice(0, 300) || "(empty body)"}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    const text = candidate?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
    if (!text.trim()) {
      console.error("[generate-passage] empty text", candidate?.finishReason);
      return NextResponse.json(
        { error: `Empty response from Gemini (finishReason: ${candidate?.finishReason ?? "unknown"}).` },
        { status: 502 }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("no JSON array found");
      parsed = JSON.parse(match[0]);
    }

    if (!Array.isArray(parsed)) throw new Error("response was not an array");
    passages = parsed.filter((p): p is string => typeof p === "string" && p.trim().length > 0).map((p) => p.trim());
  } catch (err) {
    console.error("[generate-passage] request errored", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Gemini request errored: ${message}` }, { status: 502 });
  }

  const [min, max] = WORD_RANGE[length];
  const valid = passages.filter((p) => {
    const wc = wordCount(p);
    return wc >= min * 0.6 && wc <= max * 1.6;
  });

  if (valid.length === 0) {
    return NextResponse.json({ error: "No usable passages generated." }, { status: 502 });
  }

  const rows = valid.map((content) => ({
    content,
    pace_tag: pace === "natural" ? "fast" : pace,
    length_tag: length,
    category,
    difficulty,
  }));

  const { data: inserted, error: insertError } = await supabase.from("text_bank").insert(rows).select("id, content");

  if (insertError || !inserted || inserted.length === 0) {
    console.error("[generate-passage] insert failed", insertError);
    return NextResponse.json(
      { error: `Could not save the generated passages: ${insertError?.message ?? "no rows returned"}` },
      { status: 500 }
    );
  }

  const pick = inserted[Math.floor(Math.random() * inserted.length)];
  return NextResponse.json({ id: pick.id, text: pick.content });
}
