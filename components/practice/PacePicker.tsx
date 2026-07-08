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
      />
      <p className="mt-2 text-center text-sm text-ink-soft">{PACE_LABELS[pace]}</p>
    </div>
  );
}
