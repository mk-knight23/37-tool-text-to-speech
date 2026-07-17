import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockStorage } from "../test/mockStorage";
import { getConsent, isAnalyticsEnabled, setConsent, track } from "./analytics";

describe("track (analytics no-op outside production/consent)", () => {
  beforeEach(() => {
    window.dataLayer = [];
  });

  it("does not push events when analytics is disabled (NODE_ENV is 'test')", () => {
    // Arrange: vitest runs with NODE_ENV=test, so analytics is off.
    // Act
    track("tool_started", { chars: 1234 });

    // Assert
    expect(window.dataLayer).toHaveLength(0);
  });

  it("stays a no-op even for consent-relevant events", () => {
    track("ai_started");
    track("quota_reached");
    expect(window.dataLayer).toHaveLength(0);
  });
});

describe("isAnalyticsEnabled", () => {
  it("is false in the test environment (NODE_ENV !== production)", () => {
    expect(isAnalyticsEnabled()).toBe(false);
  });
});

describe("consent storage", () => {
  beforeEach(() => vi.stubGlobal("localStorage", createMockStorage()));
  afterEach(() => vi.unstubAllGlobals());

  it("returns null before the user has chosen (default declined)", () => {
    expect(getConsent()).toBeNull();
  });

  it("persists a granted choice and reads it back", () => {
    // Act
    setConsent("granted");

    // Assert
    expect(getConsent()).toBe("granted");
  });

  it("persists a denied choice and reads it back", () => {
    setConsent("denied");
    expect(getConsent()).toBe("denied");
  });

  it("emits a vk-consent-changed event when consent changes", () => {
    // Arrange
    const listener = vi.fn();
    window.addEventListener("vk-consent-changed", listener);

    // Act
    setConsent("granted");

    // Assert
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener("vk-consent-changed", listener);
  });

  it("ignores an unrecognised stored value and reports no consent", () => {
    localStorage.setItem("vk-consent", "maybe");
    expect(getConsent()).toBeNull();
  });
});
