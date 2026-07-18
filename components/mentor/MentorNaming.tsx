"use client";

import { useState } from "react";
import Button from "@/components/Button";

export default function MentorNaming({
  onDone,
  saving,
}: {
  onDone: (name: string) => void;
  saving: boolean;
}) {
  const [name, setName] = useState("");

  return (
    <div className="fade-in frosted-card mx-auto w-full max-w-sm rounded-2xl px-6 py-8 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">
        What would you like to call your companion?
      </h1>
      <p className="mt-2 text-sm text-ink-soft">Totally optional — &quot;Kai&quot; works fine too.</p>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Kai"
        maxLength={24}
        className="mt-6 w-full rounded-full border border-white/10 bg-black/20 px-5 py-3 text-center text-ink outline-none placeholder:text-ink-faint focus:border-teal-500/50"
      />

      <Button
        onClick={() => onDone(name.trim() || "Kai")}
        disabled={saving}
        className="mt-8 w-full"
      >
        {saving ? "Setting things up..." : "Continue"}
      </Button>
    </div>
  );
}
