"use client";

import { useEffect, useRef, useState } from "react";
import type { QuickCalmStep } from "@/lib/quickCalm";
import { useSpeechVoiceover } from "@/lib/useSpeechVoiceover";

export function useQuickCalmPlayer(steps: QuickCalmStep[], soundOn: boolean, onDone: () => void) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const onDoneRef = useRef(onDone);
  const { speak, stop, supported } = useSpeechVoiceover(soundOn);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const step = steps[index];
    if (!step) return;

    let cancelled = false;
    let breakTimer: ReturnType<typeof setTimeout> | null = null;

    function advance() {
      if (cancelled) return;
      if (index + 1 >= steps.length) {
        setDone(true);
        onDoneRef.current();
      } else {
        setIndex((i) => i + 1);
      }
    }

    if (soundOn && supported) {
      // Pause starts once the line has actually finished being spoken.
      speak(step.text, () => {
        breakTimer = setTimeout(advance, step.breakMs);
      });
    } else {
      breakTimer = setTimeout(advance, step.durationMs);
    }

    return () => {
      cancelled = true;
      if (breakTimer) clearTimeout(breakTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, soundOn]);

  useEffect(() => {
    if (!soundOn) stop();
  }, [soundOn, stop]);

  return { step: steps[index], index, done };
}
