import { PHRASE_WORDS } from "@/lib/phrase";

export default function PhraseDisplay({ activeIndex }: { activeIndex: number }) {
  return (
    <p className="text-center font-[family-name:var(--font-display)] text-2xl leading-relaxed sm:text-3xl">
      {PHRASE_WORDS.map((word, i) => (
        <span
          key={i}
          className={
            i === activeIndex
              ? "rounded-lg bg-gold-300/70 px-1 text-teal-700 transition-colors"
              : i < activeIndex
                ? "px-1 text-ink-faint transition-colors"
                : "px-1 text-ink transition-colors"
          }
        >
          {word}{" "}
        </span>
      ))}
    </p>
  );
}
