import { describe, expect, test } from "vitest";
import { SPECS, getSpec } from "./capabilities";
import { CAPABILITIES, CAPABILITY_IDS, MAX_INPUT_CHARS } from "./catalog";

describe("capability specs", () => {
  test("every catalog capability has a matching spec with the same mode", () => {
    for (const meta of CAPABILITIES) {
      const spec = getSpec(meta.id);
      expect(spec).toBeDefined();
      expect(spec.mode).toBe(meta.mode);
      if (spec.mode === "object") {
        expect("outputSchema" in spec).toBe(true);
      }
    }
  });

  test("no spec exists for an id missing from the catalog", () => {
    expect(Object.keys(SPECS).sort()).toEqual([...CAPABILITY_IDS].sort());
  });

  test("text field rejects empty and whitespace-only input", () => {
    const spec = getSpec("summarize");
    expect(spec.inputSchema.safeParse({ text: "" }).success).toBe(false);
    expect(spec.inputSchema.safeParse({ text: "   " }).success).toBe(false);
    expect(spec.inputSchema.safeParse({ text: "hello" }).success).toBe(true);
  });

  test("text field rejects input over the maximum length", () => {
    const spec = getSpec("simplify");
    const tooLong = "a".repeat(MAX_INPUT_CHARS + 1);
    expect(spec.inputSchema.safeParse({ text: tooLong }).success).toBe(false);
    const atLimit = "a".repeat(MAX_INPUT_CHARS);
    expect(spec.inputSchema.safeParse({ text: atLimit }).success).toBe(true);
  });

  test("translate requires a non-empty target language", () => {
    const spec = getSpec("translate");
    expect(spec.inputSchema.safeParse({ text: "hi" }).success).toBe(false);
    expect(
      spec.inputSchema.safeParse({ text: "hi", targetLanguage: "" }).success
    ).toBe(false);
    expect(
      spec.inputSchema.safeParse({ text: "hi", targetLanguage: "Spanish" })
        .success
    ).toBe(true);
  });

  test("change-reading-level only accepts known levels", () => {
    const spec = getSpec("change-reading-level");
    expect(
      spec.inputSchema.safeParse({ text: "hi", level: "general" }).success
    ).toBe(true);
    expect(
      spec.inputSchema.safeParse({ text: "hi", level: "phd" }).success
    ).toBe(false);
  });

  test("build produces a system prompt and passes the text through", () => {
    const spec = getSpec("rewrite-for-natural-speech");
    const built = spec.build({ text: "The quick brown fox." });
    expect(built.system.length).toBeGreaterThan(0);
    expect(built.prompt).toBe("The quick brown fox.");
  });

  test("translate embeds the target language in the system prompt", () => {
    const spec = getSpec("translate");
    const built = spec.build({ text: "Hello", targetLanguage: "French" });
    expect(built.system).toContain("French");
  });

  test("object output schema validates and rejects malformed shapes", () => {
    const spec = getSpec("chapter-generation");
    if (spec.mode !== "object") throw new Error("expected object mode");
    expect(
      spec.outputSchema.safeParse({
        chapters: [{ title: "Intro", summary: "Sets the scene." }],
      }).success
    ).toBe(true);
    expect(spec.outputSchema.safeParse({ chapters: [] }).success).toBe(false);
    expect(spec.outputSchema.safeParse({ chapters: [{ title: "x" }] }).success).toBe(
      false
    );
  });

  test("pronunciation output accepts an empty list", () => {
    const spec = getSpec("pronunciation-suggestions");
    if (spec.mode !== "object") throw new Error("expected object mode");
    expect(spec.outputSchema.safeParse({ items: [] }).success).toBe(true);
  });
});
