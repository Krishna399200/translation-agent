export const PHRASE = {
  id: "steady-voice-v1",
  text: "My breath leads. My voice follows. I speak at my own pace, and that pace is enough.",
};

export const PHRASE_WORDS = PHRASE.text.split(" ");

export type Pace = "slow" | "medium" | "natural";

// Words per minute the highlight advances at, tuned for deliberate, chant-like reading.
export const PACE_WPM: Record<Pace, number> = {
  slow: 70,
  medium: 100,
  natural: 130,
};

export const PACE_LABELS: Record<Pace, string> = {
  slow: "Slow — one word, one breath",
  medium: "Medium — a steady walk",
  natural: "Natural — your everyday rhythm",
};
