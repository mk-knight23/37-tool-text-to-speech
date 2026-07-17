import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockStorage } from "../test/mockStorage";
import { LOAD_TEXT_KEY, stashTextForWorkspace, takeStashedText } from "./handoff";

describe("text handoff via sessionStorage", () => {
  // Stub sessionStorage so the suite is deterministic regardless of the
  // runtime's ambient Web Storage support.
  beforeEach(() => vi.stubGlobal("sessionStorage", createMockStorage()));
  afterEach(() => vi.unstubAllGlobals());

  it("returns null when nothing has been stashed", () => {
    expect(takeStashedText()).toBeNull();
  });

  it("returns the stashed text once, then clears it (one-shot)", () => {
    // Arrange
    stashTextForWorkspace("resume this article");

    // Act
    const first = takeStashedText();
    const second = takeStashedText();

    // Assert
    expect(first).toBe("resume this article");
    expect(second).toBeNull();
    expect(sessionStorage.getItem(LOAD_TEXT_KEY)).toBeNull();
  });

  it("keeps text out of the URL by storing it under a fixed key", () => {
    stashTextForWorkspace("private draft");
    expect(sessionStorage.getItem(LOAD_TEXT_KEY)).toBe("private draft");
  });

  it("degrades to a no-op when sessionStorage is unavailable", () => {
    vi.unstubAllGlobals();
    vi.stubGlobal("sessionStorage", undefined);
    // Best-effort: writing does not throw and reading returns null.
    expect(() => stashTextForWorkspace("x")).not.toThrow();
    expect(takeStashedText()).toBeNull();
  });
});
