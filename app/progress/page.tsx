import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WaveformPlayer from "@/components/progress/WaveformPlayer";
import DeleteRecordingButton from "@/components/progress/DeleteRecordingButton";
import TrendChart from "@/components/progress/TrendChart";

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: sessions } = await supabase
    .from("practice_sessions")
    .select("id, created_at, audio_url, self_rating, duration_seconds")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const list = sessions ?? [];

  let signedUrls: Record<string, string> = {};
  if (list.length > 0) {
    const { data } = await supabase.storage
      .from("recordings")
      .createSignedUrls(list.map((s) => s.audio_url), 3600);
    signedUrls = Object.fromEntries((data ?? []).map((d) => [d.path, d.signedUrl]));
  }

  const chronological = [...list];
  const mostRecentFirst = [...list].reverse();
  const first = chronological[0];
  const latest = chronological[chronological.length - 1];
  const hasComparison = chronological.length >= 2;

  const trendPoints = chronological.map((s) => ({ date: s.created_at, rating: s.self_rating }));

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="fade-in w-full max-w-xl">
        <div className="flex items-center justify-between">
          <Link href="/home" className="text-sm text-teal-600 hover:underline">
            ← Home
          </Link>
          <h1 className="font-[family-name:var(--font-display)] text-lg font-bold text-teal-700">
            Your progress
          </h1>
          <span className="w-10" />
        </div>

        {list.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-teal-100 bg-card px-6 py-10 text-center shadow-soft">
            <p className="text-ink-soft">
              Nothing here yet. Your first recording will be the start of something you can
              look back on.
            </p>
            <Link
              href="/practice"
              className="press mt-6 inline-block rounded-full bg-teal-500 px-6 py-3 font-semibold text-cream"
            >
              Start today&apos;s practice
            </Link>
          </div>
        ) : (
          <>
            {hasComparison && (
              <section className="mt-8 rounded-2xl border border-lavender-300 bg-card px-6 py-6 shadow-soft">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">
                  Then vs. now
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  Listen to how far you&apos;ve come.
                </p>
                <div className="mt-5 flex flex-col gap-4">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">
                      {new Date(first.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    {signedUrls[first.audio_url] && (
                      <WaveformPlayer url={signedUrls[first.audio_url]} compact />
                    )}
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">
                      {new Date(latest.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      · most recent
                    </p>
                    {signedUrls[latest.audio_url] && (
                      <WaveformPlayer url={signedUrls[latest.audio_url]} compact />
                    )}
                  </div>
                </div>
              </section>
            )}

            <section className="mt-8 rounded-2xl border border-teal-100 bg-card px-6 py-6 shadow-soft">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">
                How it&apos;s felt over time
              </h2>
              <div className="mt-4">
                <TrendChart points={trendPoints} />
              </div>
            </section>

            <section className="mt-8">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">
                Every recording
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                That&apos;s not just a recording — that&apos;s proof.
              </p>

              <ul className="mt-5 flex flex-col gap-3">
                {mostRecentFirst.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-xl border border-teal-100 bg-card px-4 py-4 shadow-soft"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-ink">
                        {new Date(s.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-sand-100 px-2 py-0.5 text-xs font-semibold text-teal-700">
                          Felt {s.self_rating}/5
                        </span>
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
          </>
        )}
      </div>
    </main>
  );
}
