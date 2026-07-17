/**
 * .srt / .vtt subtitle import: strip cue numbers, timestamps, settings and
 * styling tags; join cue text into readable prose. Client-side only.
 */

const SRT_TIMESTAMP =
  /^\s*\d{1,2}:\d{2}:\d{2}[,.]\d{3}\s+-->\s+\d{1,2}:\d{2}:\d{2}[,.]\d{3}.*$/;
const VTT_TIMESTAMP =
  /^\s*(?:\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{3}\s+-->\s+(?:\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{3}.*$/;

function stripCueMarkup(line: string): string {
  let out = line;
  // Inline timestamps like <00:00:01.000> (karaoke cues).
  out = out.replace(/<\d{1,2}:\d{2}(?::\d{2})?[.,]\d{3}>/g, "");
  // Styling tags: <i>, </i>, <b>, <c.classname>, <v Speaker>...
  out = out.replace(/<\/?[^>]+>/g, "");
  // ASS-style positioning artifacts sometimes present in .srt: {\an8}
  out = out.replace(/\{\\[^}]*\}/g, "");
  return out.trim();
}

export function parseSubtitles(content: string, kind: "srt" | "vtt"): string {
  const lines = content.replace(/^﻿/, "").split(/\r?\n/);
  const cueTexts: string[] = [];
  let currentCue: string[] = [];
  let inMetaBlock = false;

  const flushCue = () => {
    if (currentCue.length > 0) {
      const text = currentCue.join(" ").replace(/\s+/g, " ").trim();
      // Rolling captions repeat the previous cue; keep one copy.
      if (text.length > 0 && cueTexts[cueTexts.length - 1] !== text) {
        cueTexts.push(text);
      }
      currentCue = [];
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    if (kind === "vtt") {
      if (i === 0 && trimmed.startsWith("WEBVTT")) continue;
      if (/^(NOTE|STYLE|REGION)\b/.test(trimmed)) {
        inMetaBlock = true;
        continue;
      }
      if (inMetaBlock) {
        if (trimmed === "") inMetaBlock = false;
        continue;
      }
    }

    if (trimmed === "") {
      flushCue();
      continue;
    }
    // Timestamp lines end any pending cue identifier line.
    if (SRT_TIMESTAMP.test(trimmed) || VTT_TIMESTAMP.test(trimmed)) {
      continue;
    }
    // Pure cue numbers (srt) or cue identifiers directly before a timestamp.
    const next = lines[i + 1]?.trim() ?? "";
    if (
      (SRT_TIMESTAMP.test(next) || VTT_TIMESTAMP.test(next)) &&
      (kind === "srt" ? /^\d+$/.test(trimmed) : true)
    ) {
      continue;
    }
    if (kind === "srt" && /^\d+$/.test(trimmed) && next === "") {
      continue;
    }

    const text = stripCueMarkup(trimmed);
    if (text.length > 0) currentCue.push(text);
  }
  flushCue();

  return cueTexts.join(" ").replace(/\s+/g, " ").trim();
}
