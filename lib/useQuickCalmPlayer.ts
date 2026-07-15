"use client";

import { useEffect, useRef, useState } from "react";
import type { QuickCalmStep } from "@/lib/quickCalm";
import { useSpeechVoiceover } from "@/lib/useSpeechVoiceover";

// Browser TTS `onend` events are known to be unreliable (Chrome in
// particular can drop them when a tab loses focus). Without a safety net a
// missed event leaves the exercise frozen on that step forever — which
// looks like a bug with no error message to show, since nothing actually
// threw. This watchdog guarantees the exercise always keeps moving.
const WATCHDOG_MULTIPLIER = 2.2;
const WATCHDOG_MIN_BUFFER_MS = 3000;

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

    let settled = false;
    let breakTimer: ReturnType<typeof setTimeout> | null = null;
    let watchdogTimer: ReturnType<typeof setTimeout> | null = null;

    function advance() {
      if (settled) return;
      settled = true;
      if (watchdogTimer) clearTimeout(watchdogTimer);
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
        if (settled) return;
        breakTimer = setTimeout(advance, step.breakMs);
      });
      // If the browser never fires the end/error event, don't hang forever.
      watchdogTimer = setTimeout(advance, step.durationMs * WATCHDOG_MULTIPLIER + WATCHDOG_MIN_BUFFER_MS);
    } else {
      breakTimer = setTimeout(advance, step.durationMs);
    }

    return () => {
      settled = true;
      if (breakTimer) clearTimeout(breakTimer);
      if (watchdogTimer) clearTimeout(watchdogTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, soundOn]);

  useEffect(() => {
    if (!soundOn) stop();
  }, [soundOn, stop]);

  return { step: steps[index], index, done };
}
