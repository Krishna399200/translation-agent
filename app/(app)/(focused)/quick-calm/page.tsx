"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { QUICK_CALM_EXERCISES, getExercise, type QuickCalmDefinition } from "@/lib/quickCalm";
import { useQuickCalmPlayer } from "@/lib/useQuickCalmPlayer";
import type { QuickCalmExercise, TextBankEntry } from "@/lib/database.types";
import CalmLoader from "@/components/CalmLoader";
import Button from "@/components/Button";
import Toggle from "@/components/Toggle";
import SelectCard from "@/components/practice/SelectCard";
import PhraseDisplay from "@/components/practice/PhraseDisplay";
import Avatar from "@/components/quickcalm/Avatar";
import BreathingVisual from "@/components/quickcalm/BreathingVisual";
import CheckinForm from "@/components/quickcalm/CheckinForm";

type Stage =
  | "loading"
  | "hub"
  | "exercise"
  | "exercise-done"
  | "checkin"
  | "checkin-done"
  | "affirmations"
  | "affirmation-view";

type SavedAffirmationRow = { id: string; text_bank: TextBankEntry };

function QuickCalmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stage, setStage] = useState<Stage>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [exercise, setExercise] = useState<QuickCalmDefinition | null>(null);
  const [affirmations, setAffirmations] = useState<SavedAffirmationRow[]>([]);
  const [viewingAffirmation, setViewingAffirmation] = useState<TextBankEntry | null>(null);
  const [checkinSubmitting, setCheckinSubmitting] = useState(false);

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
      if (searchParams.get("view") === "affirmations") {
        await loadAffirmations(user.id);
      } else {
        setStage("hub");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const { step } = useQuickCalmPlayer(exercise?.steps ?? [], soundOn, () => {
    if (exercise && userId) {
      const supabase = createClient();
      void supabase.from("quick_calm_sessions").insert({
        user_id: userId,
        exercise_type: exercise.key,
      });
    }
    setStage("exercise-done");
  });

  function startExercise(key: QuickCalmExercise) {
    setExercise(getExercise(key));
    setStage("exercise");
  }

  async function loadAffirmations(uid?: string) {
    const targetId = uid ?? userId;
    if (!targetId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("user_saved_affirmations")
      .select("id, text_bank:text_bank_id(*)")
      .eq("user_id", targetId)
      .order("saved_at", { ascending: false });
    setAffirmations((data ?? []) as unknown as SavedAffirmationRow[]);
    setStage("affirmations");
  }

  async function handleCheckinSubmit(sentiment: number, note: string) {
    if (!userId) return;
    setCheckinSubmitting(true);
    const supabase = createClient();
    await supabase.from("moment_checkins").insert({
      user_id: userId,
      sentiment,
      note: note || null,
    });
    setCheckinSubmitting(false);
    setStage("checkin-done");
  }

  if (stage === "loading") return <CalmLoader />;

  if (stage === "hub") {
    return (
      <div className="fade-in w-full max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-300">Need a moment?</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
          Whatever you need right now, it&apos;s here.
        </h1>

        <div className="mt-8 flex flex-col gap-3">
          {QUICK_CALM_EXERCISES.map((ex) => (
            <SelectCard
              key={ex.key}
              title={ex.title}
              subtitle={`${ex.durationLabel} · ${ex.tagline}`}
              onClick={() => startExercise(ex.key)}
            />
          ))}
          <SelectCard title="That was hard" subtitle="A quick, private check-in — no recording" onClick={() => setStage("checkin")} accent="var(--color-mood-difficult)" />
          <SelectCard title="My Affirmations" subtitle="Lines you've saved to return to" onClick={() => loadAffirmations()} accent="var(--color-lavender-300)" />
        </div>
      </div>
    );
  }

  if (stage === "exercise" && exercise && step) {
    return (
      <div className="fade-in flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-2 flex w-full items-center justify-between">
          <span className="text-sm text-ink-faint">{exercise.title}</span>
          <Toggle checked={soundOn} onChange={setSoundOn} label="Sound" />
        </div>

        <Avatar />

        <div className="mt-4">
          <BreathingVisual visual={exercise.visual} step={step} />
        </div>

        <p key={step.text} className="fade-in mt-8 min-h-16 text-lg text-ink">
          {step.text}
        </p>
      </div>
    );
  }

  if (stage === "exercise-done" && exercise) {
    return (
      <div className="fade-in w-full max-w-sm text-center">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
          Feel a little steadier?
        </h2>
        <p className="mt-3 text-ink-soft">You can return to this anytime.</p>

        <div className="mt-8 flex flex-col gap-3">
          {exercise.key === "third_eye_awareness" && (
            <Button variant="secondary" onClick={() => setStage("checkin")} className="w-full">
              Want to note what happened?
            </Button>
          )}
          <Button onClick={() => setStage("hub")} className="w-full">
            Close
          </Button>
          <Button variant="ghost" onClick={() => router.push("/home")} className="w-full">
            Back home
          </Button>
        </div>
      </div>
    );
  }

  if (stage === "checkin") {
    return <CheckinForm onSubmit={handleCheckinSubmit} submitting={checkinSubmitting} />;
  }

  if (stage === "checkin-done") {
    return (
      <div className="fade-in w-full max-w-sm text-center">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">Noted.</h2>
        <p className="mt-3 text-ink-soft">That took something to acknowledge. Be gentle with yourself.</p>
        <div className="mt-8 flex flex-col gap-3">
          <Button onClick={() => setStage("hub")} className="w-full">
            Close
          </Button>
          <Button variant="ghost" onClick={() => router.push("/home")} className="w-full">
            Back home
          </Button>
        </div>
      </div>
    );
  }

  if (stage === "affirmations") {
    return (
      <div className="fade-in w-full max-w-md text-center">
        <button onClick={() => setStage("hub")} className="mb-4 text-sm text-teal-300">
          ← Back
        </button>
        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">My Affirmations</h1>
        <p className="mt-1 text-sm text-ink-soft">Lines you&apos;ve saved from practice, ready whenever you need them.</p>

        {affirmations.length === 0 ? (
          <p className="mt-8 text-sm text-ink-faint">
            Nothing saved yet. Tap the bookmark on a line during Reading Practice to keep it here.
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {affirmations.map((a) => (
              <SelectCard
                key={a.id}
                title={a.text_bank.content}
                onClick={() => {
                  setViewingAffirmation(a.text_bank);
                  setStage("affirmation-view");
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (stage === "affirmation-view" && viewingAffirmation) {
    return (
      <div className="fade-in w-full max-w-md text-center">
        <button onClick={() => setStage("affirmations")} className="mb-6 text-sm text-teal-300">
          ← My Affirmations
        </button>
        <div className="frosted-card rounded-2xl px-6 py-10">
          <PhraseDisplay words={viewingAffirmation.content.split(" ")} activeIndex={-1} />
        </div>
      </div>
    );
  }

  return <CalmLoader />;
}

export default function QuickCalmPage() {
  return (
    <Suspense fallback={<CalmLoader />}>
      <QuickCalmContent />
    </Suspense>
  );
}
