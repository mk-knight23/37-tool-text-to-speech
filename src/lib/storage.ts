/**
 * Typed local-first storage on IndexedDB via `idb` (STANDARDS §1/§4).
 * - All reads are schema-validated (zod) — corrupted data degrades to
 *   defaults instead of crashing.
 * - One-time migration ingests the legacy `tts-*` localStorage keys so
 *   existing users keep their history and defaults.
 * - Export / import / clear-all / storage usage back the /settings page.
 *
 * Client-side only: every entry point guards against SSR.
 */

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { z } from "zod";
import { DEFAULT_PREP_OPTIONS } from "./textprep";

/* ------------------------------------------------------------------ */
/* Schemas and types                                                    */
/* ------------------------------------------------------------------ */

export const historyEntrySchema = z.object({
  id: z.string(),
  text: z.string(),
  excerpt: z.string(),
  chars: z.number().int().nonnegative(),
  voiceName: z.string(),
  voiceURI: z.string().nullable(),
  rate: z.number(),
  pitch: z.number(),
  volume: z.number(),
  durationMs: z.number().nonnegative(),
  completedAt: z.number(),
});
export type HistoryEntry = z.infer<typeof historyEntrySchema>;

export const presetSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(60),
  voiceURI: z.string().nullable(),
  voiceName: z.string(),
  lang: z.string(),
  rate: z.number(),
  pitch: z.number(),
  volume: z.number(),
  createdAt: z.number(),
});
export type Preset = z.infer<typeof presetSchema>;

export const queueItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  text: z.string(),
  addedAt: z.number(),
});
export type QueueItem = z.infer<typeof queueItemSchema>;

export const statsSchema = z.object({
  sessions: z.number().int().nonnegative(),
  itemsSpoken: z.number().int().nonnegative(),
  charactersSpoken: z.number().int().nonnegative(),
  msListened: z.number().nonnegative(),
  voiceUsage: z.record(z.string(), z.number().int().nonnegative()),
});
export type UsageStats = z.infer<typeof statsSchema>;

export const EMPTY_STATS: UsageStats = {
  sessions: 0,
  itemsSpoken: 0,
  charactersSpoken: 0,
  msListened: 0,
  voiceUsage: {},
};

export const prefsSchema = z.object({
  defaultRate: z.number().min(0.5).max(3),
  defaultPitch: z.number().min(0.5).max(2),
  defaultVolume: z.number().min(0).max(1),
  lastVoiceURI: z.string().nullable(),
  lastVoiceByLang: z.record(z.string(), z.string()),
  historyEnabled: z.boolean(),
  textScale: z.enum(["base", "large"]),
  autoScroll: z.boolean(),
  prep: z.object({
    expandNumbers: z.boolean(),
    expandAbbreviations: z.boolean(),
    normalizePauses: z.boolean(),
  }),
});
export type Prefs = z.infer<typeof prefsSchema>;

export const DEFAULT_PREFS: Prefs = {
  defaultRate: 1,
  defaultPitch: 1,
  defaultVolume: 1,
  lastVoiceURI: null,
  lastVoiceByLang: {},
  historyEnabled: true,
  textScale: "base",
  autoScroll: true,
  prep: { ...DEFAULT_PREP_OPTIONS },
};

const exportSchema = z.object({
  product: z.literal("mk-voicekit"),
  version: z.literal(1),
  exportedAt: z.number(),
  prefs: prefsSchema,
  stats: statsSchema,
  history: z.array(historyEntrySchema),
  presets: z.array(presetSchema),
  queue: z.array(queueItemSchema),
});
export type ExportPayload = z.infer<typeof exportSchema>;

/* ------------------------------------------------------------------ */
/* Database                                                             */
/* ------------------------------------------------------------------ */

interface VoiceKitDB extends DBSchema {
  history: { key: string; value: HistoryEntry };
  presets: { key: string; value: Preset };
  kv: { key: string; value: unknown };
}

const DB_NAME = "mk-voicekit";
const MAX_HISTORY_ENTRIES = 200;

let dbPromise: Promise<IDBPDatabase<VoiceKitDB>> | null = null;

function getDB(): Promise<IDBPDatabase<VoiceKitDB>> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available"));
  }
  if (!dbPromise) {
    dbPromise = openDB<VoiceKitDB>(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore("history", { keyPath: "id" });
        db.createObjectStore("presets", { keyPath: "id" });
        db.createObjectStore("kv");
      },
    });
  }
  return dbPromise;
}

async function readKv<T>(key: string, schema: z.ZodType<T>, fallback: T): Promise<T> {
  try {
    const db = await getDB();
    const raw = await db.get("kv", key);
    if (raw === undefined) return fallback;
    const parsed = schema.safeParse(raw);
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

async function writeKv(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put("kv", value, key);
}

/* ------------------------------------------------------------------ */
/* Prefs                                                                */
/* ------------------------------------------------------------------ */

export async function getPrefs(): Promise<Prefs> {
  return readKv("prefs", prefsSchema, DEFAULT_PREFS);
}

export async function setPrefs(prefs: Prefs): Promise<void> {
  await writeKv("prefs", prefs);
}

export async function updatePrefs(patch: Partial<Prefs>): Promise<Prefs> {
  const current = await getPrefs();
  const next = { ...current, ...patch };
  await setPrefs(next);
  return next;
}

/* ------------------------------------------------------------------ */
/* History                                                              */
/* ------------------------------------------------------------------ */

export async function addHistoryEntry(entry: HistoryEntry): Promise<void> {
  const prefs = await getPrefs();
  if (!prefs.historyEnabled) return;
  const db = await getDB();
  await db.put("history", entry);
  // Trim to the newest MAX_HISTORY_ENTRIES.
  const all = await db.getAll("history");
  if (all.length > MAX_HISTORY_ENTRIES) {
    const sorted = all.slice().sort((a, b) => b.completedAt - a.completedAt);
    const tx = db.transaction("history", "readwrite");
    for (const stale of sorted.slice(MAX_HISTORY_ENTRIES)) {
      await tx.store.delete(stale.id);
    }
    await tx.done;
  }
}

export async function listHistory(): Promise<HistoryEntry[]> {
  try {
    const db = await getDB();
    const all = await db.getAll("history");
    return all
      .filter((entry) => historyEntrySchema.safeParse(entry).success)
      .sort((a, b) => b.completedAt - a.completedAt);
  } catch {
    return [];
  }
}

export async function getHistoryEntry(id: string): Promise<HistoryEntry | null> {
  try {
    const db = await getDB();
    const entry = await db.get("history", id);
    return entry ?? null;
  } catch {
    return null;
  }
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("history", id);
}

export async function restoreHistoryEntry(entry: HistoryEntry): Promise<void> {
  const db = await getDB();
  await db.put("history", entry);
}

export async function clearHistory(): Promise<void> {
  const db = await getDB();
  await db.clear("history");
}

/* ------------------------------------------------------------------ */
/* Presets (favorites)                                                  */
/* ------------------------------------------------------------------ */

export async function listPresets(): Promise<Preset[]> {
  try {
    const db = await getDB();
    const all = await db.getAll("presets");
    return all
      .filter((preset) => presetSchema.safeParse(preset).success)
      .sort((a, b) => a.createdAt - b.createdAt);
  } catch {
    return [];
  }
}

export async function savePreset(preset: Preset): Promise<void> {
  const db = await getDB();
  await db.put("presets", preset);
}

export async function deletePreset(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("presets", id);
}

/* ------------------------------------------------------------------ */
/* Queue (persisted as one ordered list)                                */
/* ------------------------------------------------------------------ */

const queueListSchema = z.array(queueItemSchema);

export async function loadQueue(): Promise<QueueItem[]> {
  return readKv("queue", queueListSchema, []);
}

export async function saveQueue(queue: QueueItem[]): Promise<void> {
  await writeKv("queue", queue);
}

/* ------------------------------------------------------------------ */
/* Stats                                                                */
/* ------------------------------------------------------------------ */

export async function getStats(): Promise<UsageStats> {
  return readKv("stats", statsSchema, EMPTY_STATS);
}

export async function updateStats(
  mutate: (stats: UsageStats) => UsageStats
): Promise<void> {
  const current = await getStats();
  await writeKv("stats", mutate(current));
}

/* ------------------------------------------------------------------ */
/* BYOK key (client-held; sent only per-request via x-byok-key)         */
/* ------------------------------------------------------------------ */

export async function getByokKey(): Promise<string | null> {
  return readKv<string | null>("byokKey", z.string().min(1).nullable(), null);
}

export async function setByokKey(key: string | null): Promise<void> {
  const db = await getDB();
  if (key === null || key.trim() === "") {
    await db.delete("kv", "byokKey");
  } else {
    await db.put("kv", key.trim(), "byokKey");
  }
}

/* ------------------------------------------------------------------ */
/* Export / import / clear / usage                                      */
/* ------------------------------------------------------------------ */

export async function exportAllData(): Promise<ExportPayload> {
  const [prefs, stats, history, presets, queue] = await Promise.all([
    getPrefs(),
    getStats(),
    listHistory(),
    listPresets(),
    loadQueue(),
  ]);
  return {
    product: "mk-voicekit",
    version: 1,
    exportedAt: Date.now(),
    prefs,
    stats,
    history,
    presets,
    queue,
  };
}

export class ImportDataError extends Error {}

export async function importAllData(json: string): Promise<void> {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new ImportDataError("That file is not valid JSON.");
  }
  const parsed = exportSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ImportDataError(
      "That file is not a MK VoiceKit export (or it is from an incompatible version)."
    );
  }
  const payload = parsed.data;
  const db = await getDB();
  await db.clear("history");
  await db.clear("presets");
  const tx = db.transaction(["history", "presets"], "readwrite");
  for (const entry of payload.history) {
    await tx.objectStore("history").put(entry);
  }
  for (const preset of payload.presets) {
    await tx.objectStore("presets").put(preset);
  }
  await tx.done;
  await setPrefs(payload.prefs);
  await writeKv("stats", payload.stats);
  await saveQueue(payload.queue);
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await Promise.all([db.clear("history"), db.clear("presets"), db.clear("kv")]);
  if (typeof localStorage !== "undefined") {
    for (const key of ["vk-theme", "vk-consent"]) {
      localStorage.removeItem(key);
    }
  }
}

export interface StorageUsage {
  usedBytes: number | null;
  quotaBytes: number | null;
}

export async function getStorageUsage(): Promise<StorageUsage> {
  if (
    typeof navigator === "undefined" ||
    !("storage" in navigator) ||
    typeof navigator.storage.estimate !== "function"
  ) {
    return { usedBytes: null, quotaBytes: null };
  }
  const estimate = await navigator.storage.estimate();
  return {
    usedBytes: estimate.usage ?? null,
    quotaBytes: estimate.quota ?? null,
  };
}

/* ------------------------------------------------------------------ */
/* Legacy migration (one-time)                                          */
/* ------------------------------------------------------------------ */

const legacyHistoryItemSchema = z.object({
  id: z.string().optional(),
  text: z.string(),
  voice: z.string().optional(),
  timestamp: z.string().optional(),
});

function readLegacyNumber(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = Number(JSON.parse(raw));
    return Number.isFinite(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Reads the legacy `tts-*` localStorage keys written by the v1 Vue app and
 * migrates them into IndexedDB exactly once. Legacy keys are left in place
 * (non-destructive); a kv flag prevents re-runs.
 */
export async function migrateLegacyData(): Promise<void> {
  if (typeof localStorage === "undefined") return;
  const migrated = await readKv("legacyMigrated", z.boolean(), false);
  if (migrated) return;

  try {
    // Speech defaults.
    const rate = Math.min(3, Math.max(0.5, readLegacyNumber("tts-rate", 1)));
    const pitch = Math.min(2, Math.max(0.5, readLegacyNumber("tts-pitch", 1)));
    const volume = Math.min(1, Math.max(0, readLegacyNumber("tts-volume", 1)));
    await updatePrefs({
      defaultRate: rate,
      defaultPitch: pitch,
      defaultVolume: volume,
    });

    // History.
    const rawHistory = localStorage.getItem("tts-history");
    if (rawHistory) {
      const parsed = z
        .array(legacyHistoryItemSchema)
        .safeParse(JSON.parse(rawHistory));
      if (parsed.success) {
        for (const item of parsed.data) {
          if (item.text.trim().length === 0) continue;
          const completedAt = item.timestamp
            ? Date.parse(item.timestamp) || Date.now()
            : Date.now();
          await addHistoryEntry({
            id:
              typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `legacy-${completedAt}-${item.text.length}`,
            text: item.text,
            excerpt: item.text.replace(/\s+/g, " ").slice(0, 140),
            chars: item.text.length,
            voiceName: item.voice ?? "Unknown voice",
            voiceURI: null,
            rate,
            pitch,
            volume,
            durationMs: 0,
            completedAt,
          });
        }
      }
    }

    // Stats.
    const rawStats = localStorage.getItem("tts-stats");
    if (rawStats) {
      const legacyStats = z
        .object({
          visits: z.number().optional(),
          speechGenerations: z.number().optional(),
          totalCharactersSpoken: z.number().optional(),
        })
        .safeParse(JSON.parse(rawStats));
      if (legacyStats.success) {
        await updateStats((stats) => ({
          ...stats,
          sessions: stats.sessions + (legacyStats.data.visits ?? 0),
          itemsSpoken:
            stats.itemsSpoken + (legacyStats.data.speechGenerations ?? 0),
          charactersSpoken:
            stats.charactersSpoken +
            (legacyStats.data.totalCharactersSpoken ?? 0),
        }));
      }
    }
  } catch {
    // Migration must never block the app; partial migration is acceptable.
  } finally {
    await writeKv("legacyMigrated", true);
  }
}
