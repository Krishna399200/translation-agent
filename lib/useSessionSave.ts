"use client";

import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PracticeType } from "@/lib/database.types";

export function useSessionSave(userId: string) {
  const save = useCallback(
    async (params: {
      blob: Blob;
      durationSeconds: number;
      practiceType: PracticeType;
      contentRef: string;
      selfRating: number | null;
      baselineConfidence?: number | null;
    }) => {
      const supabase = createClient();
      const path = `${userId}/${crypto.randomUUID()}.webm`;

      const { error: uploadError } = await supabase.storage
        .from("recordings")
        .upload(path, params.blob, { contentType: params.blob.type || "audio/webm" });

      if (uploadError) return { error: "We couldn't save that recording. Mind trying again?" };

      const { error: insertError } = await supabase.from("practice_sessions").insert({
        user_id: userId,
        phrase_id: params.contentRef,
        audio_url: path,
        duration_seconds: params.durationSeconds,
        self_rating: params.selfRating,
        baseline_confidence: params.baselineConfidence ?? null,
        practice_type: params.practiceType,
      });

      if (insertError) return { error: "We couldn't save that recording. Mind trying again?" };

      return { error: null };
    },
    [userId]
  );

  return save;
}
