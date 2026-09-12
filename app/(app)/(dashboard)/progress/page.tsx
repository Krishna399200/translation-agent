import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProgressView from "@/components/progress/ProgressView";
import { fromPracticeSession, fromScenarioSession } from "@/lib/unifiedSessions";

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: sessions }, { data: scenarioSessions }] = await Promise.all([
    supabase
      .from("practice_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("scenario_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const practiceList = sessions ?? [];
  const scenarioList = scenarioSessions ?? [];
  const unified = [
    ...practiceList.map(fromPracticeSession),
    ...scenarioList.map(fromScenarioSession),
  ];

  let signedUrls: Record<string, string> = {};
  const allAudioPaths = unified.map((s) => s.audio_url);
  if (allAudioPaths.length > 0) {
    const { data } = await supabase.storage.from("recordings").createSignedUrls(allAudioPaths, 3600);
    signedUrls = Object.fromEntries((data ?? []).map((d) => [d.path, d.signedUrl]));
  }

  return (
    <div className="fade-in mx-auto w-full max-w-4xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
        Speech Progress Analytics
      </h1>
      <p className="mt-1 text-sm text-ink-soft">Insights across everything you&apos;ve practiced.</p>

      <ProgressView sessions={unified} practiceSessions={practiceList} signedUrls={signedUrls} />
    </div>
  );
}
