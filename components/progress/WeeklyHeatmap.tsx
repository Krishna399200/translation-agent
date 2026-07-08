const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfWeek(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export default function WeeklyHeatmap({ timestamps }: { timestamps: string[] }) {
  const weekStart = startOfWeek(new Date());
  const counts = Array.from({ length: 7 }, (_, i) => {
    const dayStart = new Date(weekStart);
    dayStart.setDate(weekStart.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);
    return timestamps.filter((t) => {
      const d = new Date(t);
      return d >= dayStart && d < dayEnd;
    }).length;
  });

  const activeDays = counts.filter((c) => c > 0).length;
  const maxCount = Math.max(1, ...counts);

  function intensity(count: number) {
    if (count === 0) return "rgba(255,255,255,0.05)";
    const ratio = count / maxCount;
    if (ratio > 0.75) return "var(--color-teal-500)";
    if (ratio > 0.4) return "var(--color-teal-600)";
    return "rgba(47,184,166,0.35)";
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-2">
        {DAY_LABELS.map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] text-ink-faint">{label}</span>
            <div
              className="h-8 w-full rounded-md"
              style={{ background: intensity(counts[i]) }}
              title={`${counts[i]} session${counts[i] === 1 ? "" : "s"}`}
            />
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-ink-soft">
        You&apos;ve practiced on {activeDays} out of 7 days this week.
        {activeDays >= 5 ? " Great consistency!" : ""}
      </p>
    </div>
  );
}
