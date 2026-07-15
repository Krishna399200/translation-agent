"use client";

import { useEffect, useRef, useState } from "react";
import type { QuickCalmStep } from "@/lib/quickCalm";
import { useSpeechVoiceover } from "@/lib/useSpeechVoiceover";

export function useQuickCalmPlayer(steps: QuickCalmStep[], soundOn: boolean, onDone: () => void) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const onDoneRef = useRef(onDone);
  const { speak, stop } = useSpeechVoiceover(soundOn);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const step = steps[index];
    if (!step) return;

    speak(step.text);

    const timer = setTimeout(() => {
      if (index + 1 >= steps.length) {
        setDone(true);
        onDoneRef.current();
      } else {
        setIndex((i) => i + 1);
      }
    }, step.durationMs);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    if (!soundOn) stop();
  }, [soundOn, stop]);

  return { step: steps[index], index, done };
}
