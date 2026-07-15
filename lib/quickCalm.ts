import type { QuickCalmExercise } from "@/lib/database.types";

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

function line(
  text: string,
  breakSec: number,
  phase: BreathPhase,
  handSide?: "left" | "right" | "both"
): QuickCalmStep {
  const breakMs = Math.round(breakSec * 1000);
  return { text, breakMs, durationMs: estimateSpeechMs(text) + breakMs, phase, handSide };
}

export const QUICK_CALM_EXERCISES: QuickCalmDefinition[] = [
  {
    key: "physiological_sigh",
    title: "Physiological Sigh",
    tagline: "For when you need calm right now",
    durationLabel: "15–20 sec",
    visual: "circle",
    steps: [
      line("Let's take a moment.", 1.0, "still"),
      line("Breathe in through your nose.", 2.0, "in"),
      line("Now, one more small sip of air, right at the top.", 1.0, "in"),
      line("And let it all go... slowly... through your mouth.", 4.0, "out"),
      line("Once more.", 0.5, "still"),
      line("Breathe in.", 2.0, "in"),
      line("A little more air in.", 1.0, "in"),
      line("And release.", 4.0, "out"),
      line("There. You're here now.", 3.0, "still"),
    ],
  },
  {
    key: "box_breathing",
    title: "Box Breathing",
    tagline: "For steadying before you speak",
    durationLabel: "30–40 sec",
    visual: "square",
    steps: [
      line("Let's find a steady rhythm together.", 1.0, "still"),
      line("In... two... three... four.", 4.0, "in"),
      line("Hold... two... three... four.", 4.0, "hold"),
      line("Out... two... three... four.", 4.0, "out"),
      line("Hold... two... three... four.", 4.0, "hold"),
      line("Once more, with me.", 0.5, "still"),
      line("In... two... three... four.", 4.0, "in"),
      line("Hold... two... three... four.", 4.0, "hold"),
      line("Out... two... three... four.", 4.0, "out"),
      line("Hold... two... three... four.", 4.0, "hold"),
      line("Good. Your breath is steady. So are you.", 3.0, "still"),
    ],
  },
  {
    key: "alternate_nostril",
    title: "Alternate Nostril Breathing",
    tagline: "For a deeper reset",
    durationLabel: "~60 sec",
    visual: "hands",
    steps: [
      line("For this one, bring your right hand up gently to your nose.", 2.0, "still", "right"),
      line("Use your thumb to softly close your right nostril.", 2.0, "still", "right"),
      line("Breathe in through your left nostril, slow and full.", 4.0, "in", "right"),
      line("Now close both nostrils gently, and pause.", 2.0, "hold", "both"),
      line("Release your thumb, and breathe out through the right.", 4.0, "out", "left"),
      line("Now breathe in through the right nostril.", 4.0, "in", "left"),
      line("Close both again, and pause.", 2.0, "hold", "both"),
      line("Release, and breathe out through the left.", 4.0, "out", "right"),
      line("One more round, at your own pace.", 1.0, "still"),
      line("In through the left.", 4.0, "in", "right"),
      line("Pause.", 2.0, "hold", "both"),
      line("Out through the right.", 4.0, "out", "left"),
      line("In through the right.", 4.0, "in", "left"),
      line("Pause.", 2.0, "hold", "both"),
      line("Out through the left.", 4.0, "out", "right"),
      line("You can lower your hand now. Notice how quiet your mind feels.", 3.5, "still"),
    ],
  },
  {
    key: "third_eye_awareness",
    title: "Third-Eye Body Awareness",
    tagline: "For after a hard moment",
    durationLabel: "45–60 sec",
    visual: "still",
    steps: [
      line("Let's take three deep breaths together, first.", 1.0, "still"),
      line("In...", 3.0, "in"),
      line("Out...", 3.0, "out"),
      line("In...", 3.0, "in"),
      line("Out...", 3.0, "out"),
      line("In...", 3.0, "in"),
      line("Out...", 3.0, "out"),
      line("Now, gently bring your attention to the space between your eyebrows.", 3.0, "still"),
      line("Just rest your attention there, softly.", 2.0, "still"),
      line("Now, notice what's happening in your body right now.", 2.0, "still"),
      line("As if you're watching from a small distance, like a quiet observer.", 3.0, "still"),
      line("What do you notice?", 3.0, "still"),
      line("There's no need to fix it.", 2.0, "still"),
      line("Just notice it... and let it pass through you.", 5.0, "still"),
      line("You handled something hard today. That matters.", 3.5, "still"),
    ],
  },
];

export function getExercise(key: string) {
  return QUICK_CALM_EXERCISES.find((e) => e.key === key) ?? QUICK_CALM_EXERCISES[0];
}
