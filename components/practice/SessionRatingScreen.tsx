"use client";

import { useState } from "react";
import SentimentSelector from "@/components/SentimentSelector";

export type SummaryStat = { label: string; value: string };

export default function SessionRatingScreen({
  stats,
  onSubmit,
  onSkip,
  submitting,
  skipLabel = "Skip reflection",
}: {
  stats: SummaryStat[];
  onSubmit: (rating: number) => void;
  onSkip: () => void;
  submitting: boolean;
  skipLabel?: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="fade-in mx-auto w-full max-w-lg">
      <div className="frosted-card rounded-2xl px-6 py-8 text-center sm:px-10">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
          How did that feel?
        </h2>
        <p className="mt-1 text-sm text-ink-soft">Honest reflection helps you grow. Select a sentiment.</p>

        <div className="mt-10">
          <SentimentSelector value={selected} onChange={setSelected} />
        </div>

        <div className="mt-8 flex flex-col items-stretch gap-4 rounded-xl border border-white/[0.06] bg-black/15 p-4 text-left sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-500/15">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal-300)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M5 15V9M10 18V6M15 15V9M20 12v0" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Session Summary</p>
              {stats.map((s) => (
                <p key={s.label} className="text-xs text-ink-faint">
                  {s.label}: <span className="text-ink-soft">{s.value}</span>
                </p>
              ))}
            </div>
          </div>

          <button
            onClick={() => selected && onSubmit(selected)}
            disabled={!selected || submitting}
            className="press btn-glow flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed"
          >
            {submitting ? (
              "Saving..."
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Save this rep
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs text-ink-faint">
        <button onClick={onSkip} className="underline decoration-dotted underline-offset-4 hover:text-ink-soft">
          {skipLabel}
        </button>
      </div>
    </div>
  );
}
