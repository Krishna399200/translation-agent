export const TRIGGER_CATEGORIES: { key: string; label: string }[] = [
  { key: "p_b_sounds", label: "P/B Sounds" },
  { key: "t_d_sounds", label: "T/D Sounds" },
  { key: "k_g_sounds", label: "K/G Sounds" },
  { key: "personal_identifiers", label: "Personal Identifiers" },
  { key: "professional_words", label: "Professional Words" },
  { key: "my_words", label: "My Words" },
];

export function graduatedPhrasesFor(word: string) {
  return {
    level1: `${word}.`,
    level2: `I can say ${word}.`,
    level3: `I can say ${word} clearly and calmly.`,
  };
}
