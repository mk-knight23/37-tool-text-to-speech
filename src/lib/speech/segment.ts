/**
 * Deterministic text segmentation: paragraphs -> sentences.
 * Uses Intl.Segmenter when available, with a regex fallback.
 * All offsets are absolute character offsets into the source text so the
 * transcript can highlight without re-deriving positions.
 */

export interface SentenceRef {
  /** Position in the flat sentence list. */
  index: number;
  paragraphIndex: number;
  text: string;
  /** Absolute start offset in the source text. */
  start: number;
  /** Absolute end offset (exclusive) in the source text. */
  end: number;
}

export interface ParagraphRef {
  index: number;
  start: number;
  end: number;
  /** Index of this paragraph's first sentence in the flat list. */
  firstSentence: number;
  /** Index of this paragraph's last sentence in the flat list. */
  lastSentence: number;
}

export interface Segmentation {
  sentences: SentenceRef[];
  paragraphs: ParagraphRef[];
}

interface RawSpan {
  text: string;
  start: number;
}

function splitParagraphSpans(text: string): RawSpan[] {
  const spans: RawSpan[] = [];
  const pattern = /[^\n]+/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match[0].trim().length > 0) {
      spans.push({ text: match[0], start: match.index });
    }
  }
  return spans;
}

/** Regex fallback: split after ., !, ?, … followed by whitespace. */
function splitSentencesFallback(paragraph: string): RawSpan[] {
  const spans: RawSpan[] = [];
  const pattern = /[^.!?…]+[.!?…]*\s*/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(paragraph)) !== null) {
    if (match[0].trim().length > 0) {
      spans.push({ text: match[0], start: match.index });
    }
  }
  return spans.length > 0 ? spans : [{ text: paragraph, start: 0 }];
}

function splitSentenceSpans(paragraph: string): RawSpan[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    try {
      const segmenter = new Intl.Segmenter(undefined, {
        granularity: "sentence",
      });
      const spans: RawSpan[] = [];
      for (const segment of segmenter.segment(paragraph)) {
        if (segment.segment.trim().length > 0) {
          spans.push({ text: segment.segment, start: segment.index });
        }
      }
      if (spans.length > 0) return spans;
    } catch {
      // fall through to regex fallback
    }
  }
  return splitSentencesFallback(paragraph);
}

/** Trim a span's leading/trailing whitespace while keeping offsets true. */
function trimSpan(span: RawSpan, base: number): RawSpan & { end: number } {
  const leading = span.text.length - span.text.trimStart().length;
  const trimmed = span.text.trim();
  const start = base + span.start + leading;
  return { text: trimmed, start, end: start + trimmed.length };
}

export function segmentText(text: string): Segmentation {
  const sentences: SentenceRef[] = [];
  const paragraphs: ParagraphRef[] = [];

  for (const paragraphSpan of splitParagraphSpans(text)) {
    const first = sentences.length;
    for (const sentenceSpan of splitSentenceSpans(paragraphSpan.text)) {
      const trimmed = trimSpan(sentenceSpan, paragraphSpan.start);
      if (trimmed.text.length === 0) continue;
      sentences.push({
        index: sentences.length,
        paragraphIndex: paragraphs.length,
        text: trimmed.text,
        start: trimmed.start,
        end: trimmed.end,
      });
    }
    if (sentences.length > first) {
      paragraphs.push({
        index: paragraphs.length,
        start: paragraphSpan.start,
        end: paragraphSpan.start + paragraphSpan.text.length,
        firstSentence: first,
        lastSentence: sentences.length - 1,
      });
    }
  }

  return { sentences, paragraphs };
}
