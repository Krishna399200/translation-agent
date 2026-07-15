import type { QuickCalmExercise } from "@/lib/database.types";
import scriptData from "@/lib/quickCalmScript.json";

// scripts/generate-quickcalm-audio.mjs reads this same JSON file directly
// (plain fs read, no bundler) so the narration script and the runtime
// captions can never drift apart — one source of truth for the words.

export type BreathPhase = "in" | "hold" | "out" | "still";

export type QuickCalmStep = {
  text: string;
  breakMs: number;
  /** Estimated total step time (speech + break), used as a display timer
   * fallback when voice-over is off or unsupported. */
  durationMs: number;
  phase: BreathPhase;
  handSide?: "left" | "right" | "both";
};

export type QuickCalmDefinition = {
  key: QuickCalmExercise;
  title: string;
  tagline: string;
  durationLabel: string;
  visual: "circle" | "square" | "hands" | "still";
  steps: QuickCalmStep[];
};

function estimateSpeechMs(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.round(words * 460 + 300);
}

type RawStep = {
  text: string;
  breakSec: number;
  phase: BreathPhase;
  handSide?: "left" | "right" | "both";
};

type RawExercise = {
  key: string;
  title: string;
  tagline: string;
  durationLabel: string;
  visual: QuickCalmDefinition["visual"];
  steps: RawStep[];
};

function buildStep(raw: RawStep): QuickCalmStep {
  const breakMs = Math.round(raw.breakSec * 1000);
  return {
    text: raw.text,
    breakMs,
    durationMs: estimateSpeechMs(raw.text) + breakMs,
    phase: raw.phase,
    handSide: raw.handSide,
  };
}

export const QUICK_CALM_EXERCISES: QuickCalmDefinition[] = (scriptData as RawExercise[]).map((ex) => ({
  key: ex.key as QuickCalmExercise,
  title: ex.title,
  tagline: ex.tagline,
  durationLabel: ex.durationLabel,
  visual: ex.visual,
  steps: ex.steps.map(buildStep),
}));

export function getExercise(key: string) {
  return QUICK_CALM_EXERCISES.find((e) => e.key === key) ?? QUICK_CALM_EXERCISES[0];
}
