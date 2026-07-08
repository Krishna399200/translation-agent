const MAX_STAGE = 5;

function stageFor(streak: number) {
  return Math.max(0, Math.min(MAX_STAGE, streak));
}

export default function PlantStreak({ streak }: { streak: number }) {
  const stage = stageFor(streak);
  const height = 30 + stage * 16;
  const leafPairs = Math.min(3, Math.ceil(stage / 2));

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
        <ellipse cx="60" cy="104" rx="34" ry="8" fill="var(--color-teal-100)" />
        <path
          d="M40,108 L46,86 H74 L80,108 Z"
          fill="var(--color-sand-300)"
        />
        <rect x="44" y="80" width="32" height="8" rx="2" fill="var(--color-sand-500)" />

        <line
          x1="60"
          y1="86"
          x2="60"
          y2={86 - height}
          stroke="var(--color-sage-500)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {Array.from({ length: leafPairs }).map((_, i) => {
          const y = 80 - height * 0.3 - i * (height / (leafPairs + 0.5));
          return (
            <g key={i}>
              <path
                d={`M60,${y} C40,${y - 6} 32,${y - 18} 34,${y - 28} C52,${y - 26} 60,${y - 12} 60,${y} Z`}
                fill="var(--color-sage-300)"
              />
              <path
                d={`M60,${y} C80,${y - 6} 88,${y - 18} 86,${y - 28} C68,${y - 26} 60,${y - 12} 60,${y} Z`}
                fill="var(--color-sage-500)"
              />
            </g>
          );
        })}

        {stage >= MAX_STAGE && (
          <circle cx="60" cy={86 - height - 6} r="7" fill="var(--color-gold-500)" />
        )}
      </svg>
      <p className="text-sm text-ink-soft text-center">
        {streak === 0
          ? "Your plant is waiting for today's practice."
          : `${streak} day${streak === 1 ? "" : "s"} of showing up.`}
      </p>
    </div>
  );
}
