import { describe, it, expect } from "vitest";
import { isInteractiveTarget } from "./shortcuts";

describe("isInteractiveTarget", () => {
  it("treats form and interactive elements as interactive", () => {
    for (const tag of ["input", "textarea", "select", "button", "a"]) {
      expect(isInteractiveTarget(document.createElement(tag))).toBe(true);
    }
  });

  it("treats plain containers as non-interactive", () => {
    expect(isInteractiveTarget(document.createElement("div"))).toBe(false);
    expect(isInteractiveTarget(document.createElement("p"))).toBe(false);
  });

  it("respects widget roles", () => {
    const slider = document.createElement("div");
    slider.setAttribute("role", "slider");
    expect(isInteractiveTarget(slider)).toBe(true);

    const combobox = document.createElement("div");
    combobox.setAttribute("role", "combobox");
    expect(isInteractiveTarget(combobox)).toBe(true);
  });

  it("treats anything inside a dialog as interactive", () => {
    const dialog = document.createElement("dialog");
    const span = document.createElement("span");
    dialog.appendChild(span);
    expect(isInteractiveTarget(span)).toBe(true);
  });

  it("returns false for a null target", () => {
    expect(isInteractiveTarget(null)).toBe(false);
  });
});
