"use client";

import { useState } from "react";
import SentimentSelector from "@/components/SentimentSelector";
import Button from "@/components/Button";

export default function CheckinForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (sentiment: number, note: string) => void;
  submitting: boolean;
}) {
  const [sentiment, setSentiment] = useState<number | null>(null);
  const [note, setNote] = useState("");

  return (
    <div className="fade-in frosted-card mx-auto w-full max-w-md rounded-2xl px-6 py-8 text-center">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">That was hard</h2>
      <p className="mt-1 text-sm text-ink-soft">
        No recording, no pressure — just a place to put this down.
      </p>

      <div className="mt-8">
        <SentimentSelector value={sentiment} onChange={setSentiment} />
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional — what happened? (e.g. Stumbled on my name in the meeting)"
        rows={3}
        className="mt-6 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-teal-500/50"
      />

      <Button
        onClick={() => sentiment && onSubmit(sentiment, note.trim())}
        disabled={!sentiment || submitting}
        className="mt-6 w-full"
      >
        {submitting ? "Saving..." : "Save and let it go"}
      </Button>
    </div>
  );
}
