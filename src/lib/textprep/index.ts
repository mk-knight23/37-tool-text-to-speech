/**
 * Deterministic text preparation pipeline — local processing, not AI.
 * Every transform is pure and previewable (before/after).
 */

import { expandAbbreviations } from "./abbreviations";
import { expandNumbers } from "./numbers";
import { normalizePauses } from "./pauses";

export interface PrepOptions {
  expandNumbers: boolean;
  expandAbbreviations: boolean;
  normalizePauses: boolean;
}

export const DEFAULT_PREP_OPTIONS: PrepOptions = {
  expandNumbers: false,
  expandAbbreviations: false,
  normalizePauses: false,
};

export function isPrepActive(options: PrepOptions): boolean {
  return (
    options.expandNumbers ||
    options.expandAbbreviations ||
    options.normalizePauses
  );
}

/** Apply the enabled transforms in a fixed order. Pure. */
export function prepareText(text: string, options: PrepOptions): string {
  let out = text;
  if (options.expandAbbreviations) out = expandAbbreviations(out);
  if (options.expandNumbers) out = expandNumbers(out);
  if (options.normalizePauses) out = normalizePauses(out);
  return out;
}

export { expandAbbreviations, expandNumbers, normalizePauses };
