import { describe, it, expect } from "vitest";
import { segmentText } from "./segment";

describe("segmentText", () => {
  it("returns empty structures for empty input", () => {
    const result = segmentText("   \n\n  ");
    expect(result.sentences).toHaveLength(0);
    expect(result.paragraphs).toHaveLength(0);
  });

  it("splits paragraphs on newlines and sentences within them", () => {
    const text = "First sentence. Second sentence.\nA new paragraph here.";
    const { sentences, paragraphs } = segmentText(text);
    expect(paragraphs).toHaveLength(2);
    expect(sentences.length).toBeGreaterThanOrEqual(3);
    expect(sentences[0].paragraphIndex).toBe(0);
    expect(sentences[sentences.length - 1].paragraphIndex).toBe(1);
  });

  it("keeps offsets that map back to the source text", () => {
    const text = "Hello world. Goodbye now.";
    const { sentences } = segmentText(text);
    for (const sentence of sentences) {
      expect(text.slice(sentence.start, sentence.end)).toBe(sentence.text);
    }
  });

  it("assigns a stable flat index", () => {
    const { sentences } = segmentText("One. Two. Three.");
    expect(sentences.map((s) => s.index)).toEqual(
      sentences.map((_, i) => i)
    );
  });

  it("links paragraphs to their first and last sentence", () => {
    const { sentences, paragraphs } = segmentText(
      "A one. A two.\nB one. B two. B three."
    );
    const second = paragraphs[1];
    expect(sentences[second.firstSentence].paragraphIndex).toBe(1);
    expect(sentences[second.lastSentence].paragraphIndex).toBe(1);
  });
});
