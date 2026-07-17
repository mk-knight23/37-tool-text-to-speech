import { describe, it, expect } from "vitest";
import { parseSubtitles } from "./subtitles";

describe("parseSubtitles", () => {
  it("strips SRT cue numbers and timestamps", () => {
    const srt = [
      "1",
      "00:00:01,000 --> 00:00:04,000",
      "Hello there.",
      "",
      "2",
      "00:00:05,000 --> 00:00:08,000",
      "General Kenobi.",
      "",
    ].join("\n");
    expect(parseSubtitles(srt, "srt")).toBe("Hello there. General Kenobi.");
  });

  it("strips VTT header, cue tags and timestamps", () => {
    const vtt = [
      "WEBVTT",
      "",
      "00:00:01.000 --> 00:00:04.000",
      "<i>Hello</i> there.",
      "",
      "00:00:05.000 --> 00:00:08.000",
      "Nice to meet you.",
      "",
    ].join("\n");
    expect(parseSubtitles(vtt, "vtt")).toBe("Hello there. Nice to meet you.");
  });

  it("de-duplicates rolling repeated captions", () => {
    const srt = [
      "1",
      "00:00:01,000 --> 00:00:02,000",
      "Same line.",
      "",
      "2",
      "00:00:02,000 --> 00:00:03,000",
      "Same line.",
      "",
    ].join("\n");
    expect(parseSubtitles(srt, "srt")).toBe("Same line.");
  });
});
