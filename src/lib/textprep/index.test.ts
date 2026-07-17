import { describe, expect, it } from "vitest";
import {
  DEFAULT_PREP_OPTIONS,
  isPrepActive,
  prepareText,
  type PrepOptions,
} from "./index";

const OFF: PrepOptions = {
  expandNumbers: false,
  expandAbbreviations: false,
  normalizePauses: false,
};

describe("DEFAULT_PREP_OPTIONS", () => {
  it("has every transform off by default (opt-in local processing)", () => {
    expect(DEFAULT_PREP_OPTIONS).toEqual(OFF);
  });
});

describe("isPrepActive", () => {
  it("is false when no transform is enabled", () => {
    expect(isPrepActive(OFF)).toBe(false);
  });

  it("is true when any single transform is enabled", () => {
    expect(isPrepActive({ ...OFF, expandNumbers: true })).toBe(true);
    expect(isPrepActive({ ...OFF, expandAbbreviations: true })).toBe(true);
    expect(isPrepActive({ ...OFF, normalizePauses: true })).toBe(true);
  });
});

describe("prepareText", () => {
  it("returns the input unchanged when all transforms are off", () => {
    const input = "Dr. Smith has 3 dogs — and 2 cats.";
    expect(prepareText(input, OFF)).toBe(input);
  });

  it("expands numbers when only that transform is on", () => {
    const result = prepareText("I have 3 apples.", {
      ...OFF,
      expandNumbers: true,
    });
    expect(result).toContain("three");
    expect(result).not.toMatch(/\b3\b/);
  });

  it("expands abbreviations when only that transform is on", () => {
    const result = prepareText("Dr. Smith", {
      ...OFF,
      expandAbbreviations: true,
    });
    expect(result).toContain("Doctor");
  });

  it("does not mutate the caller's input string", () => {
    const input = "Dr. Smith has 3 dogs.";
    prepareText(input, { ...OFF, expandNumbers: true, expandAbbreviations: true });
    expect(input).toBe("Dr. Smith has 3 dogs.");
  });

  it("applies abbreviations before numbers so both take effect", () => {
    // "No. 5" → abbreviation ("No." → "Number") then number ("5" → "five").
    const result = prepareText("No. 5", {
      ...OFF,
      expandAbbreviations: true,
      expandNumbers: true,
    });
    expect(result).toContain("five");
  });
});
