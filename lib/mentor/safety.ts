/**
 * Crisis-language screening for free-text user input (currently: "That was
 * hard" check-in notes — see app/(app)/(focused)/quick-calm/page.tsx).
 *
 * WHAT THIS IS: a deliberately simple, deterministic keyword/phrase net,
 * run before any AI-generated response touches this text. No LLM call, no
 * network dependency, no failure mode where a timeout or API error lets
 * concerning language through unscreened — it either matches or it
 * doesn't, and the caller can rely on that.
 *
 * WHAT THIS IS NOT: a clinical or diagnostic tool, and not a substitute for
 * a real crisis-detection system reviewed by someone with relevant
 * expertise. It is tuned to favor false positives over false negatives —
 * i.e. it will sometimes show the supportive/resources card for language
 * that wasn't actually a crisis, and that's an intentional tradeoff, not a
 * bug. It will still miss things: it only catches English text matching
 * these specific patterns, nothing evaluating tone, context, or severity
 * beyond that. Treat this as a first pass worth having, not a guarantee.
 *
 * Before relying on this for real users, have it reviewed by someone with
 * mental-health-crisis-response expertise and consider a proper moderation
 * API as a second layer rather than the sole mechanism.
 */

const CRISIS_PATTERNS: RegExp[] = [
  // Direct suicidal ideation
  /\bkill(ing)?\s+myself\b/i,
  /\bsuicidal?\b/i,
  /\bend(ing)?\s+(my\s+life|it\s+all)\b/i,
  /\bwant(ed)?\s+to\s+die\b/i,
  /\bwish(ed)?\s+(i\s+was|i\s+were)\s+dead\b/i,
  /\bdon'?t\s+want\s+to\s+(be\s+alive|live\s+anymore|exist)\b/i,
  /\bbetter\s+off\s+dead\b/i,
  /\bno\s+longer\s+want\s+to\s+(live|be\s+here)\b/i,

  // Self-harm
  /\bhurt(ing)?\s+myself\b/i,
  /\bharm(ing)?\s+myself\b/i,
  /\bcutt?ing\s+myself\b/i,
  /\bself[\s-]?harm\b/i,

  // Hopelessness / no way forward
  /\bno\s+point\s+in\s+(living|life|anything)\b/i,
  /\bno\s+reason\s+to\s+(live|go\s+on|keep\s+going)\b/i,
  /\bcan'?t\s+(go\s+on|do\s+this\s+anymore|keep\s+going)\b/i,
  /\bnothing\s+matters\s+anymore\b/i,
  /\bno\s+way\s+out\b/i,
  /\blife\s+(isn'?t|is\s+not)\s+worth\s+(living|it)\b/i,
  /\bnot\s+worth\s+living\b/i,

  // Burden ideation
  /\bbetter\s+off\s+without\s+me\b/i,
  /\beveryone\s+(would\s+be|is)\s+better\s+off\s+without\s+me\b/i,
  /\b(a\s+)?burden\s+to\s+everyone\b/i,

  // Finality / goodbye language
  /\bthis\s+is\s+(my\s+)?goodbye\b/i,
  /\bwon'?t\s+be\s+here\s+much\s+longer\b/i,
  /\bfinal\s+goodbye\b/i,
];

export function screenForCrisisLanguage(text: string | null | undefined): boolean {
  if (!text || !text.trim()) return false;
  return CRISIS_PATTERNS.some((pattern) => pattern.test(text));
}
