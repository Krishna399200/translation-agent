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

      if (uploadError) return { error: "We couldn't save that recording. Mind trying again?", sessionId: null };

      const { data, error: insertError } = await supabase
        .from("practice_sessions")
        .insert({
          user_id: userId,
          phrase_id: params.contentRef,
          audio_url: path,
          duration_seconds: params.durationSeconds,
          self_rating: params.selfRating,
          baseline_confidence: params.baselineConfidence ?? null,
          practice_type: params.practiceType,
        })
        .select("id")
        .single();

      if (insertError) return { error: "We couldn't save that recording. Mind trying again?", sessionId: null };

      return { error: null, sessionId: data.id as string };
    },
    [userId]
  );

  const updateRating = useCallback(async (sessionId: string, rating: number) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("practice_sessions")
      .update({ self_rating: rating })
      .eq("id", sessionId);
    return { error: error ? "That didn't save. Mind trying again?" : null };
  }, []);

  return { save, updateRating };
}
