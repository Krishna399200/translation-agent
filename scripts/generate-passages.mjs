#!/usr/bin/env node
// Batch-generates Reading Practice passages via Gemini and inserts them into
// text_bank. This is an OFFLINE / ADMIN script — it is never called during a
// live user session (see app/(app)/(focused)/practice/page.tsx, which only
// ever reads from text_bank via lib/textBank.ts's pickText()).
//
// Usage:
//   node --env-file=.env.local scripts/generate-passages.mjs
//   node --env-file=.env.local scripts/generate-passages.mjs --category=work --length=long
//
// Requires in your env:
//   GEMINI_API_KEY              — same key used elsewhere in the app
//   NEXT_PUBLIC_SUPABASE_URL    — your Supabase project URL
//   SUPABASE_SERVICE_ROLE_KEY   — Settings → API → service_role (secret).
//                                 NOT the anon key. Never expose this to the
//                                 browser or commit it — it bypasses RLS,
//                                 which is exactly why this script needs it
//                                 (there's no signed-in user in a script).

import { createClient } from "@supabase/supabase-js";

const CATEGORIES = ["daily_life", "work", "emotions", "storytelling", "affirmations", "real_life_scenarios"];
const PACE_TAGS = ["slow", "medium", "fast"];
const LENGTH_TAGS = ["short", "medium", "long"];
const DIFFICULTIES = ["easy", "medium", "hard"];
const SCENARIO_TYPES = ["interview", "lecture", "classroom", "hosting"];

const WORD_RANGE = {
  short: [20, 30],
  medium: [50, 80],
  long: [120, 180],
};

const BATCH_SIZE = 10;
const MIN_POOL_DEPTH = 15; // combinations below this are flagged as under-stocked
const HEALTHY_POOL_DEPTH = 20;

const CATEGORY_TONE = {
  daily_life: "warm and unremarkable, the texture of an ordinary day",
  work: "professional but warm — a real colleague, not corporate copy",
  emotions: "gentle, honest, reflective — first person, unhurried",
  storytelling: "narrative and flowing, present-tense or past-tense scene-setting",
  affirmations: "warm and affirming, second person or first person, never hollow or generic",
  real_life_scenarios: "natural spoken register for the specific moment described below",
};

const DIFFICULTY_GUIDANCE = {
  easy: "Short, familiar, everyday words. Simple sentence shapes.",
  medium: "Natural everyday vocabulary with normal sentence variety — a steady, unremarkable challenge.",
  hard: "Deliberately include some genuinely harder words — consonant clusters or blends (st-, str-, sp-, " +
    "multi-syllable words) — woven naturally into the sentence, not as a tongue-twister and not unkind about it.",
};

function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--([\w-]+)=(.*)$/);
    if (match) args[match[1]] = match[2];
  }
  return args;
}

// My own prompt template — the request referenced "use exactly" but no
// template text was actually included in the message, so this is written to
// satisfy every constraint that WAS specified (spoken rhythm, varied
// openers, category tone, difficulty mix, scenario sub-variants,
// trigger_word_slot personalization hook).
function buildPrompt(category, pace, length) {
  const [min, max] = WORD_RANGE[length];
  const isScenario = category === "real_life_scenarios";

  const paceNote =
    pace === "slow"
      ? "Suited to slow, deliberate reading — can have slightly longer clauses."
      : pace === "fast"
        ? "Suited to brisker, more natural conversational reading — punchier, shorter clauses."
        : "Suited to a natural, medium conversational pace.";

  const scenarioBlock = isScenario
    ? `
This category is "real life scenarios" — spoken openings for specific real moments, not narration ABOUT
them. Distribute the ${BATCH_SIZE} passages across these four scenario types, roughly evenly:
- "interview": the opening lines someone says introducing themselves in a job interview
- "lecture": the opening lines of a presentation or lecture to an audience
- "classroom": a short passage a student would read aloud in class
- "hosting": the opening lines of someone hosting a show or event

For roughly half of the passages (your choice which), naturally include exactly one placeholder token
"{trigger_word_slot}" standing in for a word or short phrase the speaker is about to say — for example:
"I'm here today to talk about {trigger_word_slot}." or "Let's start with {trigger_word_slot}." The
placeholder must read naturally in context, as if any short noun phrase could drop in. For the rest, write
a complete, self-contained version with no placeholder at all.

Return "scenario_type" as one of interview / lecture / classroom / hosting for every item in this category,
and set "uses_trigger_slot": true only for items containing the placeholder.`
    : `
Return "scenario_type": null and "uses_trigger_slot": false for every item (this category isn't a scenario).`;

  return `You are writing reading-practice passages for "Fluent," a calm, non-clinical daily speaking-practice
app for people who stammer. Tone: a wise, encouraging friend — never infantilizing, never falsely cheerful,
never clinical ("disfluency," "stutter," "therapy," "treatment" are all forbidden words).

Category: "${category}" — ${CATEGORY_TONE[category]}
${paceNote}

Write ${BATCH_SIZE} DIFFERENT passages, each ${min}-${max} words long. Critical requirements:
- Natural SPOKEN rhythm — this is read ALOUD. Write the way a person actually talks, not essay prose. Avoid
  semicolons, avoid heavily subordinated academic sentence structures.
- Vary sentence openers across all ${BATCH_SIZE} — no two passages should start with the same word or a
  near-identical structure ("I ..." / "I ..." / "I ..." back to back is a failure).
- Distribute difficulty across the batch: roughly ${Math.round(BATCH_SIZE * 0.3)} "easy", ${Math.round(BATCH_SIZE * 0.4)} "medium",
  ${Math.round(BATCH_SIZE * 0.3)} "hard". Guidance per tier:
  · easy — ${DIFFICULTY_GUIDANCE.easy}
  · medium — ${DIFFICULTY_GUIDANCE.medium}
  · hard — ${DIFFICULTY_GUIDANCE.hard}
${scenarioBlock}

Output ONLY a JSON array of exactly ${BATCH_SIZE} objects, each shaped:
{"content": string, "difficulty": "easy"|"medium"|"hard", "scenario_type": string|null, "uses_trigger_slot": boolean}
No prose before or after the array, no markdown fences.`;
}

async function callGemini(apiKey, model, prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 1.0,
          maxOutputTokens: 4096,
          thinkingConfig: { thinkingBudget: 0 },
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(45000),
    }
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Gemini HTTP ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") ?? "";
  if (!text.trim()) {
    throw new Error(`Empty Gemini response (finishReason: ${data?.candidates?.[0]?.finishReason ?? "unknown"})`);
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error(`Could not parse JSON from Gemini response: ${text.slice(0, 200)}`);
    parsed = JSON.parse(match[0]);
  }

  if (!Array.isArray(parsed)) throw new Error("Gemini response was not a JSON array");
  return parsed;
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function validateItem(item, length, category) {
  if (typeof item.content !== "string" || !item.content.trim()) return "missing content";
  const [min, max] = WORD_RANGE[length];
  const wc = wordCount(item.content);
  if (wc < min * 0.6 || wc > max * 1.5) return `word count ${wc} far outside ${min}-${max}`;
  if (!DIFFICULTIES.includes(item.difficulty)) return `invalid difficulty "${item.difficulty}"`;
  if (category === "real_life_scenarios" && !SCENARIO_TYPES.includes(item.scenario_type)) {
    return `invalid scenario_type "${item.scenario_type}"`;
  }
  if (category !== "real_life_scenarios" && item.scenario_type) {
    return "scenario_type should be null outside real_life_scenarios";
  }
  return null;
}

async function main() {
  const args = parseArgs();
  const apiKey = process.env.GEMINI_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");
  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Find it in Supabase → Settings → API → service_role. " +
        "Never commit it or use it client-side — it bypasses row-level security."
    );
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const categories = args.category ? [args.category] : CATEGORIES;
  const paces = args.pace ? [args.pace] : PACE_TAGS;
  const lengths = args.length ? [args.length] : LENGTH_TAGS;

  const summary = [];

  for (const category of categories) {
    for (const pace of paces) {
      for (const length of lengths) {
        const label = `${category}/${pace}/${length}`;
        process.stdout.write(`Generating ${label}... `);

        try {
          const prompt = buildPrompt(category, pace, length);
          const items = await callGemini(apiKey, model, prompt);

          const rows = [];
          const seen = new Set();
          for (const item of items) {
            const problem = validateItem(item, length, category);
            if (problem) {
              console.warn(`\n  skipped item (${problem})`);
              continue;
            }
            const content = item.content.trim();
            if (seen.has(content)) continue;
            seen.add(content);

            rows.push({
              content,
              pace_tag: pace,
              length_tag: length,
              category,
              difficulty: item.difficulty,
              scenario_type: category === "real_life_scenarios" ? item.scenario_type : null,
            });
          }

          if (rows.length > 0) {
            const { error } = await supabase.from("text_bank").insert(rows);
            if (error) throw error;
          }

          const { count } = await supabase
            .from("text_bank")
            .select("id", { count: "exact", head: true })
            .eq("category", category)
            .eq("pace_tag", pace)
            .eq("length_tag", length);

          console.log(`inserted ${rows.length}, pool now ${count ?? "?"}`);
          summary.push({ label, inserted: rows.length, pool: count ?? 0 });
        } catch (err) {
          console.log(`FAILED: ${err.message}`);
          summary.push({ label, inserted: 0, pool: null, error: err.message });
        }
      }
    }
  }

  console.log("\n--- Pool depth summary ---");
  const gaps = summary.filter((s) => s.pool !== null && s.pool < MIN_POOL_DEPTH);
  const thin = summary.filter((s) => s.pool !== null && s.pool >= MIN_POOL_DEPTH && s.pool < HEALTHY_POOL_DEPTH);
  for (const s of summary) {
    const flag = s.error ? "ERROR" : s.pool === null ? "?" : s.pool < MIN_POOL_DEPTH ? "NEEDS MORE" : s.pool < HEALTHY_POOL_DEPTH ? "thin" : "ok";
    console.log(`  ${s.label.padEnd(28)} pool=${String(s.pool).padEnd(4)} [${flag}]${s.error ? ` — ${s.error}` : ""}`);
  }
  if (gaps.length > 0) {
    console.log(`\n${gaps.length} combination(s) below ${MIN_POOL_DEPTH} passages — re-run with --category=/--pace=/--length= to target them.`);
  } else if (thin.length > 0) {
    console.log(`\nAll combinations meet the ${MIN_POOL_DEPTH}-minimum; ${thin.length} are still under the healthy target of ${HEALTHY_POOL_DEPTH}.`);
  } else {
    console.log(`\nAll combinations are at or above the healthy target of ${HEALTHY_POOL_DEPTH} passages.`);
  }
}

main().catch((err) => {
  console.error("\nFatal error:", err.message);
  process.exit(1);
});
