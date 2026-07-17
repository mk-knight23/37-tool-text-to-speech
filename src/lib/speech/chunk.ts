/**
 * Utterance chunking.
 *
 * Chrome silently stops long utterances after roughly 15 seconds of audio.
 * Speaking one sentence per utterance avoids it for normal prose; very long
 * sentences are further split at clause/word boundaries so no single
 * utterance exceeds MAX_UTTERANCE_CHARS.
 */

export const MAX_UTTERANCE_CHARS = 180;

export interface Chunk {
  text: string;
  /** Offset of this chunk within the sentence it came from. */
  offset: number;
}

/** Find the best split index at or before `limit` (never 0). */
function findSplitIndex(text: string, limit: number): number {
  const window = text.slice(0, limit);
  const clauseBreak = Math.max(
    window.lastIndexOf(", "),
    window.lastIndexOf("; "),
    window.lastIndexOf(": ")
  );
  if (clauseBreak > limit * 0.3) return clauseBreak + 2;
  const spaceBreak = window.lastIndexOf(" ");
  if (spaceBreak > 0) return spaceBreak + 1;
  return limit;
}

export function chunkSentence(
  sentence: string,
  maxChars: number = MAX_UTTERANCE_CHARS
): Chunk[] {
  if (sentence.length <= maxChars) {
    return [{ text: sentence, offset: 0 }];
  }
  const chunks: Chunk[] = [];
  let offset = 0;
  let rest = sentence;
  while (rest.length > maxChars) {
    const splitAt = findSplitIndex(rest, maxChars);
    chunks.push({ text: rest.slice(0, splitAt), offset });
    offset += splitAt;
    rest = rest.slice(splitAt);
  }
  if (rest.length > 0) {
    chunks.push({ text: rest, offset });
  }
  return chunks;
}
