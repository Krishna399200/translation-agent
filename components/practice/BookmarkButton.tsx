"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function BookmarkButton({ userId, textBankId }: { userId: string; textBankId: string }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("user_saved_affirmations")
        .select("id")
        .eq("user_id", userId)
        .eq("text_bank_id", textBankId)
        .maybeSingle();
      if (!cancelled) setSaved(!!data);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, textBankId]);

  async function toggle() {
    setLoading(true);
    const supabase = createClient();
    if (saved) {
      const { error } = await supabase
        .from("user_saved_affirmations")
        .delete()
        .eq("user_id", userId)
        .eq("text_bank_id", textBankId);
      if (!error) setSaved(false);
    } else {
      const { error } = await supabase
        .from("user_saved_affirmations")
        .insert({ user_id: userId, text_bank_id: textBankId });
      // 23505 = unique_violation — already saved (e.g. a race with another
      // tab against the (user_id, text_bank_id) constraint), not a failure.
      if (!error || error.code === "23505") setSaved(true);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Remove from My Affirmations" : "Save to My Affirmations"}
      aria-pressed={saved}
      className="press flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/20 hover:border-lavender-500/40 disabled:opacity-50"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={saved ? "var(--color-lavender-300)" : "none"}
        stroke="var(--color-lavender-300)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4.5L5 21V4.5a1 1 0 0 1 1-1Z" />
      </svg>
    </button>
  );
}
