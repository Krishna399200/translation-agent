"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAudioRecorder } from "@/lib/useAudioRecorder";
import { usePhraseHighlighter } from "@/lib/usePhraseHighlighter";
import { useSessionSave } from "@/lib/useSessionSave";
import { useSettings } from "@/lib/settings/SettingsContext";
import { useElapsedSeconds, formatTime } from "@/lib/useElapsedSeconds";
import { MANTRAS } from "@/lib/mantras";
import CalmLoader from "@/components/CalmLoader";
import Button from "@/components/Button";
import Toggle from "@/components/Toggle";
import SelectCard from "@/components/practice/SelectCard";
import BreathingTransition from "@/components/practice/BreathingTransition";
import LiveWaveform from "@/components/practice/LiveWaveform";
import SessionRatingScreen from "@/components/practice/SessionRatingScreen";

type Stage = "loading" | "select" | "breathing" | "looping" | "rating" | "saving" | "done";

export default function MantraPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [mantraKey, setMantraKey] = useState<string | null>(null);
  const [pendingRecording, setPendingRecording] = useState<{ blob: Blob; durationSeconds: number } | null>(null);
  const [saveError, setSaveError] = useState("");

  const { tone432, setTone432, noPressureMode } = useSettings();
  const recorder = useAudioRecorder();
  const elapsed = useElapsedSeconds(stage === "looping");
  const save = useSessionSave(userId ?? "");

  const mantra = MANTRAS.find((m) => m.key === mantraKey) ?? MANTRAS[0];
  const words = mantra.transliteration.split(" ");
  const activeIndex = usePhraseHighlighter(words.length, "slow", stage === "looping", () => {}, true);

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
      setStage("select");
    })();
  }, [router]);

  function handleSelect(key: string) {
    setMantraKey(key);
    setStage("breathing");
  }

  async function handleBreathingDone() {
    const started = await recorder.start();
    if (started) setStage("looping");
    else setStage("select");
  }

  async function handleFinish() {
    const result = await recorder.stop();
    setPendingRecording(result);
    if (noPressureMode) {
      await persist(result, null);
    } else {
      setStage("rating");
    }
  }

  async function persist(result: { blob: Blob; durationSeconds: number }, rating: number | null) {
    if (!userId) return;
    setStage("saving");
    setSaveError("");

    const { error } = await save({
      blob: result.blob,
      durationSeconds: result.durationSeconds,
      practiceType: "mantra",
      contentRef: mantra.key,
      selfRating: rating,
    });

    if (error) {
      setSaveError(error);
      setStage(noPressureMode ? "looping" : "rating");
      return;
    }

    setStage("done");
  }

  if (stage === "loading") return <CalmLoader />;

  if (stage === "select") {
    return (
      <div className="fade-in w-full max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-300">Mantra</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
          Let the rhythm carry your voice today.
        </h1>

        <div className="mt-8 flex flex-col gap-3">
          {MANTRAS.map((m) => (
            <SelectCard key={m.key} title={m.name} subtitle={m.devanagari} onClick={() => handleSelect(m.key)} />
          ))}
        </div>

        <div className="frosted-card mt-6 flex items-center justify-between rounded-xl px-4 py-3">
          <Toggle checked={tone432} onChange={setTone432} label="432Hz calming tone" />
        </div>
      </div>
    );
  }

  if (stage === "breathing") {
    return <BreathingTransition subtext="Let the rhythm carry you before we begin." onDone={handleBreathingDone} />;
  }

  if (stage === "looping") {
    return (
      <div className="fade-in relative w-full max-w-2xl">
        <div className="glow-orb" style={{ "--glow-color": "var(--color-lavender-500)" } as React.CSSProperties} />
        <div className="absolute right-0 top-0 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-1.5 text-sm text-ink-soft">
          <span className="ripple inline-block h-2 w-2 rounded-full bg-mood-difficult" />
          Time spent: {formatTime(elapsed)}
        </div>

        <div className="relative z-10 mt-16 rounded-2xl px-6 py-10 text-center">
          <p className="mb-4 text-3xl text-ink">{mantra.devanagari}</p>
          <p className="text-lg leading-relaxed">
            {words.map((word, i) => (
              <span key={i} className={i === activeIndex ? "px-1 text-ink" : "px-1 text-ink-faint"}>
                {word}{" "}
              </span>
            ))}
          </p>
        </div>

        <div className="relative z-10 mt-10 flex flex-col items-center gap-6">
          <LiveWaveform stream={recorder.stream} />
          <button
            onClick={handleFinish}
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
            { label: "Mantra", value: mantra.name },
          ]}
          onSubmit={(rating) => pendingRecording && persist(pendingRecording, rating)}
          onSkip={() => pendingRecording && persist(pendingRecording, null)}
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
        {noPressureMode ? "Well done." : "That took courage."}
      </h2>
      <p className="mt-3 text-ink-soft">{noPressureMode ? "See you next time." : "Every rep counts, even the hard ones."}</p>
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
