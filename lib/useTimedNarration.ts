"use client";

import { useEffect, useRef, useState } from "react";

export type TimedLine = { text: string; startTime: number; endTime: number };

type TimingFile = { steps: TimedLine[] };

/**
 * Drives captions off a pre-generated ElevenLabs audio file's ACTUAL
 * timing (via the <audio> element's native `timeupdate` event and a stored
 * per-line timestamp JSON), instead of a fixed schedule that assumes
 * declared pause durations match what the engine really produced — that
 * mismatch was the root of the original caption-drift bug.
 *
 * Returns `available: false` if the exercise doesn't have generated audio
 * yet (scripts/generate-quickcalm-audio.mjs hasn't been run for it), so the
 * caller can fall back to the Web Speech API step player.
 */
export function useTimedNarration(exerciseKey: string, muted: boolean, onDone: () => void) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [lines, setLines] = useState<TimedLine[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/audio/quick-calm/${exerciseKey}.json`, { cache: "force-cache" });
        if (!res.ok) throw new Error("no timing file");
        const data: TimingFile = await res.json();
        if (cancelled) return;
        if (!Array.isArray(data.steps) || data.steps.length === 0) throw new Error("empty timing file");
        setLines(data.steps);
        setAvailable(true);
      } catch {
        if (!cancelled) setAvailable(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [exerciseKey]);

  useEffect(() => {
    if (available !== true) return;

    const audio = new Audio(`/audio/quick-calm/${exerciseKey}.mp3`);
    audio.muted = muted;
    audioRef.current = audio;

    function handleTimeUpdate() {
      const t = audio.currentTime;
      const idx = lines.findIndex((l) => t >= l.startTime && t < l.endTime);
      if (idx !== -1) setStepIndex(idx);
    }

    function handleEnded() {
      onDoneRef.current();
    }

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.play().catch(() => {
      // Autoplay can be blocked without a prior user gesture; the "Begin"
      // tap that led here should count as one in every supported browser,
      // but fail quietly rather than throw if it doesn't.
    });

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available, exerciseKey]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  return { available, line: lines[stepIndex] ?? null, stepIndex };
}
