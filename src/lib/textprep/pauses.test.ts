import { describe, it, expect } from "vitest";
import { normalizePauses } from "./pauses";

describe("normalizePauses", () => {
  it("turns dashes into comma pauses", () => {
    expect(normalizePauses("Hello — world")).toBe("Hello, world");
    expect(normalizePauses("wait -- stop")).toBe("wait, stop");
  });

  it("turns ellipses into full-stop pauses", () => {
    expect(normalizePauses("Well... okay")).toBe("Well. okay");
    expect(normalizePauses("Hmm… yes")).toBe("Hmm. yes");
  });

  it("turns semicolons and colons into comma pauses", () => {
    expect(normalizePauses("one; two")).toBe("one, two");
    expect(normalizePauses("note: this")).toBe("note, this");
  });

  it("collapses shouty punctuation runs", () => {
    expect(normalizePauses("really!!!")).toBe("really!");
  });
});
