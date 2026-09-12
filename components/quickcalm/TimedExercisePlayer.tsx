"use client";

import { useTimedNarration } from "@/lib/useTimedNarration";
import type { QuickCalmDefinition } from "@/lib/quickCalm";
import Toggle from "@/components/Toggle";
import Avatar from "@/components/quickcalm/Avatar";
import BreathingVisual from "@/components/quickcalm/BreathingVisual";

/** Audio-element + real-timestamp driven player, used when
 * scripts/generate-quickcalm-audio.mjs has produced audio + timing files
 * for this exercise. See ExercisePlayer.tsx for the availability check and
 * fallback to the Web Speech step player. */
export default function TimedExercisePlayer({
  exercise,
  soundOn,
  onSoundChange,
  onDone,
}: {
  exercise: QuickCalmDefinition;
  soundOn: boolean;
  onSoundChange: (value: boolean) => void;
  onDone: () => void;
}) {
  const { line, stepIndex } = useTimedNarration(exercise.key, !soundOn, onDone);

  // Timing files carry text + real timestamps only; phase/handSide for the
  // visual come from the original step list at the same index (both are
  // derived from lib/quickCalmScript.json in the same order).
  const visualStep = exercise.steps[stepIndex] ?? exercise.steps[0];

  return (
    <div className="fade-in flex w-full max-w-md flex-col items-center text-center">
      <div className="mb-2 flex w-full items-center justify-between">
        <span className="text-sm text-ink-faint">{exercise.title}</span>
        <Toggle checked={soundOn} onChange={onSoundChange} label="Sound" />
      </div>

      <Avatar />

      <div className="mt-4">
        <BreathingVisual visual={exercise.visual} step={visualStep} />
      </div>

      <p key={line?.text ?? stepIndex} className="fade-in mt-8 min-h-16 text-lg text-ink">
        {line?.text ?? visualStep.text}
      </p>
    </div>
  );
}
