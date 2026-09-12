import { PACE_LABELS, type Pace } from "@/lib/phrase";

const ORDER: Pace[] = ["slow", "medium", "natural"];

export default function PacePicker({
  pace,
  onChange,
}: {
  pace: Pace;
  onChange: (pace: Pace) => void;
}) {
  const index = ORDER.indexOf(pace);

  return (
    <div className="w-full">
      <input
        type="range"
        min={0}
        max={2}
        step={1}
        value={index}
        onChange={(e) => onChange(ORDER[Number(e.target.value)])}
        className="w-full accent-teal-500"
        aria-label="Reading pace"
        style={{
          background: "linear-gradient(90deg, var(--color-blue-400), var(--color-gold-500))",
          height: 3,
          borderRadius: 999,
        }}
      />
      <div className="mt-2 flex items-center justify-between text-xs text-ink-faint">
        <span>Slow</span>
        <span className="text-ink-soft">{PACE_LABELS[pace]}</span>
        <span>Fast</span>
      </div>
    </div>
  );
}
