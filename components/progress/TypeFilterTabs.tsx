import type { PracticeType } from "@/lib/database.types";

export type TypeFilter = "all" | PracticeType | "scenario";

const OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "reading_text", label: "Reading" },
  { value: "mantra", label: "Mantra" },
  { value: "varnamala", label: "Sound Foundations" },
  { value: "trigger_words", label: "Trigger Words" },
  { value: "scenario", label: "Practice a Moment" },
];

export default function TypeFilterTabs({
  value,
  onChange,
}: {
  value: TypeFilter;
  onChange: (value: TypeFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`press rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
            value === opt.value
              ? "border-teal-500/50 bg-teal-500/15 text-teal-300"
              : "border-white/10 text-ink-faint hover:text-ink-soft"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
