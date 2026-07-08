export default function PhraseDisplay({ words, activeIndex }: { words: string[]; activeIndex: number }) {
  return (
    <p className="text-center font-[family-name:var(--font-display)] text-2xl leading-relaxed sm:text-3xl">
      {words.map((word, i) => (
        <span
          key={i}
          className={
            i === activeIndex
              ? "px-1 text-ink shadow-[0_2px_0_0_var(--color-teal-300)] transition-colors"
              : "px-1 text-ink-faint transition-colors"
          }
          style={i === activeIndex ? { boxShadow: "0 3px 0 0 var(--color-teal-300)", textShadow: "0 0 18px rgba(111,215,200,0.5)" } : undefined}
        >
          {word}{" "}
        </span>
      ))}
    </p>
  );
}
