"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Lightweight voice-over using the browser's built-in Speech Synthesis API.
 *
 * Quick Calm's spec calls for pre-generated ElevenLabs narration, but that
 * requires an ElevenLabs account and an audio-hosting pipeline this build
 * doesn't have access to. The browser's native TTS gives every exercise real,
 * zero-latency spoken guidance today; swapping in hosted ElevenLabs clips
 * later just means pointing `speak()` at an `<audio>` element instead.
 */
export function useSpeechVoiceover(enabled: boolean) {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !enabled) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88;
      utterance.pitch = 1;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    },
    [supported, enabled]
  );

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
  }, [supported]);

  return { speak, stop, supported };
}
