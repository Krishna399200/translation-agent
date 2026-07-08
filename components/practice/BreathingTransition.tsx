"use client";

import { useEffect, useState } from "react";
import { useTone432 } from "@/lib/useTone432";
import { useSettings } from "@/lib/settings/SettingsContext";

const DURATION_MS = 5000;

export default function BreathingTransition({
  subtext,
  onDone,
}: {
  subtext: string;
  onDone: () => void;
}) {
  const { tone432 } = useSettings();
  const [ready, setReady] = useState(false);

  useTone432(tone432);

  useEffect(() => {
    const revealTimer = setTimeout(() => setReady(true), 50);
    const doneTimer = setTimeout(onDone, DURATION_MS);
    return () => {
      clearTimeout(revealTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <button
      onClick={onDone}
      className="fade-in fixed inset-0 z-20 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(60% 50% at 50% 35%, rgba(120,200,190,0.35), transparent 70%), linear-gradient(180deg, #dce9e6 0%, #cfe0e3 60%, #c3d8dd 100%)",
      }}
    >
      {tone432 && (
        <div className="absolute top-6 flex items-center gap-2 rounded-full bg-white/40 px-4 py-1.5 text-xs font-medium text-teal-700">
          <span className="ripple inline-block h-1.5 w-1.5 rounded-full bg-teal-600" />
          432Hz · Calming Tones
        </div>
      )}

      <div
        className={`breathe-pulse rounded-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
        style={{
          width: "clamp(180px, 32vw, 320px)",
          height: "clamp(180px, 32vw, 320px)",
          background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55), rgba(90,160,180,0.35) 55%, rgba(70,120,150,0.25) 100%)",
          boxShadow: "0 0 90px 20px rgba(140, 200, 190, 0.35)",
        }}
      />

      <div className="fade-in mt-14 max-w-md px-6 text-center">
        <p className="text-xl font-medium text-[#1f3a3a]">Inhale... and exhale. There is no rush.</p>
        <p className="mt-2 text-sm text-[#3d5a58]/80">{subtext}</p>
      </div>
    </button>
  );
}
