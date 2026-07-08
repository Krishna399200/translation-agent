"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAudioRecorder } from "@/lib/useAudioRecorder";
import { usePhraseHighlighter } from "@/lib/usePhraseHighlighter";
import { PHRASE, type Pace } from "@/lib/phrase";
import CalmLoader from "@/components/CalmLoader";
import Button from "@/components/Button";
import ConsentScreen from "@/components/practice/ConsentScreen";
import PhraseDisplay from "@/components/practice/PhraseDisplay";
import PacePicker from "@/components/practice/PacePicker";
import RatingStep from "@/components/practice/RatingStep";

type Stage = "loading" | "consent" | "ready" | "recording" | "rating" | "saving" | "done" | "mic-error";

export default function PracticePage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("loading");
  const [pace, setPace] = useState<Pace>("medium");
  const [userId, setUserId] = useState<string | null>(null);
  const [baselineConfidence, setBaselineConfidence] = useState<number | null>(null);
  const [isFirstSession, setIsFirstSession] = useState(false);
  const [saveError, setSaveError] = useState("");

  const recorder = useAudioRecorder();

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      const [{ data: profile }, { count }] = await Promise.all([
        supabase.from("profiles").select("baseline_confidence").eq("id", user.id).maybeSingle(),
        supabase
          .from("practice_sessions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      setBaselineConfidence(profile?.baseline_confidence ?? null);
      setIsFirstSession((count ?? 0) === 0);

      const consented = localStorage.getItem(`fluent_consent_${user.id}`);
      setStage(consented ? "ready" : "consent");
    })();
  }, [router]);

  const pendingRecording = useRef<{ blob: Blob; durationSeconds: number } | null>(null);

  const activeIndex = usePhraseHighlighter(pace, stage === "recording", async () => {
    const result = await recorder.stop();
    pendingRecording.current = result;
    setStage("rating");
  });

  function handleConsent() {
    if (userId) localStorage.setItem(`fluent_consent_${userId}`, "true");
    setStage("ready");
  }

  async function handleBegin() {
    const started = await recorder.start();
    if (started) setStage("recording");
  }

  async function handleRatingSubmit(rating: number) {
    if (!userId || !pendingRecording.current) return;
    setStage("saving");
    setSaveError("");

    const supabase = createClient();
    const { blob, durationSeconds } = pendingRecording.current;
    const path = `${userId}/${crypto.randomUUID()}.webm`;

    const { error: uploadError } = await supabase.storage
      .from("recordings")
      .upload(path, blob, { contentType: blob.type || "audio/webm" });

    if (uploadError) {
      setSaveError("We couldn't save that recording. Mind trying again?");
      setStage("rating");
      return;
    }

    const { error: insertError } = await supabase.from("practice_sessions").insert({
      user_id: userId,
      phrase_id: PHRASE.id,
      audio_url: path,
      duration_seconds: durationSeconds,
      self_rating: rating,
      baseline_confidence: isFirstSession ? baselineConfidence : null,
    });

    if (insertError) {
      setSaveError("We couldn't save that recording. Mind trying again?");
      setStage("rating");
      return;
    }

    setStage("done");
  }

  if (stage === "loading") {
    return (
      <main className="flex flex-1 items-center justify-center px-6">
        <CalmLoader />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      {stage === "consent" && <ConsentScreen onConsent={handleConsent} />}

      {stage === "ready" && (
        <div className="fade-in w-full max-w-md text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-teal-500">
            Today&apos;s practice
          </p>
          <div className="mt-6 rounded-2xl border border-teal-100 bg-card px-6 py-10 shadow-soft">
            <PhraseDisplay activeIndex={-1} />
          </div>

          <div className="mt-8">
            <PacePicker pace={pace} onChange={setPace} />
          </div>

          <p className="mt-8 text-sm text-ink-soft">
            We&apos;ll record while you read, just for you to hear later.
          </p>

          <Button onClick={handleBegin} className="mt-4 w-full" disabled={recorder.status === "requesting"}>
            {recorder.status === "requesting" ? "One moment..." : "Let's find your pace today"}
          </Button>

          {recorder.status === "error" && (
            <p className="mt-4 text-sm text-teal-700">{recorder.error}</p>
          )}
        </div>
      )}

      {stage === "recording" && (
        <div className="fade-in w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex items-center justify-center gap-1">
            <span className="ripple h-3 w-3 rounded-full bg-gold-500" />
            <span className="text-sm text-ink-soft">Recording — just breathe and read</span>
          </div>
          <div className="rounded-2xl border border-teal-100 bg-card px-6 py-10 shadow-soft">
            <PhraseDisplay activeIndex={activeIndex} />
          </div>
        </div>
      )}

      {stage === "rating" && (
        <>
          <RatingStep onSubmit={handleRatingSubmit} submitting={false} />
          {saveError && <p className="mt-4 text-sm text-teal-700">{saveError}</p>}
        </>
      )}

      {stage === "saving" && <CalmLoader label="Saving your progress..." />}

      {stage === "done" && (
        <div className="fade-in w-full max-w-sm text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-teal-700">
            That took courage.
          </h2>
          <p className="mt-3 text-ink-soft">Every rep counts, even the hard ones.</p>
          <div className="mt-8 flex flex-col gap-3">
            <Button onClick={() => router.push("/progress")} className="w-full">
              Listen back
            </Button>
            <Button variant="secondary" onClick={() => router.push("/home")} className="w-full">
              Back home
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
