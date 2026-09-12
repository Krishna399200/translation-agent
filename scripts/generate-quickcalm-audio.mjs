#!/usr/bin/env node
// Batch-generates Quick Calm narration audio + word-level timing data via
// ElevenLabs. OFFLINE / ADMIN script — never called during a live session.
// Output feeds components/quickcalm/ExercisePlayer.tsx's timestamp-driven
// caption engine (lib/useTimedNarration.ts), which falls back to the
// existing Web Speech API path when a given exercise's audio/timing files
// aren't present yet.
//
// Usage:
//   node --env-file=.env.local scripts/generate-quickcalm-audio.mjs
//   node --env-file=.env.local scripts/generate-quickcalm-audio.mjs --exercise=box_breathing
//
// Requires in your env:
//   ELEVENLABS_API_KEY  — https://elevenlabs.io
//   ELEVENLABS_VOICE_ID — optional, defaults below to a calm premade voice.
//                         I can't verify this ID is still valid on your
//                         account without access to it — check your
//                         ElevenLabs voice library and override if needed.
//
// Design note on WHY this doesn't use SSML <break time="Xs"> tags: the
// original Quick Calm bug was captions assuming declared pause durations
// match what the TTS engine actually produces. Rather than repeat that
// mistake with ElevenLabs, this script sends the script's natural
// punctuation (already has "..." and "." pauses baked into the text) and
// then MEASURES the real per-character timing ElevenLabs returns, deriving
// each line's actual start/end time from that — never from what we asked
// for.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = path.join(__dirname, "../lib/quickCalmScript.json");
const OUTPUT_DIR = path.join(__dirname, "../public/audio/quick-calm");

// "Daniel" — a calm, mid-range, unhurried premade ElevenLabs voice as of
// this writing. Override with ELEVENLABS_VOICE_ID if it's no longer
// available on your account or you prefer a different one.
const DEFAULT_VOICE_ID = "onwK4e9ZLuTAKqWW03F9";
const MODEL_ID = "eleven_multilingual_v2";

function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--([\w-]+)=(.*)$/);
    if (match) args[match[1]] = match[2];
  }
  return args;
}

async function synthesizeWithTimestamps(apiKey, voiceId, text) {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.65, // steadier, less erratic — fits "unhurried narrator"
        similarity_boost: 0.75,
        style: 0.15, // low style exaggeration; keep it calm, not performative
        use_speaker_boost: true,
      },
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`ElevenLabs HTTP ${response.status}: ${body.slice(0, 400)}`);
  }

  // Response shape per ElevenLabs' with-timestamps endpoint at time of
  // writing: { audio_base64, alignment: { characters, character_start_times_seconds,
  // character_end_times_seconds }, normalized_alignment }. Verify against
  // current ElevenLabs docs if this script starts failing to parse — their
  // API does evolve.
  return response.json();
}

// Given the full concatenated script and ElevenLabs' character-level
// alignment, find each line's [startTime, endTime] by locating its
// substring's character offsets in the concatenated text.
function deriveLineTimings(fullText, lines, alignment) {
  const { characters, character_start_times_seconds, character_end_times_seconds } = alignment;
  if (!Array.isArray(characters) || characters.length === 0) {
    throw new Error("ElevenLabs response had no character alignment data.");
  }

  const timings = [];
  let cursor = 0;
  for (const lineText of lines) {
    const start = fullText.indexOf(lineText, cursor);
    if (start === -1) {
      throw new Error(`Could not locate line in concatenated script: "${lineText.slice(0, 40)}..."`);
    }
    const end = start + lineText.length;
    cursor = end;

    const startTime = character_start_times_seconds[Math.min(start, characters.length - 1)];
    const endIndex = Math.max(0, Math.min(end - 1, characters.length - 1));
    const endTime = character_end_times_seconds[endIndex];

    timings.push({ text: lineText, startTime, endTime });
  }
  return timings;
}

async function main() {
  const args = parseArgs();
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set.");
  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;

  const exercises = JSON.parse(readFileSync(SCRIPT_PATH, "utf-8"));
  const targets = args.exercise ? exercises.filter((e) => e.key === args.exercise) : exercises;

  if (targets.length === 0) {
    throw new Error(`No exercise matched "${args.exercise}". Valid keys: ${exercises.map((e) => e.key).join(", ")}`);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const exercise of targets) {
    process.stdout.write(`Generating "${exercise.key}"... `);
    const lines = exercise.steps.map((s) => s.text);
    // A space between lines gives the alignment a clean boundary without
    // forcing an artificial pause the model has to honor exactly.
    const fullText = lines.join(" ");

    try {
      const result = await synthesizeWithTimestamps(apiKey, voiceId, fullText);
      const timings = deriveLineTimings(fullText, lines, result.alignment);

      const audioBuffer = Buffer.from(result.audio_base64, "base64");
      writeFileSync(path.join(OUTPUT_DIR, `${exercise.key}.mp3`), audioBuffer);
      writeFileSync(
        path.join(OUTPUT_DIR, `${exercise.key}.json`),
        JSON.stringify({ steps: timings, generatedAt: new Date().toISOString(), voiceId }, null, 2)
      );

      const totalDuration = timings[timings.length - 1]?.endTime ?? 0;
      console.log(`done — ${timings.length} lines, ${totalDuration.toFixed(1)}s audio`);
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }
  }

  console.log(
    `\nAudio + timing files written to ${path.relative(process.cwd(), OUTPUT_DIR)}/. ` +
      `ExercisePlayer picks these up automatically on next load — no code change needed.`
  );
}

main().catch((err) => {
  console.error("\nFatal error:", err.message);
  process.exit(1);
});
