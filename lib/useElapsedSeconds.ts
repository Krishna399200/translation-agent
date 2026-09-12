"use client";

import { useEffect, useState } from "react";

export function useElapsedSeconds(active: boolean) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!active) return;

    const start = Date.now();
    const reset = setTimeout(() => setSeconds(0), 0);
    const timer = setInterval(() => setSeconds(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => {
      clearTimeout(reset);
      clearInterval(timer);
    };
  }, [active]);

  return active ? seconds : 0;
}

export function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
