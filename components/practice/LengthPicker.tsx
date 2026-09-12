import type { LengthTag } from "@/lib/textBank";

const OPTIONS: { value: LengthTag; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

export default function LengthPicker({
  value,
  onChange,
}: {
  value: LengthTag;
  onChange: (value: LengthTag) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-black/20 p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`press rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
            value === opt.value ? "bg-teal-500/20 text-teal-300" : "text-ink-faint hover:text-ink-soft"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
