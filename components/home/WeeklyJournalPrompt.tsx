"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function WeeklyJournalPrompt({ userId }: { userId: string }) {
  const router = useRouter();

  async function handleClick() {
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ last_journal_prompt_at: new Date().toISOString() })
      .eq("id", userId);
    router.push("/practice?mode=journal");
  }

  return (
    <button
      onClick={handleClick}
      className="press frosted-card fade-in flex w-full items-center justify-between rounded-2xl px-6 py-5 text-left"
    >
      <div>
        <p className="font-[family-name:var(--font-display)] font-semibold text-ink">
          How has this week felt for your voice?
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          A gentle, unscored moment to reflect — just for you.
        </p>
      </div>
      <span className="shrink-0 rounded-full border border-lavender-500/40 px-4 py-2 text-sm font-medium text-lavender-300">
        Reflect
      </span>
    </button>
  );
}
