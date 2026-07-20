/**
 * File import dispatcher: validates type and size, routes to the right
 * parser. All parsing happens in the browser; files never leave the device.
 */

import { stripMarkdown, type Chapter } from "./markdown";
import { parseSubtitles } from "./subtitles";

export type ImportKind = "txt" | "md" | "pdf" | "srt" | "vtt" | "docx" | "epub";

export interface ImportResult {
  text: string;
  chapters: Chapter[];
  kind: ImportKind;
  fileName: string;
  /** Present for PDFs so the UI can report page counts honestly. */
  pages?: number;
  headings?: Array<{ title: string; charIndex: number; level: number }>;
}

export const MAX_IMPORT_BYTES = 10 * 1024 * 1024; // 10 MB

export class ImportError extends Error {}

const KIND_BY_EXTENSION: Record<string, ImportKind> = {
  txt: "txt",
  text: "txt",
  md: "md",
  markdown: "md",
  pdf: "pdf",
  srt: "srt",
  vtt: "vtt",
  docx: "docx",
  epub: "epub",
};

export const ACCEPTED_EXTENSIONS = ".txt,.md,.markdown,.pdf,.srt,.vtt,.docx,.epub";

export function detectKind(fileName: string): ImportKind | null {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return KIND_BY_EXTENSION[extension] ?? null;
}

export async function importFile(file: File): Promise<ImportResult> {
  const kind = detectKind(file.name);
  if (!kind) {
    throw new ImportError(
      "Unsupported file type. Use .txt, .md, .pdf, .srt or .vtt."
    );
  }
  if (file.size > MAX_IMPORT_BYTES) {
    throw new ImportError("File is larger than 10 MB. Split it and try again.");
  }
  if (file.size === 0) {
    throw new ImportError("That file is empty.");
  }

  if (kind === "pdf") {
    const { extractPdfText } = await import("./pdf");
    let extraction;
    try {
      extraction = await extractPdfText(await file.arrayBuffer());
    } catch {
      throw new ImportError(
        "Could not read this PDF. It may be corrupted or password-protected."
      );
    }
    if (extraction.text.length === 0) {
      throw new ImportError(
        "No extractable text in this PDF — it is likely scanned images. MK VoiceKit does not do OCR (yet)."
      );
    }
    return {
      text: extraction.text,
      chapters: [],
      kind,
      fileName: file.name,
      pages: extraction.pages,
    };
  }

  if (kind === "docx") {
    const { parseDocx } = await import("./docx");
    try {
      return await parseDocx(file);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new ImportError(msg || "Could not read this Word document.");
    }
  }

  if (kind === "epub") {
    const { parseEpub } = await import("./epub");
    try {
      return await parseEpub(file);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new ImportError(msg || "Could not read this EPUB ebook.");
    }
  }

  const raw = await file.text();

  if (kind === "md") {
    const stripped = stripMarkdown(raw);
    if (stripped.text.length === 0) {
      throw new ImportError("No readable text found in this Markdown file.");
    }
    return { ...stripped, kind, fileName: file.name };
  }

  if (kind === "srt" || kind === "vtt") {
    const text = parseSubtitles(raw, kind);
    if (text.length === 0) {
      throw new ImportError("No subtitle text found in this file.");
    }
    return { text, chapters: [], kind, fileName: file.name };
  }

  const text = raw.trim();
  if (text.length === 0) {
    throw new ImportError("No readable text found in this file.");
  }
  return { text, chapters: [], kind, fileName: file.name };
}
