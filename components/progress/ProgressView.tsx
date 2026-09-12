"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import WaveformPlayer from "@/components/progress/WaveformPlayer";
import DeleteRecordingButton from "@/components/progress/DeleteRecordingButton";
import TrendChart from "@/components/progress/TrendChart";
import WeeklyHeatmap from "@/components/progress/WeeklyHeatmap";
import BadgeCard from "@/components/progress/BadgeCard";
import TypeFilterTabs, { type TypeFilter } from "@/components/progress/TypeFilterTabs";
import { computeBadges } from "@/lib/badges";
import { describeSession } from "@/lib/describeSession";
import type { PracticeSession } from "@/lib/database.types";

export default function ProgressView({
  sessions,
  signedUrls,
}: {
  sessions: PracticeSession[];
  signedUrls: Record<string, string>;
}) {
  const [filter, setFilter] = useState<TypeFilter>("all");

  const filtered = useMemo(
    () => (filter === "all" ? sessions : sessions.filter((s) => s.practice_type === filter)),
    [sessions, filter]
  );

  const chronological = [...filtered].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const mostRecentFirst = [...chronological].reverse();
  const first = chronological[0];
  const latest = chronological[chronological.length - 1];
  const hasComparison = chronological.length >= 2;

  const trendPoints = chronological
    .filter((s): s is PracticeSession & { self_rating: number } => s.self_rating !== null)
    .map((s) => ({ date: s.created_at, rating: s.self_rating }));

  const journalEntries = sessions.filter((s) => s.practice_type === "journal");
  const recordingsList = mostRecentFirst.filter((s) => s.practice_type !== "journal");

  const badges = useMemo(() => computeBadges(sessions), [sessions]);

  if (sessions.length === 0) {
    return (
      <div className="frosted-card mt-8 rounded-2xl px-6 py-10 text-center">
        <p className="text-ink-soft">
          Nothing here yet. Your first recording will be the start of something you can look back
          on.
        </p>
        <Link href="/practice" className="press btn-glow mt-6 inline-block rounded-full px-6 py-3 font-semibold">
          Start today&apos;s practice
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      <TypeFilterTabs value={filter} onChange={setFilter} />

      {hasComparison && (
        <section className="frosted-card rounded-2xl px-6 py-6">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">Then vs. now</h2>
          <p className="mt-1 text-sm text-ink-soft">Listen to how far you&apos;ve come.</p>
          <div className="mt-5 flex flex-col gap-4">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">
                {new Date(first.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </p>
              {signedUrls[first.audio_url] && <WaveformPlayer url={signedUrls[first.audio_url]} compact />}
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">
                {new Date(latest.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}{" "}
                · most recent
              </p>
              {signedUrls[latest.audio_url] && <WaveformPlayer url={signedUrls[latest.audio_url]} compact />}
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="frosted-card rounded-2xl px-6 py-6">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">How it&apos;s felt over time</h2>
          <div className="mt-4">
            <TrendChart points={trendPoints} />
          </div>
        </section>

        <section className="frosted-card rounded-2xl px-6 py-6">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">Weekly Activity</h2>
          <div className="mt-4">
            <WeeklyHeatmap timestamps={filtered.map((s) => s.created_at)} />
          </div>
        </section>
      </div>

      {badges.length > 0 && (
        <section>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">Recent Achievements</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {badges.map((badge) => (
              <BadgeCard key={badge.key} badge={badge} />
            ))}
          </div>
        </section>
      )}

      {journalEntries.length > 0 && (
        <section>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">Weekly Voice Journal</h2>
          <p className="mt-1 text-sm text-ink-soft">Unscored, honest check-ins with yourself.</p>
          <ul className="mt-3 flex flex-col gap-3">
            {journalEntries.map((s) => (
              <li key={s.id} className="frosted-card rounded-xl px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-ink">
                    {new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <DeleteRecordingButton sessionId={s.id} audioPath={s.audio_url} />
                </div>
                {signedUrls[s.audio_url] && (
                  <div className="mt-3">
                    <WaveformPlayer url={signedUrls[s.audio_url]} compact />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">Every recording</h2>
        <p className="mt-1 text-sm text-ink-soft">That&apos;s not just a recording — that&apos;s proof.</p>

        <ul className="mt-5 flex flex-col gap-3">
          {recordingsList.map((s) => (
            <li key={s.id} className="frosted-card rounded-xl px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <p className="text-xs text-ink-faint">{describeSession(s)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {s.self_rating !== null && (
                    <span className="rounded-full bg-sand-100 px-2 py-0.5 text-xs font-semibold text-gold-300">
                      Felt {s.self_rating}/5
                    </span>
                  )}
                  <DeleteRecordingButton sessionId={s.id} audioPath={s.audio_url} />
                </div>
              </div>
              {signedUrls[s.audio_url] && (
                <div className="mt-3">
                  <WaveformPlayer url={signedUrls[s.audio_url]} compact />
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
