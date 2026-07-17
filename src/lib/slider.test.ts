import { describe, it, expect } from "vitest";
import { coerceSliderValue } from "./slider";

/**
 * Regression guard for the legacy string-coercion bug: range inputs bound
 * without `.number` produced strings, which broke `.toFixed` and were assigned
 * straight onto utterance properties. coerceSliderValue must always return a
 * clamped, step-quantized NUMBER.
 */
describe("coerceSliderValue", () => {
  it("returns a number when given a numeric string (the legacy bug)", () => {
    const result = coerceSliderValue("1.5", 0.5, 3, 0.1);
    expect(typeof result).toBe("number");
    expect(result).toBe(1.5);
  });

  it("returns a number when given a number", () => {
    expect(coerceSliderValue(1.2, 0.5, 3, 0.1)).toBe(1.2);
  });

  it("clamps below the minimum", () => {
    expect(coerceSliderValue("-4", 0.5, 3, 0.1)).toBe(0.5);
  });

  it("clamps above the maximum", () => {
    expect(coerceSliderValue(99, 0.5, 3, 0.1)).toBe(3);
  });

  it("quantizes to the step without binary drift", () => {
    // 0.1 * 7 = 0.7000000000000001 without rounding.
    expect(coerceSliderValue(0.7, 0, 1, 0.1)).toBe(0.7);
    expect(coerceSliderValue(0.30000000000000004, 0, 1, 0.1)).toBe(0.3);
  });

  it("falls back to the minimum for non-numeric input", () => {
    expect(coerceSliderValue("abc", 0.5, 3, 0.1)).toBe(0.5);
    expect(coerceSliderValue(Number.NaN, 0, 1, 0.05)).toBe(0);
  });

  it("respects a coarser step", () => {
    expect(coerceSliderValue(0.13, 0, 1, 0.05)).toBe(0.15);
  });
});
