export type Akshara = { devanagari: string; transliteration: string };

export type VarnamalaLevel = {
  key: string;
  title: string;
  description: string;
  aksharas: Akshara[];
};

export const VARNAMALA_LEVELS: VarnamalaLevel[] = [
  {
    key: "vowels",
    title: "Vowels",
    description: "स्वर — the open sounds every word grows from.",
    aksharas: [
      { devanagari: "अ", transliteration: "a" },
      { devanagari: "आ", transliteration: "aa" },
      { devanagari: "इ", transliteration: "i" },
      { devanagari: "ई", transliteration: "ii" },
      { devanagari: "उ", transliteration: "u" },
      { devanagari: "ऊ", transliteration: "uu" },
      { devanagari: "ए", transliteration: "e" },
      { devanagari: "ऐ", transliteration: "ai" },
      { devanagari: "ओ", transliteration: "o" },
      { devanagari: "औ", transliteration: "au" },
    ],
  },
  {
    key: "consonants",
    title: "Consonants",
    description: "व्यंजन — where breath meets shape.",
    aksharas: [
      { devanagari: "क", transliteration: "ka" },
      { devanagari: "ख", transliteration: "kha" },
      { devanagari: "ग", transliteration: "ga" },
      { devanagari: "घ", transliteration: "gha" },
      { devanagari: "च", transliteration: "cha" },
      { devanagari: "छ", transliteration: "chha" },
      { devanagari: "ज", transliteration: "ja" },
      { devanagari: "झ", transliteration: "jha" },
      { devanagari: "त", transliteration: "ta" },
      { devanagari: "थ", transliteration: "tha" },
      { devanagari: "द", transliteration: "da" },
      { devanagari: "ध", transliteration: "dha" },
      { devanagari: "न", transliteration: "na" },
      { devanagari: "प", transliteration: "pa" },
      { devanagari: "फ", transliteration: "pha" },
      { devanagari: "ब", transliteration: "ba" },
      { devanagari: "भ", transliteration: "bha" },
      { devanagari: "म", transliteration: "ma" },
    ],
  },
  {
    key: "combinations",
    title: "Consonant + Vowel Combinations",
    description: "संयुक्ताक्षर — sounds beginning to join into words.",
    aksharas: [
      { devanagari: "का", transliteration: "kaa" },
      { devanagari: "कि", transliteration: "ki" },
      { devanagari: "कु", transliteration: "ku" },
      { devanagari: "के", transliteration: "ke" },
      { devanagari: "को", transliteration: "ko" },
      { devanagari: "ता", transliteration: "taa" },
      { devanagari: "ति", transliteration: "ti" },
      { devanagari: "तु", transliteration: "tu" },
      { devanagari: "मा", transliteration: "maa" },
      { devanagari: "मि", transliteration: "mi" },
      { devanagari: "मु", transliteration: "mu" },
      { devanagari: "सा", transliteration: "saa" },
      { devanagari: "सि", transliteration: "si" },
      { devanagari: "सु", transliteration: "su" },
    ],
  },
];
