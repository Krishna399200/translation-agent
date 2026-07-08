"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteRecordingButton({
  sessionId,
  audioPath,
}: {
  sessionId: string;
  audioPath: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    await supabase.storage.from("recordings").remove([audioPath]);
    await supabase.from("practice_sessions").delete().eq("id", sessionId);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-ink-soft">Remove this recording?</span>
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
