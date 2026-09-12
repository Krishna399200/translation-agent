import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProgressView from "@/components/progress/ProgressView";

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: sessions } = await supabase
    .from("practice_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const list = sessions ?? [];

  let signedUrls: Record<string, string> = {};
  if (list.length > 0) {
    const { data } = await supabase.storage
      .from("recordings")
      .createSignedUrls(list.map((s) => s.audio_url), 3600);
    signedUrls = Object.fromEntries((data ?? []).map((d) => [d.path, d.signedUrl]));
  }

  return (
    <div className="fade-in mx-auto w-full max-w-4xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
        Speech Progress Analytics
      </h1>
      <p className="mt-1 text-sm text-ink-soft">Insights across everything you&apos;ve practiced.</p>

      <ProgressView sessions={list} signedUrls={signedUrls} />
    </div>
  );
}
