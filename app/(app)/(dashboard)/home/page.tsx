import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeStreak } from "@/lib/streak";
import PlantStreak from "@/components/PlantStreak";
import StartPracticeButton from "@/components/home/StartPracticeButton";
import NeedAMomentButton from "@/components/home/NeedAMomentButton";
import WeeklyJournalPrompt from "@/components/home/WeeklyJournalPrompt";
import DailyCheckinCard from "@/components/home/DailyCheckinCard";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function shouldShowJournalPrompt(lastPromptAt: string | null) {
  if (!lastPromptAt) return true;
  const daysSince = (Date.now() - new Date(lastPromptAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince >= 7;
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("name, last_journal_prompt_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Couldn't load your profile (${profileError.message}).`);
  }

  if (!profile) redirect("/onboarding");

  const { data: sessions } = await supabase
    .from("practice_sessions")
    .select("created_at, self_rating")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const list = sessions ?? [];
  const timestamps = list.map((s) => s.created_at);
  const streak = computeStreak(timestamps);
  const totalReps = list.length;
  const lastRated = list.find((s) => s.self_rating !== null);
  const lastFelt = lastRated ? `${lastRated.self_rating}/5` : "—";

  const today = new Date().toISOString().slice(0, 10);
  const { data: todaysCheckin } = await supabase
    .from("daily_checkins")
    .select("id")
    .eq("user_id", user.id)
    .eq("checkin_date", today)
    .maybeSingle();

  return (
    <div className="fade-in mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="frosted-card rounded-2xl p-8">
        <p className="text-sm text-ink-faint">{greeting()}</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink sm:text-3xl">
          Welcome back, <span className="text-teal-300">{profile.name}</span>.
        </h1>
        <p className="mt-1 text-ink-soft">
          {streak > 0
            ? `You're on a ${streak}-day streak. Keep the momentum going.`
            : "Yesterday's silence doesn't erase today's voice. Let's begin again."}
        </p>

        <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <PlantStreak streak={streak} />
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <NeedAMomentButton />
            <StartPracticeButton />
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-sm font-medium text-ink-soft">Quick Stats</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatTile label="Streak" value={`${streak} Day${streak === 1 ? "" : "s"}`} icon="streak" />
            <StatTile label="Total Reps" value={String(totalReps)} icon="reps" />
            <StatTile label="Last Felt" value={lastFelt} icon="heart" />
          </div>
        </div>

        {!todaysCheckin && (
          <div className="mt-6">
            <DailyCheckinCard userId={user.id} />
          </div>
        )}
      </div>

      {shouldShowJournalPrompt(profile.last_journal_prompt_at) && (
        <WeeklyJournalPrompt userId={user.id} />
      )}
    </div>
  );
}

function StatTile({ label, value, icon }: { label: string; value: string; icon: "streak" | "reps" | "heart" }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/15 px-4 py-3.5">
      <div>
        <p className="text-xs text-ink-faint">{label}:</p>
        <p className="text-lg font-semibold text-ink">{value}</p>
      </div>
      <StatIcon icon={icon} />
    </div>
  );
}

function StatIcon({ icon }: { icon: "streak" | "reps" | "heart" }) {
  if (icon === "streak") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-500)" strokeWidth="1.7" strokeLinecap="round">
        <path d="M12 21V10M12 10C12 6 9 3 4 3C4 8 7 11 12 10Z" />
      </svg>
    );
  }
  if (icon === "reps") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal-300)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 2l4 4-4 4M3 12v-2a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 12v2a4 4 0 0 1-4 4H3" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-lavender-300)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}
