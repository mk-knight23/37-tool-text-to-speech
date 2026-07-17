import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockStorage } from "../test/mockStorage";
import {
  DEFAULT_PREFS,
  EMPTY_STATS,
  addHistoryEntry,
  clearAllData,
  deleteHistoryEntry,
  exportAllData,
  getByokKey,
  getHistoryEntry,
  getPrefs,
  getStats,
  importAllData,
  listHistory,
  listPresets,
  loadQueue,
  migrateLegacyData,
  restoreHistoryEntry,
  savePreset,
  saveQueue,
  setByokKey,
  setPrefs,
  updatePrefs,
  updateStats,
  type HistoryEntry,
  type Preset,
} from "./storage";

/**
 * Integration tests for the IndexedDB storage layer, backed by an in-memory
 * fake-indexeddb. One factory is shared for the file (the module memoises its
 * connection); clearAllData() isolates each test.
 */

function makeHistory(id: string, completedAt: number): HistoryEntry {
  return {
    id,
    text: `text ${id}`,
    excerpt: `text ${id}`,
    chars: 6,
    voiceName: "Samantha",
    voiceURI: "urn:voice:samantha",
    rate: 1,
    pitch: 1,
    volume: 1,
    durationMs: 1000,
    completedAt,
  };
}

function makePreset(id: string, createdAt: number): Preset {
  return {
    id,
    name: `Preset ${id}`,
    voiceURI: "urn:voice:samantha",
    voiceName: "Samantha",
    lang: "en-US",
    rate: 1.2,
    pitch: 1,
    volume: 1,
    createdAt,
  };
}

beforeEach(async () => {
  await clearAllData();
});

describe("prefs persistence", () => {
  it("returns defaults before anything is written", async () => {
    await expect(getPrefs()).resolves.toEqual(DEFAULT_PREFS);
  });

  it("round-trips prefs through the store", async () => {
    // Arrange
    const next = { ...DEFAULT_PREFS, defaultRate: 1.5, textScale: "large" as const };

    // Act
    await setPrefs(next);

    // Assert
    await expect(getPrefs()).resolves.toEqual(next);
  });

  it("merges a partial patch via updatePrefs", async () => {
    const updated = await updatePrefs({ autoScroll: false });
    expect(updated.autoScroll).toBe(false);
    expect(updated.defaultRate).toBe(DEFAULT_PREFS.defaultRate);
  });
});

describe("history persistence", () => {
  it("adds an entry and lists it back", async () => {
    // Act
    await addHistoryEntry(makeHistory("a", 100));

    // Assert
    const list = await listHistory();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe("a");
  });

  it("lists newest first", async () => {
    await addHistoryEntry(makeHistory("old", 100));
    await addHistoryEntry(makeHistory("new", 200));
    const list = await listHistory();
    expect(list.map((e) => e.id)).toEqual(["new", "old"]);
  });

  it("does not record history when historyEnabled is false", async () => {
    // Arrange
    await updatePrefs({ historyEnabled: false });

    // Act
    await addHistoryEntry(makeHistory("blocked", 100));

    // Assert
    await expect(listHistory()).resolves.toHaveLength(0);
  });

  it("gets and deletes a single entry", async () => {
    await addHistoryEntry(makeHistory("x", 100));
    await expect(getHistoryEntry("x")).resolves.not.toBeNull();

    await deleteHistoryEntry("x");
    await expect(getHistoryEntry("x")).resolves.toBeNull();
  });

  it("restores a previously deleted entry", async () => {
    const entry = makeHistory("restore-me", 100);
    await restoreHistoryEntry(entry);
    await expect(getHistoryEntry("restore-me")).resolves.toMatchObject({
      id: "restore-me",
    });
  });

  it("trims history to the 200 newest entries", async () => {
    // Arrange: insert 205 entries with increasing timestamps.
    for (let i = 0; i < 205; i++) {
      await addHistoryEntry(makeHistory(`e${i}`, i));
    }

    // Assert: only the newest 200 survive.
    const list = await listHistory();
    expect(list).toHaveLength(200);
    expect(list[0].id).toBe("e204");
    expect(list.some((e) => e.id === "e0")).toBe(false);
  });
});

describe("presets persistence", () => {
  it("saves and lists presets oldest-first", async () => {
    await savePreset(makePreset("p2", 200));
    await savePreset(makePreset("p1", 100));
    const list = await listPresets();
    expect(list.map((p) => p.id)).toEqual(["p1", "p2"]);
  });
});

describe("queue persistence", () => {
  it("returns an empty queue by default and round-trips items", async () => {
    await expect(loadQueue()).resolves.toEqual([]);

    const items = [{ id: "q1", title: "Chapter 1", text: "hello", addedAt: 1 }];
    await saveQueue(items);
    await expect(loadQueue()).resolves.toEqual(items);
  });
});

describe("stats persistence", () => {
  it("starts empty and accumulates via updateStats", async () => {
    await expect(getStats()).resolves.toEqual(EMPTY_STATS);

    await updateStats((s) => ({ ...s, sessions: s.sessions + 1, charactersSpoken: 42 }));
    const stats = await getStats();
    expect(stats.sessions).toBe(1);
    expect(stats.charactersSpoken).toBe(42);
  });
});

describe("BYOK key storage", () => {
  it("stores, trims and clears the key", async () => {
    await expect(getByokKey()).resolves.toBeNull();

    await setByokKey("  sk-abc  ");
    await expect(getByokKey()).resolves.toBe("sk-abc");

    await setByokKey(null);
    await expect(getByokKey()).resolves.toBeNull();
  });
});

describe("export / import round-trip", () => {
  it("exports a versioned payload and re-imports it", async () => {
    // Arrange
    await addHistoryEntry(makeHistory("h1", 100));
    await savePreset(makePreset("p1", 100));
    await updatePrefs({ defaultRate: 2 });

    // Act
    const payload = await exportAllData();
    expect(payload.product).toBe("mk-voicekit");
    expect(payload.version).toBe(1);

    await clearAllData();
    await expect(listHistory()).resolves.toHaveLength(0);

    await importAllData(JSON.stringify(payload));

    // Assert
    await expect(listHistory()).resolves.toHaveLength(1);
    await expect(listPresets()).resolves.toHaveLength(1);
    expect((await getPrefs()).defaultRate).toBe(2);
  });
});

describe("legacy migration", () => {
  beforeEach(() => vi.stubGlobal("localStorage", createMockStorage()));

  it("migrates legacy tts-* keys once into IndexedDB", async () => {
    // Arrange: seed legacy Vue-app keys.
    localStorage.setItem("tts-rate", JSON.stringify(1.5));
    localStorage.setItem(
      "tts-history",
      JSON.stringify([{ text: "legacy note", voice: "Daniel", timestamp: "2026-01-01" }])
    );
    localStorage.setItem(
      "tts-stats",
      JSON.stringify({ visits: 3, speechGenerations: 2, totalCharactersSpoken: 500 })
    );

    // Act
    await migrateLegacyData();

    // Assert
    expect((await getPrefs()).defaultRate).toBe(1.5);
    const history = await listHistory();
    expect(history).toHaveLength(1);
    expect(history[0].text).toBe("legacy note");
    expect((await getStats()).charactersSpoken).toBe(500);
  });

  it("does not migrate a second time", async () => {
    localStorage.setItem(
      "tts-history",
      JSON.stringify([{ text: "once", timestamp: "2026-01-01" }])
    );

    await migrateLegacyData();
    // A second run must be a no-op even if legacy keys still exist.
    await migrateLegacyData();

    await expect(listHistory()).resolves.toHaveLength(1);
  });
});
