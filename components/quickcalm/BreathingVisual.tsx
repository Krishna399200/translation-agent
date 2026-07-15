import type { BreathPhase, QuickCalmDefinition, QuickCalmStep } from "@/lib/quickCalm";

function scaleFor(phase: BreathPhase) {
  if (phase === "in") return 1.28;
  if (phase === "out") return 0.85;
  return 1.05;
}

export default function BreathingVisual({
  visual,
  step,
}: {
  visual: QuickCalmDefinition["visual"];
  step: QuickCalmStep;
}) {
  const scale = scaleFor(step.phase);
  const transitionMs = Math.max(400, step.durationMs - 200);

  if (visual === "hands") {
    return (
      <div className="flex items-center justify-center gap-6">
        <div
          className="h-16 w-16 rounded-full border-2 transition-all"
          style={{
            transitionDuration: `${transitionMs}ms`,
            borderColor: step.handSide === "left" ? "var(--color-ink-faint)" : "var(--color-teal-300)",
            background: step.handSide === "left" ? "rgba(255,255,255,0.03)" : "rgba(111,215,200,0.15)",
            opacity: step.handSide === "left" ? 0.35 : 1,
          }}
        />
        <div
          className="h-16 w-16 rounded-full border-2 transition-all"
          style={{
            transitionDuration: `${transitionMs}ms`,
            borderColor: step.handSide === "right" ? "var(--color-ink-faint)" : "var(--color-teal-300)",
            background: step.handSide === "right" ? "rgba(255,255,255,0.03)" : "rgba(111,215,200,0.15)",
            opacity: step.handSide === "right" ? 0.35 : 1,
          }}
        />
      </div>
    );
  }

  if (visual === "still") {
    return (
      <div className="flex items-center justify-center">
        <div
          className="h-10 w-10 rounded-full transition-transform"
          style={{
            transitionDuration: `${transitionMs}ms`,
            transform: `scale(${step.phase === "still" ? 1.1 : scale})`,
            background: "radial-gradient(circle, var(--color-gold-300), transparent 70%)",
            boxShadow: "0 0 30px 6px rgba(224,179,74,0.3)",
          }}
        />
      </div>
    );
  }

  const shapeClass = visual === "square" ? "rounded-2xl" : "rounded-full";

  return (
    <div className="flex items-center justify-center">
      <div
        className={`h-24 w-24 border-2 border-teal-300 transition-transform ${shapeClass}`}
        style={{
          transitionDuration: `${transitionMs}ms`,
          transform: `scale(${scale})`,
          background: "rgba(111,215,200,0.12)",
          boxShadow: "0 0 40px -6px rgba(111,215,200,0.5)",
        }}
      />
    </div>
  );
}
