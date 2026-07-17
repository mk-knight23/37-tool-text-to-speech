/**
 * Markdown -> speakable plain text (client-side, no dependencies).
 * Headings are kept as text AND recorded as chapter candidates with their
 * character offsets in the output, feeding the chapter timeline.
 */

export interface Chapter {
  title: string;
  level: number;
  /** Character offset of the chapter title in the stripped output text. */
  offset: number;
}

export interface StrippedMarkdown {
  text: string;
  chapters: Chapter[];
}

function stripInline(line: string): string {
  let out = line;
  // Images -> alt text.
  out = out.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");
  // Links -> link text.
  out = out.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  // Reference-style links -> text.
  out = out.replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1");
  // Bold/italic/strikethrough markers.
  out = out.replace(/(\*\*\*|___)([^*_]+)\1/g, "$2");
  out = out.replace(/(\*\*|__)([^*_]+)\1/g, "$2");
  out = out.replace(/(\*|_)([^*_]+)\1/g, "$2");
  out = out.replace(/~~([^~]+)~~/g, "$1");
  // Inline code.
  out = out.replace(/`([^`]+)`/g, "$1");
  // Raw HTML tags.
  out = out.replace(/<[^>\n]+>/g, "");
  return out;
}

export function stripMarkdown(markdown: string): StrippedMarkdown {
  const lines = markdown.split(/\r?\n/);
  const outParts: string[] = [];
  const chapters: Chapter[] = [];
  let inFence = false;
  let offset = 0;

  const push = (text: string) => {
    outParts.push(text);
    offset += text.length;
  };

  for (const rawLine of lines) {
    const line = rawLine;

    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    // Horizontal rules and table separator rows: drop.
    if (/^\s*([-*_]\s*){3,}$/.test(line)) continue;
    if (/^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(line) && line.includes("-")) continue;

    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (headingMatch) {
      const title = stripInline(headingMatch[2]).replace(/\s*#+\s*$/, "").trim();
      if (title.length > 0) {
        if (outParts.length > 0) push("\n\n");
        chapters.push({ title, level: headingMatch[1].length, offset });
        push(`${title}.`);
      }
      continue;
    }

    let text = line;
    // Blockquotes.
    text = text.replace(/^\s*>+\s?/, "");
    // List markers (unordered and ordered).
    text = text.replace(/^\s*[-*+]\s+/, "");
    text = text.replace(/^\s*\d+[.)]\s+/, "");
    // Task list checkboxes.
    text = text.replace(/^\[[ xX]\]\s+/, "");
    // Table rows -> cells joined with commas.
    if (/^\s*\|.*\|\s*$/.test(text)) {
      text = text
        .replace(/^\s*\||\|\s*$/g, "")
        .split("|")
        .map((cell) => cell.trim())
        .filter(Boolean)
        .join(", ");
    }
    text = stripInline(text).trim();

    if (text.length === 0) {
      if (outParts.length > 0 && !outParts[outParts.length - 1].endsWith("\n\n")) {
        push("\n\n");
      }
      continue;
    }

    if (outParts.length > 0 && !outParts[outParts.length - 1].endsWith("\n\n")) {
      push(" ");
    }
    push(text);
  }

  const text = outParts
    .join("")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Offsets were tracked against the unnormalized string; recompute against
  // the final text by locating each title (cheap and exact for our output).
  let cursor = 0;
  const fixedChapters = chapters.map((chapter) => {
    const found = text.indexOf(chapter.title, cursor);
    const at = found >= 0 ? found : 0;
    cursor = found >= 0 ? found + chapter.title.length : cursor;
    return { ...chapter, offset: at };
  });

  return { text, chapters: fixedChapters };
}
