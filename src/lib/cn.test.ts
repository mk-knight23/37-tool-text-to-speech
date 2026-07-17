import { describe, it, expect } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins truthy class names with a single space", () => {
    // Arrange
    const parts = ["a", "b", "c"];

    // Act
    const result = cn(...parts);

    // Assert
    expect(result).toBe("a b c");
  });

  it("drops falsy values (false, null, undefined, empty string)", () => {
    // Arrange / Act
    const result = cn("a", false, null, undefined, "", "b");

    // Assert
    expect(result).toBe("a b");
  });

  it("returns an empty string when given no truthy parts", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});
