function toDateKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((new Date(a).getTime() - new Date(b).getTime()) / msPerDay);
}

/**
 * Consecutive-day streak ending at the most recent practice day.
 * A one-day gap since the last session still counts as "alive" so a streak
 * doesn't vanish the moment someone wakes up before practicing today.
 */
export function computeStreak(sessionTimestamps: string[]): number {
  if (sessionTimestamps.length === 0) return 0;

  const uniqueDays = Array.from(new Set(sessionTimestamps.map(toDateKey))).sort(
    (a, b) => (a < b ? 1 : -1)
  );

  const todayKey = new Date().toISOString().slice(0, 10);
  const gapFromToday = daysBetween(todayKey, uniqueDays[0]);
  if (gapFromToday > 1) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const gap = daysBetween(uniqueDays[i - 1], uniqueDays[i]);
    if (gap === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function practicedToday(sessionTimestamps: string[]): boolean {
  const todayKey = new Date().toISOString().slice(0, 10);
  return sessionTimestamps.some((ts) => toDateKey(ts) === todayKey);
}
