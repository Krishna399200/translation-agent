"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAudioRecorder } from "@/lib/useAudioRecorder";
import { usePhraseHighlighter } from "@/lib/usePhraseHighlighter";
import { useScenarioSave } from "@/lib/useScenarioSave";
import { useSettings } from "@/lib/settings/SettingsContext";
import { useElapsedSeconds, formatTime } from "@/lib/useElapsedSeconds";
import { useAmbientNoise } from "@/lib/useAmbientNoise";
import { pickScenarioPassage, type ScenarioType } from "@/lib/textBank";
import { SCENARIOS, getScenario } from "@/lib/scenarios";
import { PHRASE } from "@/lib/phrase";
import CalmLoader from "@/components/CalmLoader";
import Toggle from "@/components/Toggle";
import SelectCard from "@/components/practice/SelectCard";
import BreathingTransition from "@/components/practice/BreathingTransition";
import LiveWaveform from "@/components/practice/LiveWaveform";
import PhraseDisplay from "@/components/practice/PhraseDisplay";
import SessionRatingScreen from "@/components/practice/SessionRatingScreen";
import CompletionScreen from "@/components/practice/CompletionScreen";
import SceneBackground from "@/components/scenario/SceneBackground";

type Stage = "loading" | "select" | "breathing" | "practicing" | "saving" | "done" | "rating" | "rated";

export default function ScenariosPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [scenarioType, setScenarioType] = useState<ScenarioType>("interview");
  const [content, setContent] = useState<{ id: string; text: string }>({ id: PHRASE.id, text: PHRASE.text });
  const [ambientOn, setAmbientOn] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");

  const { tone432, setTone432, noPressureMode } = useSettings();
  const recorder = useAudioRecorder();
  const elapsed = useElapsedSeconds(stage === "practicing");
  const { save, updateRating } = useScenarioSave(userId ?? "");
  const scenario = getScenario(scenarioType);

  useAmbientNoise(scenario.ambience, ambientOn && stage === "practicing");

  const words = content.text.split(" ");

  async function finishPracticing(result: { blob: Blob; durationSeconds: number }) {
    if (!userId) return;
    setStage("saving");
    setSaveError("");

    const { error, sessionId: newId } = await save({
      blob: result.blob,
      durationSeconds: result.durationSeconds,
      scenarioType,
      textBankId: content.id !== PHRASE.id ? content.id : null,
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

  const activeIndex = usePhraseHighlighter(words.length, "medium", stage === "practicing", async () => {
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

      const { data: custom } = await supabase.from("user_trigger_words").select("word").eq("user_id", user.id);
      setSavedWords((custom ?? []).map((c) => c.word));
      setStage("select");
    })();
  }, [router]);

  async function pickContentFor(type: ScenarioType) {
    if (!userId) return;
    const picked = await pickScenarioPassage(createClient(), userId, type, savedWords);
    setContent(picked);
  }

  async function handleSelect(type: ScenarioType) {
    setScenarioType(type);
    await pickContentFor(type);
    setStage("breathing");
  }

  async function handleReplay() {
    await pickContentFor(scenarioType);
    setStage("breathing");
  }

  async function handleBreathingDone() {
    const started = await recorder.start();
    if (started) setStage("practicing");
    else setStage("select");
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

  if (stage === "select") {
    return (
      <div className="fade-in w-full max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-300">Practice a Moment</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
          Step into a moment, gently, before it happens for real.
        </h1>

        <div className="mt-8 flex flex-col gap-3">
          {SCENARIOS.map((s) => (
            <SelectCard key={s.key} title={s.title} subtitle={s.description} onClick={() => handleSelect(s.key)} />
          ))}
        </div>

        <div className="frosted-card mt-6 flex items-center justify-between rounded-xl px-4 py-3">
          <Toggle checked={tone432} onChange={setTone432} label="432Hz calming tone" />
        </div>
      </div>
    );
  }

  if (stage === "breathing") {
    return <BreathingTransition subtext={scenario.breathingSubtext} onDone={handleBreathingDone} />;
  }

  if (stage === "practicing") {
    return (
      <div className="fade-in relative w-full max-w-2xl overflow-hidden rounded-2xl">
        <SceneBackground scenario={scenarioType} />

        <div className="relative z-10 flex items-center justify-between px-2 pt-2">
          <button
            onClick={() => setAmbientOn((v) => !v)}
            className={`press flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
              ambientOn ? "border-teal-500/40 text-teal-300" : "border-white/10 text-ink-faint"
            }`}
          >
            Ambience {ambientOn ? "on" : "off"}
          </button>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-1.5 text-sm text-ink-soft">
            <span className="ripple inline-block h-2 w-2 rounded-full bg-mood-difficult" />
            Time spent: {formatTime(elapsed)}
          </div>
        </div>

        <div className="relative z-10 mt-10 rounded-2xl px-6 py-10 text-center">
          <PhraseDisplay words={words} activeIndex={activeIndex} />
        </div>

        <div className="relative z-10 mt-10 flex flex-col items-center gap-6 pb-6">
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
          stats={[{ label: "Scenario", value: scenario.title }]}
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
