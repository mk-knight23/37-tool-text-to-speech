import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockStorage } from "../test/mockStorage";
import {
  applyTheme,
  isThemeMode,
  readStoredTheme,
  resolveTheme,
  THEME_KEY,
} from "./theme";

describe("isThemeMode", () => {
  it("accepts the three valid modes", () => {
    expect(isThemeMode("light")).toBe(true);
    expect(isThemeMode("dark")).toBe(true);
    expect(isThemeMode("system")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isThemeMode("auto")).toBe(false);
    expect(isThemeMode(null)).toBe(false);
    expect(isThemeMode(42)).toBe(false);
  });
});

describe("readStoredTheme", () => {
  it("returns 'system' when localStorage is unavailable", () => {
    // No stub: this runtime has no localStorage, so the guard degrades.
    expect(readStoredTheme()).toBe("system");
  });

  describe("with storage available", () => {
    beforeEach(() => vi.stubGlobal("localStorage", createMockStorage()));
    afterEach(() => vi.unstubAllGlobals());

    it("returns 'system' when nothing is stored", () => {
      expect(readStoredTheme()).toBe("system");
    });

    it("returns the stored mode when valid", () => {
      // Arrange
      localStorage.setItem(THEME_KEY, "dark");

      // Act / Assert
      expect(readStoredTheme()).toBe("dark");
    });

    it("falls back to 'system' when the stored value is invalid", () => {
      localStorage.setItem(THEME_KEY, "neon");
      expect(readStoredTheme()).toBe("system");
    });
  });
});

describe("resolveTheme", () => {
  it("returns the concrete mode unchanged for light and dark", () => {
    expect(resolveTheme("light")).toBe("light");
    expect(resolveTheme("dark")).toBe("dark");
  });

  it("resolves 'system' to 'light' when matchMedia is unavailable (jsdom default)", () => {
    // jsdom does not implement matchMedia; systemPrefersDark guards for it.
    expect(resolveTheme("system")).toBe("light");
  });
});

describe("applyTheme", () => {
  afterEach(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "";
  });

  it("adds the dark class and colorScheme for dark mode", () => {
    // Act
    applyTheme("dark");

    // Assert
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("removes the dark class for light mode", () => {
    // Arrange
    document.documentElement.classList.add("dark");

    // Act
    applyTheme("light");

    // Assert
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
  });
});
