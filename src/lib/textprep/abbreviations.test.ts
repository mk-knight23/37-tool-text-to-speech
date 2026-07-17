import { describe, it, expect } from "vitest";
import { expandAbbreviations } from "./abbreviations";

describe("expandAbbreviations", () => {
  it("expands titles before a capitalized name", () => {
    expect(expandAbbreviations("Dr. Smith arrived")).toBe(
      "Doctor Smith arrived"
    );
  });

  it("does not expand a title that is not before a name", () => {
    expect(expandAbbreviations("ask the Dr. about it")).toBe(
      "ask the Dr. about it"
    );
  });

  it("expands e.g. and i.e. keeping a pause", () => {
    expect(expandAbbreviations("fruit, e.g. apples")).toBe(
      "fruit, for example, apples"
    );
    expect(expandAbbreviations("i.e. this")).toBe("that is, this");
  });

  it("expands etc., vs. and ampersands", () => {
    expect(expandAbbreviations("apples, etc.")).toBe("apples, et cetera");
    expect(expandAbbreviations("cats vs. dogs")).toBe("cats versus dogs");
    expect(expandAbbreviations("R & D")).toBe("R and D");
  });
});
