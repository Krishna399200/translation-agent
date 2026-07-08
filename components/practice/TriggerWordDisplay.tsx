export type LevelGroup = { label: string; words: string[] };

export default function TriggerWordDisplay({
  groups,
  activeIndex,
}: {
  groups: LevelGroup[];
  activeIndex: number;
}) {
  const ranges = groups.reduce<{ start: number; end: number }[]>((acc, group) => {
    const start = acc.length > 0 ? acc[acc.length - 1].end : 0;
    acc.push({ start, end: start + group.words.length });
    return acc;
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group, gi) => {
        const { start } = ranges[gi];
        const isCurrentGroup = activeIndex >= ranges[gi].start && activeIndex < ranges[gi].end;

        return (
          <div
            key={gi}
            className={`rounded-xl px-4 py-3 transition-opacity ${isCurrentGroup ? "opacity-100" : "opacity-40"}`}
          >
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">{group.label}</p>
            <p className="font-[family-name:var(--font-display)] text-xl">
              {group.words.map((word, wi) => {
                const globalIndex = start + wi;
                return (
                  <span
                    key={wi}
                    className={globalIndex === activeIndex ? "px-1 text-ink" : "px-1 text-ink-faint"}
                    style={
                      globalIndex === activeIndex
                        ? { textShadow: "0 0 18px rgba(111,215,200,0.5)" }
                        : undefined
                    }
                  >
                    {word}{" "}
                  </span>
                );
              })}
            </p>
          </div>
        );
      })}
    </div>
  );
}
