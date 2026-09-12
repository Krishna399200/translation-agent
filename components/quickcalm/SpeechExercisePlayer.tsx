"use client";

import { useQuickCalmPlayer } from "@/lib/useQuickCalmPlayer";
import type { QuickCalmDefinition } from "@/lib/quickCalm";
import Toggle from "@/components/Toggle";
import Avatar from "@/components/quickcalm/Avatar";
import BreathingVisual from "@/components/quickcalm/BreathingVisual";

/**
 * Web Speech API fallback player — used when no pre-generated ElevenLabs
 * audio/timing exists yet for this exercise (see ExercisePlayer.tsx).
 * Mounted with a fresh `key` per run (see quick-calm/page.tsx) so replaying
 * an exercise resets useQuickCalmPlayer's internal step index cleanly,
 * instead of needing an explicit reset() escape hatch on the hook.
 */
export default function SpeechExercisePlayer({
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
  const { step } = useQuickCalmPlayer(exercise.steps, soundOn, onDone);

  if (!step) return null;

  return (
    <div className="fade-in flex w-full max-w-md flex-col items-center text-center">
      <div className="mb-2 flex w-full items-center justify-between">
        <span className="text-sm text-ink-faint">{exercise.title}</span>
        <Toggle checked={soundOn} onChange={onSoundChange} label="Sound" />
      </div>

      <Avatar />

      <div className="mt-4">
        <BreathingVisual visual={exercise.visual} step={step} />
      </div>

      <p key={step.text} className="fade-in mt-8 min-h-16 text-lg text-ink">
        {step.text}
      </p>
    </div>
  );
}
