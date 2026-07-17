import { describe, it, expect } from "vitest";
import {
  DEFAULT_PREFS,
  EMPTY_STATS,
  ImportDataError,
  getPrefs,
  getStats,
  importAllData,
  prefsSchema,
  presetSchema,
} from "./storage";

/**
 * These run in jsdom, which has no IndexedDB. Reads must degrade to defaults
 * rather than throw, and imports must validate before touching storage.
 */
describe("storage graceful degradation", () => {
  it("returns default prefs when storage is unavailable or empty", async () => {
    await expect(getPrefs()).resolves.toEqual(DEFAULT_PREFS);
  });

  it("returns empty stats when storage is unavailable or empty", async () => {
    await expect(getStats()).resolves.toEqual(EMPTY_STATS);
  });
});

describe("importAllData validation", () => {
  it("rejects text that is not JSON", async () => {
    await expect(importAllData("not json")).rejects.toBeInstanceOf(
      ImportDataError
    );
  });

  it("rejects JSON that is not a MK VoiceKit export", async () => {
    await expect(
      importAllData(JSON.stringify({ hello: "world" }))
    ).rejects.toBeInstanceOf(ImportDataError);
  });
});

describe("schemas", () => {
  it("accepts the default prefs", () => {
    expect(prefsSchema.safeParse(DEFAULT_PREFS).success).toBe(true);
  });

  it("requires a preset name", () => {
    const invalid = {
      id: "1",
      name: "",
      voiceURI: null,
      voiceName: "x",
      lang: "en",
      rate: 1,
      pitch: 1,
      volume: 1,
      createdAt: 0,
    };
    expect(presetSchema.safeParse(invalid).success).toBe(false);
  });
});
