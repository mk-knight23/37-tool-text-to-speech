import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockStorage } from "../../test/mockStorage";
import { getClientQuota, recordClientUsage } from "./quota-client";
import { DAILY_AI_LIMIT } from "./catalog";

const KEY = "vk-ai-quota";
const todayKey = () => new Date().toISOString().slice(0, 10);

describe("client-side daily AI quota", () => {
  beforeEach(() => vi.stubGlobal("localStorage", createMockStorage()));
  afterEach(() => vi.unstubAllGlobals());

  it("starts at zero usage with the full daily allowance", () => {
    const quota = getClientQuota();
    expect(quota).toEqual({
      limit: DAILY_AI_LIMIT,
      used: 0,
      remaining: DAILY_AI_LIMIT,
    });
  });

  it("increments used and decrements remaining on each recorded action", () => {
    // Act
    const first = recordClientUsage();
    const second = recordClientUsage();

    // Assert
    expect(first.used).toBe(1);
    expect(first.remaining).toBe(DAILY_AI_LIMIT - 1);
    expect(second.used).toBe(2);
    expect(second.remaining).toBe(DAILY_AI_LIMIT - 2);
    expect(getClientQuota().used).toBe(2);
  });

  it("ignores a counter stored for a previous day", () => {
    // Arrange: stale entry from another date.
    localStorage.setItem(KEY, JSON.stringify({ day: "2000-01-01", count: 12 }));

    // Act / Assert
    expect(getClientQuota().used).toBe(0);
  });

  it("clamps remaining at zero once the limit is exceeded", () => {
    // Arrange: pretend the user already blew past the limit today.
    localStorage.setItem(
      KEY,
      JSON.stringify({ day: todayKey(), count: DAILY_AI_LIMIT + 5 })
    );

    // Act / Assert
    expect(getClientQuota().remaining).toBe(0);
  });

  it("degrades to a zero-usage view when storage is unavailable", () => {
    // Remove the stub so the code hits the typeof-guard path.
    vi.unstubAllGlobals();
    expect(getClientQuota().used).toBe(0);
  });
});
