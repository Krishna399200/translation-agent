"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAudioRecorder } from "@/lib/useAudioRecorder";
import { usePhraseHighlighter } from "@/lib/usePhraseHighlighter";
import { useSessionSave } from "@/lib/useSessionSave";
import { useSettings } from "@/lib/settings/SettingsContext";
import { useElapsedSeconds, formatTime } from "@/lib/useElapsedSeconds";
import { TRIGGER_CATEGORIES, graduatedPhrasesFor } from "@/lib/triggerWords";
import type { TriggerWord } from "@/lib/database.types";
import CalmLoader from "@/components/CalmLoader";
import Button from "@/components/Button";
import Toggle from "@/components/Toggle";
import SelectCard from "@/components/practice/SelectCard";
import BreathingTransition from "@/components/practice/BreathingTransition";
import LiveWaveform from "@/components/practice/LiveWaveform";
import TriggerWordDisplay from "@/components/practice/TriggerWordDisplay";
import SessionRatingScreen from "@/components/practice/SessionRatingScreen";

type Stage = "loading" | "categories" | "words" | "breathing" | "practicing" | "rating" | "saving" | "done";

type PracticeWord = {
  word: string;
  levels: [string, string, string];
};

export default function TriggerWordsPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [globalWords, setGlobalWords] = useState<TriggerWord[]>([]);
  const [customWords, setCustomWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState("");
  const [categoryKey, setCategoryKey] = useState<string | null>(null);
  const [activeWord, setActiveWord] = useState<PracticeWord | null>(null);
  const [pendingRecording, setPendingRecording] = useState<{ blob: Blob; durationSeconds: number } | null>(null);
  const [saveError, setSaveError] = useState("");

  const { tone432, setTone432, noPressureMode } = useSettings();
  const recorder = useAudioRecorder();
  const elapsed = useElapsedSeconds(stage === "practicing");
  const save = useSessionSave(userId ?? "");

  const groups = activeWord
    ? [
        { label: "Isolation", words: activeWord.levels[0].split(" ") },
        { label: "Short Phrase", words: activeWord.levels[1].split(" ") },
        { label: "Full Sentence", words: activeWord.levels[2].split(" ") },
      ]
    : [];
  const totalWords = groups.reduce((sum, g) => sum + g.words.length, 0);

  const activeIndex = usePhraseHighlighter(totalWords, "slow", stage === "practicing", async () => {
    const result = await recorder.stop();
    setPendingRecording(result);
    if (noPressureMode) {
      await persist(result, null);
    } else {
      setStage("rating");
    }
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

      const [{ data: words }, { data: custom }] = await Promise.all([
        supabase.from("trigger_words").select("*"),
        supabase.from("user_trigger_words").select("word").eq("user_id", user.id),
      ]);

      setGlobalWords(words ?? []);
      setCustomWords((custom ?? []).map((c) => c.word));
      setStage("categories");
    })();
  }, [router]);

  async function handleAddWord(e: FormEvent) {
    e.preventDefault();
    const word = newWord.trim();
    if (!word || !userId) return;

    const supabase = createClient();
    await supabase.from("user_trigger_words").insert({ user_id: userId, word });
    setCustomWords((prev) => [word, ...prev]);
    setNewWord("");
  }

  function openCategory(key: string) {
    setCategoryKey(key);
    setStage("words");
  }

  function selectWord(word: string, levels?: [string, string, string]) {
    const graduated = levels ?? Object.values(graduatedPhrasesFor(word)) as [string, string, string];
    setActiveWord({ word, levels: graduated });
    setStage("breathing");
  }

  async function handleBreathingDone() {
    const started = await recorder.start();
    if (started) setStage("practicing");
    else setStage("words");
  }

  async function persist(result: { blob: Blob; durationSeconds: number }, rating: number | null) {
    if (!userId || !activeWord) return;
    setStage("saving");
    setSaveError("");

    const { error } = await save({
      blob: result.blob,
      durationSeconds: result.durationSeconds,
      practiceType: "trigger_words",
      contentRef: activeWord.word,
      selfRating: rating,
    });

    if (error) {
      setSaveError(error);
      setStage(noPressureMode ? "practicing" : "rating");
      return;
    }

    setStage("done");
  }

  if (stage === "loading") return <CalmLoader />;

  if (stage === "categories") {
    return (
      <div className="fade-in w-full max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-300">Words That Challenge Me</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
          These words don&apos;t have power over you. Let&apos;s practice them, gently.
        </h1>

        <form onSubmit={handleAddWord} className="frosted-card mt-6 flex gap-2 rounded-full p-1.5">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="+ Add your own word"
            className="flex-1 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          <Button type="submit" className="px-4 py-2 text-sm" disabled={!newWord.trim()}>
            Add
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          {TRIGGER_CATEGORIES.map((cat) => {
            const count =
              cat.key === "my_words"
                ? customWords.length
                : globalWords.filter((w) => w.category === cat.key).length;
            return (
              <SelectCard
                key={cat.key}
                title={cat.label}
                subtitle={`${count} word${count === 1 ? "" : "s"}`}
                onClick={() => openCategory(cat.key)}
              />
            );
          })}
        </div>

        <div className="frosted-card mt-6 flex items-center justify-between rounded-xl px-4 py-3">
          <Toggle checked={tone432} onChange={setTone432} label="432Hz calming tone" />
        </div>
      </div>
    );
  }

  if (stage === "words") {
    const isCustom = categoryKey === "my_words";
    const words = isCustom
      ? customWords.map((w) => ({ word: w, levels: null as null }))
      : globalWords
          .filter((w) => w.category === categoryKey)
          .map((w) => ({ word: w.word, levels: [w.phrase_level_1, w.phrase_level_2, w.phrase_level_3] as [string, string, string] }));

    return (
      <div className="fade-in w-full max-w-md text-center">
        <button onClick={() => setStage("categories")} className="mb-4 text-sm text-teal-300">
          ← Categories
        </button>
        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">
          {TRIGGER_CATEGORIES.find((c) => c.key === categoryKey)?.label}
        </h1>

        {words.length === 0 ? (
          <p className="mt-6 text-sm text-ink-soft">No words here yet. Add one from the previous screen.</p>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {words.map((w) => (
              <SelectCard key={w.word} title={w.word} onClick={() => selectWord(w.word, w.levels ?? undefined)} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (stage === "breathing") {
    return <BreathingTransition subtext="These sounds don't need to be feared. Let's meet them gently." onDone={handleBreathingDone} />;
  }

  if (stage === "practicing") {
    return (
      <div className="fade-in relative w-full max-w-2xl">
        <div className="glow-orb" style={{ "--glow-color": "var(--color-gold-500)" } as React.CSSProperties} />
        <div className="absolute right-0 top-0 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-1.5 text-sm text-ink-soft">
          <span className="ripple inline-block h-2 w-2 rounded-full bg-mood-difficult" />
          Time spent: {formatTime(elapsed)}
        </div>

        <div className="relative z-10 mt-16 py-6">
          <TriggerWordDisplay groups={groups} activeIndex={activeIndex} />
        </div>

        <div className="relative z-10 mt-10 flex flex-col items-center gap-6">
          <LiveWaveform stream={recorder.stream} />
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
            { label: "Word practiced", value: activeWord?.word ?? "—" },
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
