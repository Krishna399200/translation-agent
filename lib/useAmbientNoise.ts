"use client";

import { useEffect } from "react";

type Ambience = "room-tone" | "hush" | "shuffle" | "studio-hum";

// Filter cutoff + gain per ambience — no real room-tone recordings exist in
// this build, so a very quiet filtered-noise bed stands in, shaped just
// enough per scenario to feel distinct (a lecture hall reads "hushed and
// open," a studio reads "low and close").
const PROFILE: Record<Ambience, { cutoff: number; gain: number }> = {
  "room-tone": { cutoff: 900, gain: 0.02 },
  hush: { cutoff: 500, gain: 0.018 },
  shuffle: { cutoff: 1400, gain: 0.02 },
  "studio-hum": { cutoff: 220, gain: 0.025 },
};

export function useAmbientNoise(ambience: Ambience, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const profile = PROFILE[ambience];

    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = profile.cutoff;

    const gain = ctx.createGain();
    gain.gain.value = 0;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
    gain.gain.linearRampToValueAtTime(profile.gain, ctx.currentTime + 1.5);

    return () => {
      const now = ctx.currentTime;
      gain.gain.linearRampToValueAtTime(0, now + 0.4);
      setTimeout(() => {
        noise.stop();
        ctx.close();
      }, 500);
    };
  }, [ambience, enabled]);
}
