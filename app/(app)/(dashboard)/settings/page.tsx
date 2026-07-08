"use client";

import { useSettings } from "@/lib/settings/SettingsContext";
import Toggle from "@/components/Toggle";

export default function SettingsPage() {
  const { tone432, setTone432, noPressureMode, setNoPressureMode } = useSettings();

  return (
    <div className="fade-in mx-auto w-full max-w-lg">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">Settings</h1>
      <p className="mt-1 text-sm text-ink-soft">A few quiet preferences, remembered everywhere you practice.</p>

      <div className="frosted-card mt-6 flex flex-col gap-6 rounded-2xl px-6 py-6">
        <Toggle
          checked={tone432}
          onChange={setTone432}
          label="432Hz calming tone"
          description="A soft ambient tone during breathing transitions, across every practice type."
        />
        <div className="h-px bg-white/[0.06]" />
        <Toggle
          checked={noPressureMode}
          onChange={setNoPressureMode}
          label="No-pressure mode"
          description="Skip the sentiment check-in after each session. You'll just see a simple 'Well done.'"
        />
      </div>
    </div>
  );
}
