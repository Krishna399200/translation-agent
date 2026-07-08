"use client";

import { useEffect, useRef } from "react";

/** Plays a soft 432Hz sine tone for the duration this hook's `enabled` flag is true. */
export function useTone432(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = 432;
    gain.gain.value = 0;

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 1.2);

    ctxRef.current = ctx;
    oscRef.current = osc;
    gainRef.current = gain;

    return () => {
      const now = ctx.currentTime;
      gain.gain.linearRampToValueAtTime(0, now + 0.4);
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 500);
    };
  }, [enabled]);
}
