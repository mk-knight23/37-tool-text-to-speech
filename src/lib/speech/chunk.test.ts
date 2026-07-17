import { describe, it, expect } from "vitest";
import { chunkSentence } from "./chunk";

describe("chunkSentence", () => {
  it("keeps a short sentence as a single chunk", () => {
    const chunks = chunkSentence("A short sentence.");
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual({ text: "A short sentence.", offset: 0 });
  });

  it("splits a long sentence into chunks within the limit", () => {
    const sentence = "word ".repeat(80).trim(); // ~399 chars
    const chunks = chunkSentence(sentence, 50);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.text.length).toBeLessThanOrEqual(50);
    }
  });

  it("produces contiguous offsets that reconstruct the sentence", () => {
    const sentence =
      "Clause one, clause two; clause three: and a much longer trailing clause that keeps going and going.";
    const chunks = chunkSentence(sentence, 30);
    const rebuilt = chunks.map((c) => c.text).join("");
    expect(rebuilt).toBe(sentence);
    let cursor = 0;
    for (const chunk of chunks) {
      expect(chunk.offset).toBe(cursor);
      cursor += chunk.text.length;
    }
  });

  it("prefers clause breaks when splitting", () => {
    const sentence = "Alpha beta gamma delta, epsilon zeta eta theta iota.";
    const chunks = chunkSentence(sentence, 30);
    // First chunk should end at the comma clause boundary.
    expect(chunks[0].text.trimEnd().endsWith(",")).toBe(true);
  });
});
