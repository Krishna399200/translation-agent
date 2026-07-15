"use client";

import { useEffect, useState } from "react";
import type { QuickCalmDefinition } from "@/lib/quickCalm";
import CalmLoader from "@/components/CalmLoader";
import TimedExercisePlayer from "@/components/quickcalm/TimedExercisePlayer";
import SpeechExercisePlayer from "@/components/quickcalm/SpeechExercisePlayer";

/**
 * Picks between the ElevenLabs-audio-driven player (real timestamps, no
 * drift) and the Web Speech API fallback, per exercise, based on whether
 * scripts/generate-quickcalm-audio.mjs has produced files for it yet.
 * Nothing in the app breaks if it hasn't — it just uses the fallback.
 */
export default function ExercisePlayer(props: {
  exercise: QuickCalmDefinition;
  soundOn: boolean;
  onSoundChange: (value: boolean) => void;
  onDone: () => void;
}) {
  const [hasTimedAudio, setHasTimedAudio] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/audio/quick-calm/${props.exercise.key}.json`, { method: "HEAD" })
      .then((res) => !cancelled && setHasTimedAudio(res.ok))
      .catch(() => !cancelled && setHasTimedAudio(false));
    return () => {
      cancelled = true;
    };
  }, [props.exercise.key]);

  if (hasTimedAudio === null) return <CalmLoader />;

  return hasTimedAudio ? <TimedExercisePlayer {...props} /> : <SpeechExercisePlayer {...props} />;
}
