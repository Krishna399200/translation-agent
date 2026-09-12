import type { Akshara } from "@/lib/varnamala";

export default function AksharaDisplay({ aksharas, activeIndex }: { aksharas: Akshara[]; activeIndex: number }) {
  const active = activeIndex >= 0 ? aksharas[activeIndex] : null;

  return (
    <div className="flex flex-col items-center gap-8">
      {active && (
        <div className="fade-in text-center" key={activeIndex}>
          <p
            className="font-[family-name:var(--font-display)] text-6xl font-bold text-ink"
            style={{ textShadow: "0 0 30px rgba(111,215,200,0.5)" }}
          >
            {active.devanagari}
          </p>
          <p className="mt-2 text-lg text-teal-300">{active.transliteration}</p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {aksharas.map((a, i) => (
          <span
            key={i}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm ${
              i === activeIndex
                ? "bg-teal-500/20 text-teal-300"
                : i < activeIndex
                  ? "text-ink-faint"
                  : "text-ink-soft"
            }`}
          >
            {a.devanagari}
          </span>
        ))}
      </div>
    </div>
  );
}
