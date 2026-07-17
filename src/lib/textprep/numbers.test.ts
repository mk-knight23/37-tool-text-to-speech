import { describe, it, expect } from "vitest";
import { expandNumbers, integerToWords, ordinalToWords } from "./numbers";

describe("integerToWords", () => {
  it("handles small and compound numbers", () => {
    expect(integerToWords(0)).toBe("zero");
    expect(integerToWords(21)).toBe("twenty-one");
    expect(integerToWords(100)).toBe("one hundred");
    expect(integerToWords(1234)).toBe("one thousand two hundred thirty-four");
  });
});

describe("ordinalToWords", () => {
  it("uses irregular and regular ordinals", () => {
    expect(ordinalToWords(1)).toBe("first");
    expect(ordinalToWords(2)).toBe("second");
    expect(ordinalToWords(5)).toBe("fifth");
    expect(ordinalToWords(11)).toBe("eleventh");
    expect(ordinalToWords(20)).toBe("twentieth");
  });
});

describe("expandNumbers", () => {
  it("expands plain cardinals", () => {
    expect(expandNumbers("I ate 3 apples")).toBe("I ate three apples");
  });

  it("expands currency with cents", () => {
    expect(expandNumbers("It costs $5.50")).toBe(
      "It costs five dollars and fifty cents"
    );
    expect(expandNumbers("Just $1")).toBe("Just one dollar");
  });

  it("expands percentages", () => {
    expect(expandNumbers("up 50%")).toBe("up fifty percent");
  });

  it("expands ordinals", () => {
    expect(expandNumbers("the 1st time")).toBe("the first time");
  });

  it("reads four-digit years as years", () => {
    expect(expandNumbers("in 1999")).toBe("in nineteen ninety-nine");
    expect(expandNumbers("by 2005")).toBe("by two thousand five");
  });

  it("expands decimals digit by digit after the point", () => {
    expect(expandNumbers("pi is 3.14")).toBe("pi is three point one four");
  });
});
