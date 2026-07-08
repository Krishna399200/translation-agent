import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsProvider } from "@/lib/settings/SettingsContext";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("tone_432hz_enabled, no_pressure_mode")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/onboarding");

  return (
    <SettingsProvider
      userId={user.id}
      initial={{
        tone432: profile.tone_432hz_enabled ?? false,
        noPressureMode: profile.no_pressure_mode ?? false,
      }}
    >
      {children}
    </SettingsProvider>
  );
}
