const MAX_STAGE = 5;

function stageFor(streak: number) {
  return Math.max(0, Math.min(MAX_STAGE, streak));
}

export default function PlantStreak({ streak }: { streak: number }) {
  const stage = stageFor(streak);
  const spread = 18 + stage * 4;
  const height = 30 + stage * 6;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        aria-hidden="true"
        style={{ filter: "drop-shadow(0 0 22px rgba(224,179,74,0.35))" }}
      >
        <path
          d={`M70,120 V${120 - height} M70,${120 - height * 0.55} C${70 - spread},${120 - height * 0.55} ${70 - spread * 1.6},${120 - height} ${70 - spread * 1.4},${120 - height * 1.5}`}
          stroke="var(--color-teal-300)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M70,${120 - height * 0.75} C${70 + spread},${120 - height * 0.75} ${70 + spread * 1.6},${120 - height * 1.1} ${70 + spread * 1.3},${120 - height * 1.7}`}
          stroke="var(--color-gold-500)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M70,${120 - height} L64,${132 - height} M70,${120 - height} L76,${132 - height}`}
          stroke="var(--color-gold-300)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <p className="text-sm text-ink-soft text-center">
        {streak === 0
          ? "Your plant is waiting for today's practice."
          : `${streak} day${streak === 1 ? "" : "s"} of showing up.`}
      </p>
    </div>
  );
}
