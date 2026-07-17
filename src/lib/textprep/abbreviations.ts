/**
 * Curated abbreviation expansion (English, v1). Pure, no AI.
 *
 * Notes:
 * - "e.g." / "i.e." expand with a trailing comma so the spoken phrase keeps
 *   its natural pause without inventing a sentence break.
 * - "St." expands to "Saint" (documented choice; street addresses are the
 *   rarer case in prose and the transform is user-toggleable).
 */

interface Expansion {
  pattern: RegExp;
  replacement: string;
}

const EXPANSIONS: Expansion[] = [
  { pattern: /\be\.g\.,?/gi, replacement: "for example," },
  { pattern: /\bi\.e\.,?/gi, replacement: "that is," },
  { pattern: /\betc\./gi, replacement: "et cetera" },
  { pattern: /\bvs\.?(?=\s)/gi, replacement: "versus" },
  { pattern: /\bapprox\./gi, replacement: "approximately" },
  { pattern: /\bDr\.(?=\s+[A-Z])/g, replacement: "Doctor" },
  { pattern: /\bMr\.(?=\s+[A-Z])/g, replacement: "Mister" },
  { pattern: /\bMrs\.(?=\s+[A-Z])/g, replacement: "Missus" },
  { pattern: /\bMs\.(?=\s+[A-Z])/g, replacement: "Miss" },
  { pattern: /\bProf\.(?=\s+[A-Z])/g, replacement: "Professor" },
  { pattern: /\bSt\.(?=\s+[A-Z])/g, replacement: "Saint" },
  { pattern: /\bJr\./g, replacement: "Junior" },
  { pattern: /\bSr\.(?=\s+[A-Z])/g, replacement: "Senior" },
  { pattern: /\bAve\.(?=\s)/g, replacement: "Avenue" },
  { pattern: /\bBlvd\.(?=\s)/g, replacement: "Boulevard" },
  { pattern: /\bRd\.(?=\s)/g, replacement: "Road" },
  { pattern: /\bNo\.(?=\s*\d)/g, replacement: "Number" },
  { pattern: /\bFig\.(?=\s*\d)/gi, replacement: "Figure" },
  { pattern: /\bdept\./gi, replacement: "department" },
  { pattern: /\bmin\.(?=\s)/gi, replacement: "minutes" },
  { pattern: /\bmax\.(?=\s)/gi, replacement: "maximum" },
  { pattern: /\bhrs\.(?=\s)/gi, replacement: "hours" },
  { pattern: / & /g, replacement: " and " },
];

/** Pure; returns a new string with curated abbreviations expanded. */
export function expandAbbreviations(text: string): string {
  let out = text;
  for (const { pattern, replacement } of EXPANSIONS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}
