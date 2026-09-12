"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteRecordingButton({
  sessionId,
  audioPath,
  table = "practice_sessions",
}: {
  sessionId: string;
  audioPath: string;
  table?: "practice_sessions" | "scenario_sessions";
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    setError(false);
    const supabase = createClient();
    await supabase.storage.from("recordings").remove([audioPath]);
    const { error: deleteError } = await supabase.from(table).delete().eq("id", sessionId);

    if (deleteError) {
      setDeleting(false);
      setError(true);
      return;
    }

    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-ink-soft">{error ? "Couldn't remove that — try again?" : "Remove this recording?"}</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="press font-semibold text-mood-difficult underline"
        >
          {deleting ? "Removing..." : "Yes, remove it"}
        </button>
        <button onClick={() => setConfirming(false)} className="press text-ink-faint">
          Never mind
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="press text-xs text-ink-faint hover:text-ink-soft"
    >
      Delete
    </button>
  );
}
