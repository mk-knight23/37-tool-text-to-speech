/**
 * Standalone offline utilities for text cleaning, duration calculators,
 * subtitle conversion, and Web Audio manipulations. 100% deterministic.
 */

/* ------------------------------------------------------------------ */
/* 1. Text Cleaner Utilities                                          */
/* ------------------------------------------------------------------ */

export function removeRepeatedSpaces(text: string): string {
  return text.replace(/[ \t]+/g, " ");
}

export function removeUnwantedLineBreaks(text: string): string {
  // Join lines that are broken in the middle of sentences while keeping paragraph breaks
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\n(?!\n)/g, " ").replace(/\s+/g, " ").trim())
    .join("\n\n");
}

export function stripHtmlTags(text: string): string {
  return text
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function fixPunctuationSpacing(text: string): string {
  return text
    .replace(/\s+([.,!?;:])/g, "$1") // remove space before punctuation
    .replace(/([.,!?;:])(?=[A-Za-z0-9])/g, "$1 ") // add space after punctuation if missing
    .replace(/([.?!])\s+([a-z])/g, (_, p, letter) => `${p} ${letter.toUpperCase()}`); // capitalize sentence start
}

export function convertCase(text: string, mode: "upper" | "lower" | "title" | "sentence"): string {
  if (mode === "upper") return text.toUpperCase();
  if (mode === "lower") return text.toLowerCase();
  if (mode === "sentence") {
    return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
  }
  if (mode === "title") {
    return text.toLowerCase().replace(/\b\w+/g, (word) => {
      const stopWords = new Set(["a", "an", "the", "and", "but", "or", "for", "nor", "on", "at", "to", "from", "by", "with", "in", "of"]);
      if (stopWords.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
  }
  return text;
}

/* ------------------------------------------------------------------ */
/* 2. Text Counters & Time Calculators                                */
/* ------------------------------------------------------------------ */

export interface TextMetrics {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
}

export function calculateTextMetrics(text: string, wpm = 150, readingWpm = 220): TextMetrics {
  const clean = text.trim();
  if (!clean) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const words = clean.split(/\s+/).filter(Boolean).length;
  const sentences = clean.split(/[.!?]+/).filter((s) => s.trim().length > 0).length || 1;
  const paragraphs = clean.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || 1;

  const readingTimeMinutes = words / Math.max(50, readingWpm);
  const speakingTimeMinutes = words / Math.max(50, wpm);

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    readingTimeMinutes,
    speakingTimeMinutes,
  };
}

export function wordsToSpeechMinutes(words: number, speedMultiplier = 1.0): { minutes: number; seconds: number; formatted: string } {
  const baseWpm = 150 * Math.max(0.2, speedMultiplier);
  const totalSeconds = Math.round((words / baseWpm) * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${minutes}m ${seconds}s`;
  return { minutes, seconds, formatted };
}

export function minutesToWords(minutes: number, speedMultiplier = 1.0): number {
  const baseWpm = 150 * Math.max(0.2, speedMultiplier);
  return Math.round(minutes * baseWpm);
}

/* ------------------------------------------------------------------ */
/* 3. Subtitle Converter Utilities (SRT <-> VTT)                      */
/* ------------------------------------------------------------------ */

export function srtToVtt(srtContent: string): string {
  const normalized = srtContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  // Replace comma decimal separators in timestamps with dots (00:01:20,000 -> 00:01:20.000)
  const vttTimestamps = normalized.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
  return `WEBVTT\n\n${vttTimestamps.trim()}\n`;
}

export function vttToSrt(vttContent: string): string {
  const normalized = vttContent
    .replace(/^WEBVTT[^\n]*\n+/i, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  // Replace dot decimal separators in timestamps with commas (00:01:20.000 -> 00:01:20,000)
  return normalized.replace(/(\d{2}:\d{2}:\d{2})\.(\d{3})/g, "$1,$2").trim() + "\n";
}

export function stripSubtitleTimestamps(subContent: string): string {
  return subContent
    .replace(/^WEBVTT[^\n]*\n+/i, "")
    .replace(/\d+\n\d{2}:\d{2}:\d{2}[,\.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,\.]\d{3}[^\n]*/g, "")
    .replace(/\d{2}:\d{2}:\d{2}[,\.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,\.]\d{3}[^\n]*/g, "")
    .replace(/^\d+$/gm, "")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();
}

/* ------------------------------------------------------------------ */
/* 4. Web Audio Buffer Helpers (Trimmer, Merger, Silence Generator)   */
/* ------------------------------------------------------------------ */

export function createSilenceAudioBlob(durationSeconds: number, sampleRate = 44100): Blob {
  const numChannels = 1;
  const numFrames = Math.max(1, Math.round(durationSeconds * sampleRate));
  const buffer = new ArrayBuffer(44 + numFrames * 2);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + numFrames * 2, true);
  writeString(view, 8, "WAVE");

  // fmt subchunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true); // 16-bit

  // data subchunk
  writeString(view, 36, "data");
  view.setUint32(40, numFrames * 2, true);

  // PCM data is all 0 (silence)
  return new Blob([view], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
