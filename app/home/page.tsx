import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeStreak, practicedToday } from "@/lib/streak";
import PlantStreak from "@/components/PlantStreak";
import SignOutButton from "@/components/SignOutButton";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function streakCopy(streak: number, didToday: boolean) {
  if (streak === 0) {
    return "Yesterday's silence doesn't erase today's voice. Let's begin again.";
  }
  if (didToday) {
    return `You've shown up ${streak} day${streak === 1 ? "" : "s"} running. That's not luck — that's practice.`;
  }
  return `${streak} day${streak === 1 ? "" : "s"} strong. Your voice is waiting for today's rep.`;
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/onboarding");

  const { data: sessions } = await supabase
    .from("practice_sessions")
    .select("created_at")
    .eq("user_id", user.id);

  const timestamps = (sessions ?? []).map((s) => s.created_at);
  const streak = computeStreak(timestamps);
  const didToday = practicedToday(timestamps);

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="fade-in flex w-full max-w-sm flex-col items-center gap-10">
        <div className="flex w-full items-center justify-between">
          <span className="font-[family-name:var(--font-display)] text-lg font-bold text-teal-700">
            Fluent
          </span>
          <SignOutButton />
        </div>

        <div className="text-center">
          <p className="text-ink-soft">
            {greeting()}, {profile.name}.
          </p>
          <p className="mt-2 text-lg text-ink">{streakCopy(streak, didToday)}</p>
        </div>

        <PlantStreak streak={streak} />

        <Link
          href="/practice"
          className="press w-full rounded-full bg-teal-500 px-6 py-4 text-center font-semibold text-cream shadow-soft hover:bg-teal-600"
        >
          {didToday ? "Practice again" : "Let's find your pace today"}
        </Link>

        <Link href="/progress" className="text-sm font-medium text-teal-600 hover:underline">
          Listen back to your progress →
        </Link>
      </div>
    </main>
  );
}
