"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Lightweight voice-over using the browser's built-in Speech Synthesis API.
 *
 * Quick Calm's script is written for ElevenLabs narration, but that requires
 * an ElevenLabs account and an audio-hosting pipeline this build doesn't
 * have access to. The browser's native TTS gives every exercise real,
 * zero-latency spoken guidance today, tuned as close to a "calm narrator" as
 * a system voice allows (slow rate, lowered pitch, best-effort preference
 * for a warm/mid-range voice among whatever the browser has installed —
 * that list varies by OS and isn't something we can fully control the way
 * a curated ElevenLabs voice model would be). Swapping in hosted narration
 * later just means pointing `speak()` at an `<audio>` element instead.
 */

const CALM_VOICE_HINTS = [
  "daniel",
  "guy",
  "aaron",
  "fred",
  "alex",
  "david",
  "ryan",
  "arthur",
  "oliver",
  "male",
];

const AVOID_VOICE_HINTS = ["novelty", "child", "bells", "trinoids", "whisper", "organ"];

function pickCalmVoice(voices: SpeechSynthesisVoice[]) {
  const english = voices.filter((v) => v.lang?.toLowerCase().startsWith("en"));
  const pool = english.length > 0 ? english : voices;

  const scored = pool
    .map((voice) => {
      const name = voice.name.toLowerCase();
      let score = 0;
      if (AVOID_VOICE_HINTS.some((hint) => name.includes(hint))) score -= 10;
      if (CALM_VOICE_HINTS.some((hint) => name.includes(hint))) score += 5;
      if (voice.localService) score += 1;
      return { voice, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.voice ?? null;
}

export function useSpeechVoiceover(enabled: boolean) {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (!supported) return;

    function loadVoice() {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) setVoice(pickCalmVoice(voices));
    }

    loadVoice();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoice);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoice);
  }, [supported]);

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!supported || !enabled) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.82;
      utterance.pitch = 0.92;
      utterance.volume = 0.9;
      if (voice) utterance.voice = voice;
      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
      }
      window.speechSynthesis.speak(utterance);
    },
    [supported, enabled, voice]
  );

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
  }, [supported]);

  return { speak, stop, supported };
}
