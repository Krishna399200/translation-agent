"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function CompletionScreen({
  onReplay,
  onRate,
  noPressureMode,
  replayLabel = "Do it again",
}: {
  onReplay: () => void;
  /** Omit (or pass undefined) when there's nothing left to rate — e.g. after
   * they've already added a reflection, or in no-pressure mode. */
  onRate?: () => void;
  noPressureMode: boolean;
  replayLabel?: string;
}) {
  const router = useRouter();

  return (
    <div className="fade-in w-full max-w-sm text-center">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
        {noPressureMode ? "Well done." : "That took courage."}
      </h2>
      <p className="mt-3 text-ink-soft">
        {noPressureMode ? "See you next time." : "Every rep counts, even the hard ones."}
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <Button onClick={onReplay} className="w-full">
          {replayLabel}
        </Button>
        {onRate && (
          <Button variant="secondary" onClick={onRate} className="w-full">
            How did that feel?
          </Button>
        )}
        <Button variant="ghost" onClick={() => router.push("/progress")} className="w-full">
          Listen back
        </Button>
        <Button variant="ghost" onClick={() => router.push("/home")} className="w-full">
          Back home
        </Button>
      </div>
    </div>
  );
}
