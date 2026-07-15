import type { QuickCalmExercise } from "@/lib/database.types";

export type BreathPhase = "in" | "hold" | "out" | "still";

export type QuickCalmStep = {
  text: string;
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

const physiologicalSighCycle: QuickCalmStep[] = [
  { text: "Breathe in through your nose...", durationMs: 3000, phase: "in" },
  { text: "Now a second small sip of air at the top...", durationMs: 1500, phase: "in" },
  { text: "And let it all go, slow, through your mouth...", durationMs: 4000, phase: "out" },
];

const boxBreathingCycle = (soft: boolean): QuickCalmStep[] => [
  { text: soft ? "In..." : "In for four...", durationMs: 4000, phase: "in" },
  { text: soft ? "Hold..." : "Hold for four...", durationMs: 4000, phase: "hold" },
  { text: soft ? "Out..." : "Out for four...", durationMs: 4000, phase: "out" },
  { text: soft ? "Hold..." : "Hold for four...", durationMs: 4000, phase: "hold" },
];

const alternateNostrilCycle: QuickCalmStep[] = [
  { text: "Gently close your right nostril, breathe in through the left...", durationMs: 4000, phase: "in", handSide: "right" },
  { text: "Close both, pause...", durationMs: 2000, phase: "hold", handSide: "both" },
  { text: "Release the right, breathe out slowly...", durationMs: 4000, phase: "out", handSide: "left" },
  { text: "Breathe in through the right...", durationMs: 4000, phase: "in", handSide: "left" },
  { text: "Switch, breathe out through the left...", durationMs: 4000, phase: "out", handSide: "right" },
];

export const QUICK_CALM_EXERCISES: QuickCalmDefinition[] = [
  {
    key: "physiological_sigh",
    title: "Physiological Sigh",
    tagline: "For when you need calm right now",
    durationLabel: "15–20 sec",
    visual: "circle",
    steps: [...physiologicalSighCycle, ...physiologicalSighCycle],
  },
  {
    key: "box_breathing",
    title: "Box Breathing",
    tagline: "For steadying before you speak",
    durationLabel: "30–40 sec",
    visual: "square",
    steps: [...boxBreathingCycle(false), ...boxBreathingCycle(true)],
  },
  {
    key: "alternate_nostril",
    title: "Alternate Nostril Breathing",
    tagline: "For a deeper reset",
    durationLabel: "~60 sec",
    visual: "hands",
    steps: [
      ...alternateNostrilCycle,
      ...alternateNostrilCycle,
      ...alternateNostrilCycle,
      { text: "Let your breath return to normal.", durationMs: 3000, phase: "still" },
    ],
  },
  {
    key: "third_eye_awareness",
    title: "Third-Eye Body Awareness",
    tagline: "For after a hard moment",
    durationLabel: "45–60 sec",
    visual: "still",
    steps: [
      { text: "Three deep breaths first...", durationMs: 2000, phase: "still" },
      { text: "In...", durationMs: 3000, phase: "in" },
      { text: "Out...", durationMs: 3000, phase: "out" },
      { text: "In...", durationMs: 3000, phase: "in" },
      { text: "Out...", durationMs: 3000, phase: "out" },
      { text: "In...", durationMs: 3000, phase: "in" },
      { text: "Out...", durationMs: 3000, phase: "out" },
      { text: "Now bring your attention gently to the space between your eyebrows...", durationMs: 4500, phase: "still" },
      { text: "Notice what's happening in your body right now, just as an observer, without changing anything...", durationMs: 5500, phase: "still" },
      { text: "What do you notice? There's no need to fix it. Just notice it, and let it pass through you...", durationMs: 6500, phase: "still" },
    ],
  },
];

export function getExercise(key: string) {
  return QUICK_CALM_EXERCISES.find((e) => e.key === key) ?? QUICK_CALM_EXERCISES[0];
}
