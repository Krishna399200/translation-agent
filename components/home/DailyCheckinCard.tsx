"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SentimentSelector from "@/components/SentimentSelector";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function dismissedKey(userId: string) {
  return `fluent_daily_checkin_dismissed_${userId}_${todayKey()}`;
}

export default function DailyCheckinCard({ userId }: { userId: string }) {
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(dismissedKey(userId)) === "true"
  );
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function dismiss() {
    localStorage.setItem(dismissedKey(userId), "true");
    setDismissed(true);
  }

  async function handleSelect(sentiment: number) {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("daily_checkins").insert({
      user_id: userId,
      sentiment,
      checkin_date: todayKey(),
    });
    setSaving(false);
    // 23505 = unique_violation — already checked in today (e.g. another tab
    // hit the (user_id, checkin_date) constraint first), not a real failure.
    if (error && error.code !== "23505") return;
    setSaved(true);
    localStorage.setItem(dismissedKey(userId), "true");
  }

  if (dismissed) return null;

  return (
    <div className="fade-in rounded-xl border border-white/[0.06] bg-black/15 px-6 py-5">
      {saved ? (
        <p className="text-center text-sm text-ink-soft">Thank you for checking in. See you tomorrow.</p>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <p className="font-[family-name:var(--font-display)] font-semibold text-ink">
              How&apos;s your voice feeling today?
            </p>
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="press text-ink-faint hover:text-ink-soft"
            >
              ×
            </button>
          </div>
          <p className="mt-1 text-sm text-ink-soft">No session needed — just an honest pulse check.</p>
          <div className={`mt-5 ${saving ? "pointer-events-none opacity-50" : ""}`}>
            <SentimentSelector value={null} onChange={handleSelect} />
          </div>
        </>
      )}
    </div>
  );
}
