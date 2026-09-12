import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsProvider } from "@/lib/settings/SettingsContext";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("tone_432hz_enabled, no_pressure_mode, mentor_feedback_enabled, mentor_voice_enabled")
    .eq("id", user.id)
    .maybeSingle();

  // A real query error (e.g. a column from a migration that hasn't been run
  // yet) is not the same thing as "this user hasn't onboarded" — treating it
  // as the latter would bounce every signed-in user to /onboarding forever,
  // where they'd then hit a duplicate-key error since their profile already
  // exists. Fail loudly instead so a missing migration is obvious.
  if (profileError) {
    throw new Error(
      `Couldn't load your profile (${profileError.message}). This usually means a Supabase migration ` +
        "hasn't been run yet — check supabase/migration_010_mentor.sql (and every migration before it) " +
        "have been applied to this project."
    );
  }

  if (!profile) redirect("/onboarding");

  return (
    <SettingsProvider
      userId={user.id}
      initial={{
        tone432: profile.tone_432hz_enabled ?? false,
        noPressureMode: profile.no_pressure_mode ?? false,
        mentorFeedbackEnabled: profile.mentor_feedback_enabled ?? true,
        mentorVoiceEnabled: profile.mentor_voice_enabled ?? true,
      }}
    >
      {children}
    </SettingsProvider>
  );
}
