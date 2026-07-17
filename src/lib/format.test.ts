import { describe, it, expect } from "vitest";
import { bucketChars, excerpt, formatDuration, formatRelativeTime } from "./format";

describe("formatDuration", () => {
  it("formats seconds, minutes and hours", () => {
    expect(formatDuration(5000)).toBe("5s");
    expect(formatDuration(65_000)).toBe("1m 05s");
    expect(formatDuration(3_600_000)).toBe("1h 00m");
  });
});

describe("formatRelativeTime", () => {
  const now = 1_000_000_000_000;
  it("describes recent times", () => {
    expect(formatRelativeTime(now - 10_000, now)).toBe("just now");
    expect(formatRelativeTime(now - 120_000, now)).toBe("2 min ago");
    expect(formatRelativeTime(now - 2 * 3_600_000, now)).toBe("2 h ago");
  });
});

describe("excerpt", () => {
  it("collapses whitespace and leaves short text intact", () => {
    expect(excerpt("  hello   world ")).toBe("hello world");
  });
  it("truncates long text with an ellipsis", () => {
    const result = excerpt("a".repeat(200), 140);
    expect(result.length).toBeLessThanOrEqual(140);
    expect(result.endsWith("…")).toBe(true);
  });
});

describe("bucketChars", () => {
  it("buckets counts into ranges", () => {
    expect(bucketChars(500)).toBe("<1k");
    expect(bucketChars(5_000)).toBe("1k-10k");
    expect(bucketChars(50_000)).toBe("10k-100k");
    expect(bucketChars(500_000)).toBe("100k+");
  });
});
