import { describe, expect, it } from "vitest";
import {
  ACCEPTED_EXTENSIONS,
  ImportError,
  MAX_IMPORT_BYTES,
  detectKind,
  importFile,
} from "./file";

describe("detectKind", () => {
  it("maps known extensions to import kinds (case-insensitive)", () => {
    expect(detectKind("notes.txt")).toBe("txt");
    expect(detectKind("NOTES.TXT")).toBe("txt");
    expect(detectKind("readme.md")).toBe("md");
    expect(detectKind("readme.markdown")).toBe("md");
    expect(detectKind("book.pdf")).toBe("pdf");
    expect(detectKind("movie.srt")).toBe("srt");
    expect(detectKind("movie.vtt")).toBe("vtt");
  });

  it("returns null for an unsupported or missing extension", () => {
    expect(detectKind("archive.zip")).toBeNull();
    expect(detectKind("noextension")).toBeNull();
  });

  it("lists every accepted extension in ACCEPTED_EXTENSIONS", () => {
    expect(ACCEPTED_EXTENSIONS).toBe(".txt,.md,.markdown,.pdf,.srt,.vtt");
  });
});

describe("importFile validation", () => {
  it("rejects an unsupported file type", async () => {
    const file = new File(["data"], "archive.zip");
    await expect(importFile(file)).rejects.toBeInstanceOf(ImportError);
  });

  it("rejects a file larger than 10 MB without reading it", async () => {
    // Cast a lightweight stand-in so we don't allocate 10 MB in the test.
    const huge = { name: "big.txt", size: MAX_IMPORT_BYTES + 1 } as unknown as File;
    await expect(importFile(huge)).rejects.toThrow(/larger than 10 MB/);
  });

  it("rejects an empty file", async () => {
    const empty = { name: "empty.txt", size: 0 } as unknown as File;
    await expect(importFile(empty)).rejects.toThrow(/empty/);
  });

  it("rejects a whitespace-only text file", async () => {
    const file = new File(["   \n\t  "], "blank.txt");
    await expect(importFile(file)).rejects.toThrow(/No readable text/);
  });
});

describe("importFile parsing", () => {
  it("trims a plain .txt file and reports its kind", async () => {
    // Arrange
    const file = new File(["  hello world  "], "note.txt");

    // Act
    const result = await importFile(file);

    // Assert
    expect(result.text).toBe("hello world");
    expect(result.kind).toBe("txt");
    expect(result.chapters).toEqual([]);
    expect(result.fileName).toBe("note.txt");
  });

  it("strips Markdown syntax and keeps the readable body", async () => {
    // Arrange
    const file = new File(["# Title\n\nBody text here."], "doc.md");

    // Act
    const result = await importFile(file);

    // Assert
    expect(result.kind).toBe("md");
    expect(result.text).toContain("Body text here.");
    expect(result.text).not.toContain("#");
  });

  it("joins subtitle cues into speech and drops timestamps", async () => {
    // Arrange
    const srt =
      "1\n00:00:01,000 --> 00:00:04,000\nHello there.\n\n" +
      "2\n00:00:05,000 --> 00:00:08,000\nGeneral Kenobi.\n";
    const file = new File([srt], "clip.srt");

    // Act
    const result = await importFile(file);

    // Assert
    expect(result.kind).toBe("srt");
    expect(result.text).toContain("Hello there");
    expect(result.text).toContain("General Kenobi");
    expect(result.text).not.toContain("-->");
    expect(result.text).not.toContain("00:00");
  });
});
