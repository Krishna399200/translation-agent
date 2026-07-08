"use client";

import { useEffect, useRef, useState } from "react";
import type WaveSurfer from "wavesurfer.js";

export default function WaveformPlayer({ url, compact = false }: { url: string; compact?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<WaveSurfer | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { default: WaveSurferLib } = await import("wavesurfer.js");
      if (cancelled || !containerRef.current) return;

      const ws = WaveSurferLib.create({
        container: containerRef.current,
        url,
        height: compact ? 36 : 56,
        waveColor: "rgba(255,255,255,0.18)",
        progressColor: "#6fd7c8",
        cursorColor: "#e0b34a",
        cursorWidth: 2,
        barWidth: 2,
        barGap: 2,
        barRadius: 4,
      });

      ws.on("ready", () => !cancelled && setReady(true));
      ws.on("play", () => !cancelled && setPlaying(true));
      ws.on("pause", () => !cancelled && setPlaying(false));
      ws.on("finish", () => !cancelled && setPlaying(false));

      waveRef.current = ws;
    })();

    return () => {
      cancelled = true;
      waveRef.current?.destroy();
      waveRef.current = null;
    };
  }, [url, compact]);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => waveRef.current?.playPause()}
        disabled={!ready}
        aria-label={playing ? "Pause" : "Play"}
        className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500 text-void-deep disabled:opacity-40"
      >
        {playing ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="1" y="1" width="3.5" height="10" rx="1" />
            <rect x="7" y="1" width="3.5" height="10" rx="1" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2 1 L11 6 L2 11 Z" />
          </svg>
        )}
      </button>
      <div ref={containerRef} className="min-w-0 flex-1" />
    </div>
  );
}
