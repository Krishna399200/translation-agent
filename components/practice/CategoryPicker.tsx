import { CATEGORIES } from "@/lib/textBank";

export default function CategoryPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          type="button"
          onClick={() => onChange(cat.value)}
          className={`press rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
            value === cat.value
              ? "border-teal-500/50 bg-teal-500/15 text-teal-300"
              : "border-white/10 text-ink-faint hover:text-ink-soft"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
