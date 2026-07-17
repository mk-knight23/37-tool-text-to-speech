import { describe, it, expect } from "vitest";
import { stripMarkdown } from "./markdown";

describe("stripMarkdown", () => {
  it("removes inline formatting", () => {
    const { text } = stripMarkdown("Some **bold** and _italic_ and `code`.");
    expect(text).toBe("Some bold and italic and code.");
  });

  it("captures headings as chapters and keeps them as text", () => {
    const { text, chapters } = stripMarkdown(
      "# Introduction\n\nBody text here.\n\n## Details\n\nMore text."
    );
    expect(chapters.map((c) => c.title)).toEqual(["Introduction", "Details"]);
    expect(chapters[0].level).toBe(1);
    expect(chapters[1].level).toBe(2);
    expect(text).toContain("Body text here.");
    expect(text).not.toContain("#");
  });

  it("keeps link text and drops the URL", () => {
    const { text } = stripMarkdown("See [the docs](https://example.com).");
    expect(text).toBe("See the docs.");
  });

  it("skips fenced code blocks", () => {
    const { text } = stripMarkdown(
      "Before.\n\n```\nconst x = 1;\n```\n\nAfter."
    );
    expect(text).toContain("Before.");
    expect(text).toContain("After.");
    expect(text).not.toContain("const x");
  });

  it("chapter offsets point at the title in the output", () => {
    const { text, chapters } = stripMarkdown("# Title\n\nBody.");
    const chapter = chapters[0];
    expect(text.slice(chapter.offset, chapter.offset + chapter.title.length)).toBe(
      "Title"
    );
  });
});
