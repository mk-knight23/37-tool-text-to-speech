import { beforeEach, describe, expect, it } from "vitest";
import { LOAD_TEXT_KEY, stashTextForWorkspace, takeStashedText } from "./handoff";

describe("text handoff via sessionStorage", () => {
  beforeEach(() => sessionStorage.clear());

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
});
