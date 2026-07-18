"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MentorIcon } from "@/components/nav/icons";
import MentorIntro from "@/components/mentor/MentorIntro";
import MentorNaming from "@/components/mentor/MentorNaming";
import CalmLoader from "@/components/CalmLoader";
import type { MentorReflection } from "@/lib/database.types";

const PRACTICE_TYPE_LABELS: Record<string, string> = {
  reading_text: "Reading practice",
  mantra: "Mantra",
  varnamala: "Sound Foundations",
  trigger_words: "Words That Challenge Me",
  journal: "Weekly voice journal",
  moment_checkin: "That was hard — check-in",
};

function describeReflection(r: Pick<MentorReflection, "practice_type">) {
  if (!r.practice_type) return "Practice session";
  return PRACTICE_TYPE_LABELS[r.practice_type] ?? r.practice_type;
}

type Stage = "intro" | "naming" | "about" | "feed";

function MentorContent({
  userId,
  initialMentorName,
  initialOnboardedAt,
  reflections,
}: {
  userId: string;
  initialMentorName: string;
  initialOnboardedAt: string | null;
  reflections: MentorReflection[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAboutView = searchParams.get("view") === "about";

  const [mentorName, setMentorName] = useState(initialMentorName);
  const [onboardedAt, setOnboardedAt] = useState(initialOnboardedAt);
  const [stage, setStage] = useState<Stage>(isAboutView ? "about" : onboardedAt ? "feed" : "intro");
  const [saving, setSaving] = useState(false);

  async function completeOnboarding(name: string) {
    setSaving(true);
    const supabase = createClient();
    const now = new Date().toISOString();
    await supabase
      .from("profiles")
      .update({ mentor_name: name, mentor_onboarded_at: now })
      .eq("id", userId);
    setMentorName(name);
    setOnboardedAt(now);
    setSaving(false);
    setStage("feed");
  }

  async function skipOnboarding() {
    setSaving(true);
    const supabase = createClient();
    const now = new Date().toISOString();
    await supabase.from("profiles").update({ mentor_onboarded_at: now }).eq("id", userId);
    setOnboardedAt(now);
    setSaving(false);
    router.push("/home");
  }

  function closeAbout() {
    router.replace("/mentor");
    setStage(onboardedAt ? "feed" : "intro");
  }

  if (stage === "about") {
    return (
      <div className="fade-in mx-auto w-full max-w-md">
        <button onClick={closeAbout} className="mb-4 text-sm text-teal-300">
          ← Back
        </button>
        <MentorIntro onContinue={closeAbout} />
      </div>
    );
  }

  if (stage === "intro") {
    return <MentorIntro onContinue={() => setStage("naming")} onSkip={skipOnboarding} />;
  }

  if (stage === "naming") {
    return <MentorNaming onDone={completeOnboarding} saving={saving} />;
  }

  return (
    <div className="fade-in mx-auto w-full max-w-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">{mentorName}</h1>
          <p className="mt-1 text-sm text-ink-soft">Reflections your companion has left after sessions.</p>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-teal-500/10 text-teal-300">
          <MentorIcon />
        </div>
      </div>

      <button
        onClick={() => router.push("/mentor?view=about")}
        className="press mt-4 text-sm text-teal-300 underline decoration-dotted underline-offset-4"
      >
        About your companion
      </button>

      {reflections.length === 0 ? (
        <div className="frosted-card mt-6 rounded-2xl px-6 py-10 text-center">
          <p className="text-sm text-ink-soft">
            Nothing here yet. After you save a practice session, {mentorName} will leave a note
            here — a small, honest reflection, never a score.
          </p>
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {reflections.map((r) => (
            <li key={r.id} className="frosted-card rounded-xl px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink">
                  {new Date(r.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <span className="text-xs text-ink-faint">{describeReflection(r)}</span>
              </div>
              {r.reflection_text && <p className="mt-2 text-sm text-ink-soft">{r.reflection_text}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MentorView(props: {
  userId: string;
  initialMentorName: string;
  initialOnboardedAt: string | null;
  reflections: MentorReflection[];
}) {
  return (
    <Suspense fallback={<CalmLoader />}>
      <MentorContent {...props} />
    </Suspense>
  );
}
