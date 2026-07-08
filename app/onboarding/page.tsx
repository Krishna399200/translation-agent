"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/Button";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [confidence, setConfidence] = useState(5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Your session expired — please sign in again.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      name: name.trim(),
      baseline_confidence: confidence,
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/home");
    router.refresh();
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <form
        onSubmit={handleSubmit}
        className="fade-in w-full max-w-sm rounded-2xl border border-teal-100 bg-card px-6 py-8 shadow-soft"
      >
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-teal-700">
          Let&apos;s set up your space
        </h1>
        <p className="mt-2 text-ink-soft">
          Just two questions. No forms, no pressure.
        </p>

        <label className="mt-8 block text-sm font-medium text-ink">
          What should we call you?
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="mt-2 w-full rounded-full border border-teal-100 bg-cream px-5 py-3 text-ink outline-none focus:border-teal-500"
        />

        <label className="mt-8 block text-sm font-medium text-ink">
          On a scale of 1–10, how confident do you feel speaking today?
        </label>
        <p className="mt-1 text-sm text-ink-faint">
          There&apos;s no right answer. This is just your starting point.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={10}
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            className="flex-1 accent-teal-500"
          />
          <span className="w-8 text-center font-[family-name:var(--font-display)] text-xl font-bold text-teal-600">
            {confidence}
          </span>
        </div>

        <Button type="submit" disabled={saving} className="mt-10 w-full">
          {saving ? "Getting your space ready..." : "Begin"}
        </Button>

        {error && <p className="mt-4 text-sm text-teal-700">{error}</p>}
      </form>
    </main>
  );
}
