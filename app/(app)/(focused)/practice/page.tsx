"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAudioRecorder } from "@/lib/useAudioRecorder";
import { usePhraseHighlighter } from "@/lib/usePhraseHighlighter";
import { useSessionSave } from "@/lib/useSessionSave";
import { useSettings } from "@/lib/settings/SettingsContext";
import { useElapsedSeconds, formatTime } from "@/lib/useElapsedSeconds";
import { pickText, rememberShownText, type LengthTag } from "@/lib/textBank";
import { PHRASE, type Pace } from "@/lib/phrase";
import CalmLoader from "@/components/CalmLoader";
import Button from "@/components/Button";
import Toggle from "@/components/Toggle";
import ConsentScreen from "@/components/practice/ConsentScreen";
import PhraseDisplay from "@/components/practice/PhraseDisplay";
import PacePicker from "@/components/practice/PacePicker";
import LengthPicker from "@/components/practice/LengthPicker";
import CategoryPicker from "@/components/practice/CategoryPicker";
import BreathingTransition from "@/components/practice/BreathingTransition";
import LiveWaveform from "@/components/practice/LiveWaveform";
import SessionRatingScreen from "@/components/practice/SessionRatingScreen";
import BookmarkButton from "@/components/practice/BookmarkButton";

type Stage = "loading" | "consent" | "setup" | "breathing" | "recording" | "rating" | "saving" | "done";

const JOURNAL_PROMPT = "How has this week felt for your voice? Speak freely — there's no script, just you.";

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isJournal = searchParams.get("mode") === "journal";

  const [stage, setStage] = useState<Stage>("loading");
  const [pace, setPace] = useState<Pace>("medium");
  const [length, setLength] = useState<LengthTag>("short");
  const [category, setCategory] = useState("affirmations");
  const [userId, setUserId] = useState<string | null>(null);
  const [baselineConfidence, setBaselineConfidence] = useState<number | null>(null);
  const [isFirstSession, setIsFirstSession] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [content, setContent] = useState<{ id: string; text: string }>({ id: PHRASE.id, text: PHRASE.text });
  const [pendingRecording, setPendingRecording] = useState<{ blob: Blob; durationSeconds: number } | null>(null);

  const { tone432, setTone432, noPressureMode } = useSettings();
  const recorder = useAudioRecorder();
  const elapsed = useElapsedSeconds(stage === "recording");
  const save = useSessionSave(userId ?? "");

  const words = isJournal ? [] : content.text.split(" ");

  async function finishRecording(result: { blob: Blob; durationSeconds: number }) {
    if (!isJournal && userId) rememberShownText(userId, content.id);
    setPendingRecording(result);
    if (isJournal || noPressureMode) {
      await persist(result, null);
    } else {
      setStage("rating");
    }
  }

  const activeIndex = usePhraseHighlighter(words.length, pace, stage === "recording" && !isJournal, async () => {
    const result = await recorder.stop();
    await finishRecording(result);
  });

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
      setStage(consented ? "setup" : "consent");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleConsent() {
    if (userId) localStorage.setItem(`fluent_consent_${userId}`, "true");
    setStage("setup");
  }

  async function handleBeginSetup() {
    if (!isJournal && userId) {
      const picked = await pickText(createClient(), userId, category, length);
      setContent(picked);
    }
    setStage("breathing");
  }

  async function handleBreathingDone() {
    const started = await recorder.start();
    if (started) setStage("recording");
    else setStage("setup");
  }

  async function handleManualFinish() {
    const result = await recorder.stop();
    await finishRecording(result);
  }

  async function persist(result: { blob: Blob; durationSeconds: number }, rating: number | null) {
    if (!userId) return;
    setStage("saving");
    setSaveError("");

    const { error } = await save({
      blob: result.blob,
      durationSeconds: result.durationSeconds,
      practiceType: isJournal ? "journal" : "reading_text",
      contentRef: isJournal ? "journal" : content.id,
      selfRating: rating,
      baselineConfidence: isFirstSession ? baselineConfidence : null,
    });

    if (error) {
      setSaveError(error);
      setStage(isJournal || noPressureMode ? "recording" : "rating");
      return;
    }

    setStage("done");
  }

  async function handleRatingSubmit(rating: number) {
    if (!pendingRecording) return;
    await persist(pendingRecording, rating);
  }

  async function handleSkipRating() {
    if (!pendingRecording) return;
    await persist(pendingRecording, null);
  }

  if (stage === "loading") return <CalmLoader />;

  if (stage === "consent") return <ConsentScreen onConsent={handleConsent} />;

  if (stage === "setup") {
    return (
      <div className="fade-in w-full max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-300">
          {isJournal ? "Weekly voice journal" : "Today's practice"}
        </p>

        <div className="frosted-card mt-6 rounded-2xl px-6 py-8">
          {isJournal ? (
            <p className="text-lg text-ink-soft">{JOURNAL_PROMPT}</p>
          ) : (
            <PhraseDisplay words={content.text.split(" ")} activeIndex={-1} />
          )}
        </div>

        {!isJournal && (
          <>
            <div className="mt-6">
              <CategoryPicker value={category} onChange={setCategory} />
            </div>
            <div className="mt-4 flex justify-center">
              <LengthPicker value={length} onChange={setLength} />
            </div>
            <div className="mt-6">
              <PacePicker pace={pace} onChange={setPace} />
            </div>
          </>
        )}

        <div className="frosted-card mt-6 flex items-center justify-between rounded-xl px-4 py-3">
          <Toggle checked={tone432} onChange={setTone432} label="432Hz calming tone" />
        </div>

        <p className="mt-6 text-sm text-ink-soft">
          We&apos;ll record while you read, just for you to hear later.
        </p>

        <Button onClick={handleBeginSetup} className="mt-4 w-full">
          {isJournal ? "Begin reflecting" : "Let's find your pace today"}
        </Button>

        {recorder.status === "error" && <p className="mt-4 text-sm text-mood-difficult">{recorder.error}</p>}
      </div>
    );
  }

  if (stage === "breathing") {
    return (
      <BreathingTransition
        subtext={isJournal ? "Let this be an honest, unhurried moment." : "Let's settle in before we begin."}
        onDone={handleBreathingDone}
      />
    );
  }

  if (stage === "recording") {
    return (
      <div className="fade-in relative w-full max-w-2xl">
        <div className="glow-orb" style={{ "--glow-color": "var(--color-sage-500)" } as React.CSSProperties} />
        <div className="absolute right-0 top-0 z-10 flex items-center gap-3">
          {!isJournal && userId && content.id !== PHRASE.id && (
            <BookmarkButton userId={userId} textBankId={content.id} />
          )}
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-1.5 text-sm text-ink-soft">
            <span className="ripple inline-block h-2 w-2 rounded-full bg-mood-difficult" />
            {isJournal ? "Recording" : "Time spent"}: {formatTime(elapsed)}
          </div>
        </div>

        <div className="relative z-10 mt-16 rounded-2xl px-6 py-10 text-center">
          {isJournal ? (
            <p className="mx-auto max-w-lg text-xl text-ink-soft">{JOURNAL_PROMPT}</p>
          ) : (
            <PhraseDisplay words={words} activeIndex={activeIndex} />
          )}
        </div>

        <div className="relative z-10 mt-10 flex flex-col items-center gap-6">
          <LiveWaveform stream={recorder.stream} />
          <button
            onClick={handleManualFinish}
            className="press rounded-full border border-white/15 bg-black/20 px-8 py-2.5 text-sm font-medium text-ink-soft hover:text-ink"
          >
            Finish
          </button>
        </div>
      </div>
    );
  }

  if (stage === "rating") {
    return (
      <>
        <SessionRatingScreen
          stats={[
            { label: "Duration", value: pendingRecording ? formatTime(Math.round(pendingRecording.durationSeconds)) : "—" },
            { label: "Words spoken", value: String(words.length) },
          ]}
          onSubmit={handleRatingSubmit}
          onSkip={handleSkipRating}
          submitting={false}
        />
        {saveError && <p className="mt-4 text-center text-sm text-mood-difficult">{saveError}</p>}
      </>
    );
  }

  if (stage === "saving") return <CalmLoader label="Saving your progress..." />;

  return (
    <div className="fade-in w-full max-w-sm text-center">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
        {noPressureMode || isJournal ? "Well done." : "That took courage."}
      </h2>
      <p className="mt-3 text-ink-soft">
        {isJournal
          ? "Thank you for showing up for yourself this week."
          : noPressureMode
            ? "See you next time."
            : "Every rep counts, even the hard ones."}
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Button onClick={() => router.push("/progress")} className="w-full">
          Listen back
        </Button>
        <Button variant="secondary" onClick={() => router.push("/home")} className="w-full">
          Back home
        </Button>
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<CalmLoader />}>
      <PracticeContent />
    </Suspense>
  );
}
