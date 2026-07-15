"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAudioRecorder } from "@/lib/useAudioRecorder";
import { usePhraseHighlighter } from "@/lib/usePhraseHighlighter";
import { useSessionSave } from "@/lib/useSessionSave";
import { useSettings } from "@/lib/settings/SettingsContext";
import { useElapsedSeconds, formatTime } from "@/lib/useElapsedSeconds";
import { VARNAMALA_LEVELS } from "@/lib/varnamala";
import CalmLoader from "@/components/CalmLoader";
import Toggle from "@/components/Toggle";
import SelectCard from "@/components/practice/SelectCard";
import BreathingTransition from "@/components/practice/BreathingTransition";
import LiveWaveform from "@/components/practice/LiveWaveform";
import AksharaDisplay from "@/components/practice/AksharaDisplay";
import SessionRatingScreen from "@/components/practice/SessionRatingScreen";
import CompletionScreen from "@/components/practice/CompletionScreen";

type Stage = "loading" | "levels" | "breathing" | "practicing" | "saving" | "done" | "rating" | "rated";

export default function SoundFoundationsPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [levelKey, setLevelKey] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");

  const { tone432, setTone432, noPressureMode } = useSettings();
  const recorder = useAudioRecorder();
  const elapsed = useElapsedSeconds(stage === "practicing");
  const { save, updateRating } = useSessionSave(userId ?? "");

  const level = VARNAMALA_LEVELS.find((l) => l.key === levelKey) ?? VARNAMALA_LEVELS[0];

  async function finishPracticing(result: { blob: Blob; durationSeconds: number }) {
    if (!userId) return;
    setStage("saving");
    setSaveError("");

    const { error, sessionId: newId } = await save({
      blob: result.blob,
      durationSeconds: result.durationSeconds,
      practiceType: "varnamala",
      contentRef: level.key,
      selfRating: null,
    });

    if (error) {
      setSaveError(error);
      setStage("practicing");
      return;
    }

    setSessionId(newId);
    setStage("done");
  }

  const activeIndex = usePhraseHighlighter(level.aksharas.length, "slow", stage === "practicing", async () => {
    const result = await recorder.stop();
    await finishPracticing(result);
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
      setStage("levels");
    })();
  }, [router]);

  function handleSelect(key: string) {
    setLevelKey(key);
    setStage("breathing");
  }

  function handleReplay() {
    setStage("breathing");
  }

  async function handleBreathingDone() {
    const started = await recorder.start();
    if (started) setStage("practicing");
    else setStage("levels");
  }

  async function handleRatingSubmit(rating: number) {
    if (!sessionId) return;
    const { error } = await updateRating(sessionId, rating);
    if (error) {
      setSaveError(error);
      return;
    }
    setStage("rated");
  }

  if (stage === "loading") return <CalmLoader />;

  if (stage === "levels") {
    return (
      <div className="fade-in w-full max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-300">Sound Foundations</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
          Before words, there are sounds. Let&apos;s start there.
        </h1>

        <div className="mt-8 flex flex-col gap-3">
          {VARNAMALA_LEVELS.map((l) => (
            <SelectCard key={l.key} title={l.title} subtitle={l.description} onClick={() => handleSelect(l.key)} />
          ))}
        </div>

        <div className="frosted-card mt-6 flex items-center justify-between rounded-xl px-4 py-3">
          <Toggle checked={tone432} onChange={setTone432} label="432Hz calming tone" />
        </div>
      </div>
    );
  }

  if (stage === "breathing") {
    return <BreathingTransition subtext="Let each sound settle before the next." onDone={handleBreathingDone} />;
  }

  if (stage === "practicing") {
    return (
      <div className="fade-in relative w-full max-w-2xl">
        <div className="glow-orb" style={{ "--glow-color": "var(--color-blue-500)" } as React.CSSProperties} />
        <div className="absolute right-0 top-0 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-1.5 text-sm text-ink-soft">
          <span className="ripple inline-block h-2 w-2 rounded-full bg-mood-difficult" />
          Time spent: {formatTime(elapsed)}
        </div>

        <div className="relative z-10 mt-16 py-6 text-center">
          <AksharaDisplay aksharas={level.aksharas} activeIndex={activeIndex} />
        </div>

        <div className="relative z-10 mt-10 flex flex-col items-center gap-6">
          <LiveWaveform stream={recorder.stream} />
        </div>
      </div>
    );
  }

  if (stage === "saving") return <CalmLoader label="Saving your progress..." />;

  if (stage === "done") {
    return (
      <>
        <CompletionScreen
          onReplay={handleReplay}
          onRate={!noPressureMode ? () => setStage("rating") : undefined}
          noPressureMode={noPressureMode}
        />
        {saveError && <p className="mt-4 text-center text-sm text-mood-difficult">{saveError}</p>}
      </>
    );
  }

  if (stage === "rating") {
    return (
      <>
        <SessionRatingScreen
          stats={[{ label: "Sounds practiced", value: String(level.aksharas.length) }]}
          onSubmit={handleRatingSubmit}
          onSkip={() => setStage("done")}
          submitting={false}
          skipLabel="Never mind"
        />
        {saveError && <p className="mt-4 text-center text-sm text-mood-difficult">{saveError}</p>}
      </>
    );
  }

  if (stage === "rated") {
    return <CompletionScreen onReplay={handleReplay} noPressureMode={false} />;
  }

  return <CalmLoader />;
}
