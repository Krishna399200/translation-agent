"use client";

import { useState } from "react";
import Button from "@/components/Button";

const LEVELS: { value: number; label: string; note: string }[] = [
  { value: 1, label: "Rough", note: "That was hard. You still showed up." },
  { value: 2, label: "Effortful", note: "A little rocky. Still a rep in the books." },
  { value: 3, label: "Steady", note: "Right down the middle. Solid." },
  { value: 4, label: "Good", note: "That felt good, didn't it?" },
  { value: 5, label: "Flowing", note: "That felt like flow." },
];

export default function RatingStep({
  onSubmit,
  submitting,
}: {
  onSubmit: (rating: number) => void;
  submitting: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="fade-in mx-auto w-full max-w-sm text-center">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-teal-700">
        How did that feel?
      </h2>
      <p className="mt-2 text-ink-soft">There&apos;s no wrong answer here.</p>

      <div className="mt-8 flex justify-center gap-2">
        {LEVELS.map((level) => (
          <button
            key={level.value}
            onClick={() => setSelected(level.value)}
            className={`press flex h-12 w-12 items-center justify-center rounded-full border font-[family-name:var(--font-display)] font-bold ${
              selected === level.value
                ? "border-teal-500 bg-teal-500 text-cream"
                : "border-teal-100 bg-card text-teal-600 hover:bg-teal-50"
            }`}
            aria-label={level.label}
          >
            {level.value}
          </button>
        ))}
      </div>

      <p className="mt-4 h-6 text-ink-soft">
        {selected ? LEVELS[selected - 1].note : ""}
      </p>

      <Button
        onClick={() => selected && onSubmit(selected)}
        disabled={!selected || submitting}
        className="mt-8 w-full"
      >
        {submitting ? "Saving your progress..." : "Save this rep"}
      </Button>
    </div>
  );
}
