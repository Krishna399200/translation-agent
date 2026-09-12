"use client";

import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ScenarioType } from "@/lib/textBank";

export function useScenarioSave(userId: string) {
  const save = useCallback(
    async (params: {
      blob: Blob;
      durationSeconds: number;
      scenarioType: ScenarioType;
      textBankId: string | null;
      selfRating: number | null;
    }) => {
      const supabase = createClient();
      const path = `${userId}/${crypto.randomUUID()}.webm`;

      const { error: uploadError } = await supabase.storage
        .from("recordings")
        .upload(path, params.blob, { contentType: params.blob.type || "audio/webm" });

      if (uploadError) return { error: "We couldn't save that recording. Mind trying again?", sessionId: null };

      const { data, error: insertError } = await supabase
        .from("scenario_sessions")
        .insert({
          user_id: userId,
          scenario_type: params.scenarioType,
          text_bank_id: params.textBankId,
          audio_url: path,
          duration_seconds: params.durationSeconds,
          self_rating: params.selfRating,
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
    const { error } = await supabase.from("scenario_sessions").update({ self_rating: rating }).eq("id", sessionId);
    return { error: error ? "That didn't save. Mind trying again?" : null };
  }, []);

  return { save, updateRating };
}
