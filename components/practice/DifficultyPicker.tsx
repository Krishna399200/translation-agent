import { DIFFICULTIES, type Difficulty } from "@/lib/textBank";

export default function DifficultyPicker({
  value,
  onChange,
}: {
  value: Difficulty;
  onChange: (value: Difficulty) => void;
}) {
  const current = DIFFICULTIES.find((d) => d.value === value);

  return (
    <div>
      <div className="inline-flex rounded-full border border-white/10 bg-black/20 p-1">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => onChange(d.value)}
            className={`press rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              value === d.value ? "bg-teal-500/20 text-teal-300" : "text-ink-faint hover:text-ink-soft"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
      {current && <p className="mt-2 text-xs text-ink-faint">{current.description}</p>}
    </div>
  );
}
