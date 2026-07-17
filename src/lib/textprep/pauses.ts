/**
 * Pause insertion via punctuation normalization. Pure, no AI.
 *
 * speechSynthesis engines pause on commas and periods but read em-dashes,
 * ellipses and semicolons inconsistently. This transform rewrites them into
 * punctuation that produces reliable pauses. User-toggleable.
 */

/** Pure; returns a new string with normalized pause punctuation. */
export function normalizePauses(text: string): string {
  let out = text;

  // Em/en dashes used as clause breaks -> comma pause.
  out = out.replace(/\s*[—–]\s*/g, ", ");
  // Double hyphen used as a dash -> comma pause.
  out = out.replace(/\s+--\s+/g, ", ");

  // Ellipses -> full stop pause.
  out = out.replace(/\s*(?:\.{3,}|…)\s*/g, ". ");

  // Semicolons and colons before a clause -> comma pause.
  out = out.replace(/\s*;\s*/g, ", ");
  out = out.replace(/:\s+/g, ", ");

  // Collapse shouty punctuation runs.
  out = out.replace(/([!?])\1+/g, "$1");
  out = out.replace(/[!?]{2,}/g, "?");

  // Tidy whitespace artifacts: ", ." -> ".", double commas, double spaces.
  out = out.replace(/,\s*([.,!?])/g, "$1");
  out = out.replace(/ {2,}/g, " ");
  out = out.replace(/\n{3,}/g, "\n\n");

  return out.trim();
}
