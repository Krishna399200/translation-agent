export type Mantra = {
  key: string;
  name: string;
  devanagari: string;
  transliteration: string;
};

export const MANTRAS: Mantra[] = [
  {
    key: "om",
    name: "Om",
    devanagari: "ॐ",
    transliteration: "Om",
  },
  {
    key: "om-namah-shivaya",
    name: "Om Namah Shivaya",
    devanagari: "ॐ नमः शिवाय",
    transliteration: "Om Namah Shivaya",
  },
  {
    key: "gayatri",
    name: "Gayatri Mantra",
    devanagari: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्",
    transliteration:
      "Om Bhur Bhuva Swaha, Tat Savitur Varenyam, Bhargo Devasya Dhimahi, Dhiyo Yo Nah Prachodayat",
  },
];
