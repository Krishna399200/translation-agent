"use client";

type Level = {
  value: number;
  key: string;
  label: string;
  color: string;
};

const LEVELS: Level[] = [
  { value: 1, key: "difficult", label: "Difficult", color: "var(--color-mood-difficult)" },
  { value: 2, key: "challenging", label: "Challenging", color: "var(--color-mood-challenging)" },
  { value: 3, key: "neutral", label: "Neutral", color: "var(--color-mood-neutral)" },
  { value: 4, key: "good", label: "Good", color: "var(--color-mood-good)" },
  { value: 5, key: "effortless", label: "Effortless", color: "var(--color-mood-effortless)" },
];

function Face({ value, color }: { value: number; color: string }) {
  const mouthPath =
    value === 1
      ? "M8 16c1.2-2 2.8-2.5 4-2.5s2.8.5 4 2.5"
      : value === 2
        ? "M8 15.5c1.2-1 2.8-1.2 4-1.2s2.8.2 4 1.2"
        : value === 3
          ? "M8 15h8"
          : value === 4
            ? "M8 14c1.2 1.5 2.8 2 4 2s2.8-.5 4-2"
            : "M7.5 13.5c1.4 2.2 3.2 3 4.5 3s3.1-.8 4.5-3";

  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="10" r="1.1" fill={color} />
      <circle cx="15" cy="10" r="1.1" fill={color} />
      <path d={mouthPath} stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export default function SentimentSelector({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {LEVELS.map((level) => {
        const active = value === level.value;
        return (
          <div key={level.value} className="relative flex flex-col items-center gap-2">
            {active && (
              <span
                className="fade-in absolute -top-9 rounded-full px-3 py-1 text-xs font-semibold text-void-deep"
                style={{ background: level.color }}
              >
                {level.label}
              </span>
            )}
            <button
              type="button"
              onClick={() => onChange(level.value)}
              aria-label={level.label}
              className="press flex h-14 w-14 items-center justify-center rounded-full border transition-all sm:h-16 sm:w-16"
              style={{
                borderColor: active ? level.color : "var(--color-card-border)",
                background: active ? `${level.color}22` : "var(--color-card)",
                boxShadow: active ? `0 0 24px -4px ${level.color}` : "none",
              }}
            >
              <Face value={level.value} color={level.color} />
            </button>
            <span className={`text-[11px] ${active ? "text-ink" : "text-ink-faint"}`}>{level.label}</span>
          </div>
        );
      })}
    </div>
  );
}
