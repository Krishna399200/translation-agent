import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MentorView from "@/components/mentor/MentorView";

export default async function MentorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("mentor_name, mentor_onboarded_at")
    .eq("id", user.id)
    .maybeSingle();

  const { data: reflections } = await supabase
    .from("mentor_reflections")
    .select("*")
    .eq("user_id", user.id)
    .eq("flagged_for_safety", false)
    .not("reflection_text", "is", null)
    .order("created_at", { ascending: false });

  return (
    <MentorView
      userId={user.id}
      initialMentorName={profile?.mentor_name ?? "Kai"}
      initialOnboardedAt={profile?.mentor_onboarded_at ?? null}
      reflections={reflections ?? []}
    />
  );
}
