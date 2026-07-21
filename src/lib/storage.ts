/**
 * Typed local-first storage on IndexedDB via `idb`.
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
  voiceUsage: z.record(z.string(), z.number()).default({}),
});
export type Stats = z.infer<typeof statsSchema>;
export type UsageStats = Stats;

export const EMPTY_STATS: Stats = {
  sessions: 0,
  itemsSpoken: 0,
  charactersSpoken: 0,
  msListened: 0,
  voiceUsage: {},
};

export const prefsSchema = z.object({
  defaultRate: z.number(),
  defaultPitch: z.number(),
  defaultVolume: z.number(),
  lastVoiceURI: z.string().nullable(),
  lastVoiceByLang: z.record(z.string(), z.string()).default({}),
  historyEnabled: z.boolean(),
  textScale: z.enum(["base", "large"]),
  autoScroll: z.boolean(),
  prep: z.object({
    expandNumbers: z.boolean(),
    expandAbbreviations: z.boolean(),
    normalizePauses: z.boolean(),
  }),
  favoriteVoiceURIs: z.array(z.string()).default([]),
  recentVoiceURIs: z.array(z.string()).default([]),
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
  favoriteVoiceURIs: [],
  recentVoiceURIs: [],
};

export const projectSceneSchema = z.object({
  id: z.string(),
  speaker: z.string().default("Speaker 1"),
  text: z.string(),
  voiceURI: z.string().nullable().optional(),
  rate: z.number().default(1),
  pitch: z.number().default(1),
  volume: z.number().default(1),
  pauseAfterSeconds: z.number().default(0.5),
});
export type ProjectScene = z.infer<typeof projectSceneSchema>;

export const libraryItemSchema = z.object({
  id: z.string(),
  type: z.enum(["draft", "document", "project", "transcript", "audio"]).default("draft"),
  title: z.string().min(1).max(200),
  content: z.string(),
  rawContent: z.string().optional(),
  fileName: z.string().nullable().optional(),
  fileType: z.string().nullable().optional(),
  progress: z.object({
    sentenceIndex: z.number().int().nonnegative(),
    scrollOffset: z.number().optional(),
  }).optional(),
  estimatedDurationMs: z.number().nonnegative().optional(),
  wordCount: z.number().nonnegative().optional(),
  fileSize: z.number().nonnegative().optional(),
  language: z.string().nullable().optional(),
  favorite: z.boolean().default(false).optional(),
  completed: z.boolean().default(false).optional(),
  headings: z.array(z.object({
    title: z.string(),
    charIndex: z.number().int().nonnegative(),
    level: z.number().int().positive(),
  })).optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.number(),
  updatedAt: z.number(),
  archived: z.boolean().default(false),
  scenes: z.array(projectSceneSchema).optional(),
  backgroundMusic: z.object({
    fileName: z.string(),
    volume: z.number(),
    loop: z.boolean().optional(),
    duckPercent: z.number().optional(),
    audioBlob: z.any().optional(),
  }).optional(),
});
export type LibraryItem = z.infer<typeof libraryItemSchema>;

export interface GeneratedAudio {
  id: string;
  libraryId?: string;
  voiceName?: string;
  text?: string;
  durationMs?: number;
  durationSeconds?: number;
  mimeType?: string;
  audioBlob: Blob;
  createdAt: number;
}

export interface StorageUsage {
  historyCount: number;
  presetsCount: number;
  libraryCount: number;
  audioCount: number;
  storageEstimateMB: number;
  usedBytes?: number;
  quotaBytes?: number;
}

export class ImportDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportDataError";
  }
}

interface VoiceKitDB extends DBSchema {
  history: {
    key: string;
    value: HistoryEntry;
    indexes: { by_date: number };
  };
  presets: {
    key: string;
    value: Preset;
    indexes: { by_name: string };
  };
  kv: {
    key: string;
    value: unknown;
  };
  library: {
    key: string;
    value: LibraryItem;
    indexes: {
      by_type: string;
      by_updated: number;
      by_archived: number;
    };
  };
  generated_audio: {
    key: string;
    value: GeneratedAudio;
    indexes: {
      by_library: string;
    };
  };
}

const DB_NAME = "mk-voicekit";
const DB_VERSION = 2;
const MAX_HISTORY_ENTRIES = 200;

let dbPromise: Promise<IDBPDatabase<VoiceKitDB>> | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

export function getDatabase(): Promise<IDBPDatabase<VoiceKitDB>> {
  if (!isBrowser()) {
    return Promise.reject(new Error("IndexedDB is not available during SSR."));
  }
  if (!dbPromise) {
    dbPromise = openDB<VoiceKitDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const historyStore = db.createObjectStore("history", { keyPath: "id" });
          historyStore.createIndex("by_date", "completedAt");

          const presetStore = db.createObjectStore("presets", { keyPath: "id" });
          presetStore.createIndex("by_name", "name");

          db.createObjectStore("kv");
        }

        if (oldVersion < 2) {
          const libraryStore = db.createObjectStore("library", { keyPath: "id" });
          libraryStore.createIndex("by_type", "type");
          libraryStore.createIndex("by_updated", "updatedAt");
          libraryStore.createIndex("by_archived", "archived");

          const audioStore = db.createObjectStore("generated_audio", { keyPath: "id" });
          audioStore.createIndex("by_library", "libraryId");
        }
      },
    });
  }
  return dbPromise;
}

/* ------------------------------------------------------------------ */
/* Prefs & KV                                                         */
/* ------------------------------------------------------------------ */

export async function getPrefs(): Promise<Prefs> {
  if (!isBrowser()) return DEFAULT_PREFS;
  const db = await getDatabase();
  const raw = await db.get("kv", "prefs");
  const res = prefsSchema.safeParse(raw);
  return res.success ? res.data : DEFAULT_PREFS;
}

export async function setPrefs(prefs: Prefs): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDatabase();
  await db.put("kv", prefs, "prefs");
}

export async function updatePrefs(patch: Partial<Prefs>): Promise<Prefs> {
  const current = await getPrefs();
  const updated = { ...current, ...patch };
  await setPrefs(updated);
  return updated;
}

export async function getStats(): Promise<Stats> {
  if (!isBrowser()) return EMPTY_STATS;
  const db = await getDatabase();
  const raw = await db.get("kv", "stats");
  const res = statsSchema.safeParse(raw);
  return res.success ? res.data : EMPTY_STATS;
}

export async function updateStats(patch: Partial<Stats> | ((prev: Stats) => Partial<Stats>)): Promise<Stats> {
  if (!isBrowser()) return EMPTY_STATS;
  const db = await getDatabase();
  const current = await getStats();
  const diff = typeof patch === "function" ? patch(current) : patch;
  const updated = { ...current, ...diff };
  await db.put("kv", updated, "stats");
  return updated;
}

export async function getDraftText(): Promise<string> {
  if (!isBrowser()) return "";
  const db = await getDatabase();
  const val = await db.get("kv", "draft_text");
  return typeof val === "string" ? val : "";
}

export async function setDraftText(text: string): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDatabase();
  await db.put("kv", text, "draft_text");
}

export async function loadQueue(): Promise<QueueItem[]> {
  if (!isBrowser()) return [];
  const db = await getDatabase();
  const raw = await db.get("kv", "queue");
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => queueItemSchema.safeParse(x)).filter((r) => r.success).map((r) => r.data!);
}

export async function saveQueue(items: QueueItem[]): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDatabase();
  await db.put("kv", items, "queue");
}

/* ------------------------------------------------------------------ */
/* History CRUD                                                       */
/* ------------------------------------------------------------------ */

export async function addHistoryEntry(entry: Partial<HistoryEntry> & { text: string; excerpt?: string }): Promise<HistoryEntry> {
  const prefs = await getPrefs();
  const full: HistoryEntry = {
    id: entry.id || crypto.randomUUID(),
    text: entry.text,
    excerpt: entry.excerpt || entry.text.slice(0, 100),
    chars: entry.chars || entry.text.length,
    voiceName: entry.voiceName || "Default Voice",
    voiceURI: entry.voiceURI || null,
    rate: entry.rate || 1.0,
    pitch: entry.pitch || 1.0,
    volume: entry.volume || 1.0,
    durationMs: entry.durationMs !== undefined ? entry.durationMs : 0,
    completedAt: entry.completedAt !== undefined ? entry.completedAt : Date.now(),
  };
  if (!isBrowser() || !prefs.historyEnabled) return full;
  const db = await getDatabase();
  await db.put("history", full);

  // Trim to max entries, keeping newest
  const all = await db.getAll("history");
  if (all.length > MAX_HISTORY_ENTRIES) {
    all.sort((a, b) => b.completedAt - a.completedAt);
    const toDelete = all.slice(MAX_HISTORY_ENTRIES);
    const tx = db.transaction("history", "readwrite");
    await Promise.all(toDelete.map((e) => tx.store.delete(e.id)));
    await tx.done;
  }
  return full;
}

export async function listHistory(): Promise<HistoryEntry[]> {
  if (!isBrowser()) return [];
  const db = await getDatabase();
  const items = await db.getAll("history");
  return items.sort((a, b) => b.completedAt - a.completedAt);
}

export async function getHistoryEntry(id: string): Promise<HistoryEntry | null> {
  if (!isBrowser()) return null;
  const db = await getDatabase();
  const raw = await db.get("history", id);
  return raw || null;
}

export async function deleteHistoryEntry(entryOrId: HistoryEntry | string): Promise<void> {
  if (!isBrowser()) return;
  const id = typeof entryOrId === "string" ? entryOrId : entryOrId.id;
  const db = await getDatabase();
  await db.delete("history", id);
}

export async function clearHistory(): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDatabase();
  await db.clear("history");
}

export async function restoreHistoryEntry(entryOrId: HistoryEntry | string): Promise<HistoryEntry | null> {
  if (!isBrowser()) return null;
  const db = await getDatabase();
  if (typeof entryOrId === "object" && entryOrId !== null) {
    await db.put("history", entryOrId);
    return entryOrId;
  }
  return getHistoryEntry(entryOrId);
}

/* ------------------------------------------------------------------ */
/* Presets CRUD                                                       */
/* ------------------------------------------------------------------ */

export async function listPresets(): Promise<Preset[]> {
  if (!isBrowser()) return [];
  const db = await getDatabase();
  return db.getAll("presets");
}

export async function savePreset(preset: Preset): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDatabase();
  await db.put("presets", preset);
}

export async function deletePreset(id: string): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDatabase();
  await db.delete("presets", id);
}

/* ------------------------------------------------------------------ */
/* Generated Audio Clips                                              */
/* ------------------------------------------------------------------ */

export async function saveAudioClip(audio: GeneratedAudio): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDatabase();
  await db.put("generated_audio", audio);
}

export async function listAudioClips(libraryId?: string): Promise<GeneratedAudio[]> {
  if (!isBrowser()) return [];
  const db = await getDatabase();
  if (libraryId) {
    return db.getAllFromIndex("generated_audio", "by_library", libraryId);
  }
  return db.getAll("generated_audio");
}

export async function deleteAudioClip(id: string): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDatabase();
  await db.delete("generated_audio", id);
}

/* ------------------------------------------------------------------ */
/* Library CRUD                                                       */
/* ------------------------------------------------------------------ */

export async function saveLibraryItem(item: LibraryItem): Promise<void> {
  if (!isBrowser()) return;
  const parsed = libraryItemSchema.parse(item);
  const db = await getDatabase();
  await db.put("library", parsed);
}

export async function getLibraryItem(id: string): Promise<LibraryItem | null> {
  if (!isBrowser()) return null;
  const db = await getDatabase();
  const raw = await db.get("library", id);
  if (!raw) return null;
  const result = libraryItemSchema.safeParse(raw);
  return result.success ? result.data : null;
}

export async function listLibraryItems(filter?: { type?: string; archived?: boolean }): Promise<LibraryItem[]> {
  if (!isBrowser()) return [];
  const db = await getDatabase();
  const items = await db.getAll("library");
  return items
    .map((raw) => {
      const res = libraryItemSchema.safeParse(raw);
      return res.success ? res.data : null;
    })
    .filter((x): x is LibraryItem => x !== null)
    .filter((item) => {
      if (filter?.type && item.type !== filter.type) return false;
      if (filter?.archived !== undefined && item.archived !== filter.archived) return false;
      return true;
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteLibraryItem(id: string): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDatabase();
  await db.delete("library", id);

  // Cascade delete audio clips
  const audioList = await db.getAllFromIndex("generated_audio", "by_library", id);
  if (audioList.length > 0) {
    const tx = db.transaction("generated_audio", "readwrite");
    await Promise.all(audioList.map((a) => tx.store.delete(a.id)));
    await tx.done;
  }
}

export async function bulkDeleteLibraryItems(ids: string[]): Promise<void> {
  if (!isBrowser() || ids.length === 0) return;
  const db = await getDatabase();
  const tx = db.transaction("library", "readwrite");
  await Promise.all(ids.map((id) => tx.store.delete(id)));
  await tx.done;
}

export async function bulkArchiveLibraryItems(ids: string[], archived: boolean): Promise<void> {
  if (!isBrowser() || ids.length === 0) return;
  const db = await getDatabase();
  const tx = db.transaction("library", "readwrite");
  for (const id of ids) {
    const raw = await tx.store.get(id);
    if (raw) {
      raw.archived = archived;
      raw.updatedAt = Date.now();
      await tx.store.put(raw);
    }
  }
  await tx.done;
}

export async function bulkTagLibraryItems(ids: string[], tag: string): Promise<void> {
  if (!isBrowser() || ids.length === 0 || !tag.trim()) return;
  const db = await getDatabase();
  const tx = db.transaction("library", "readwrite");
  for (const id of ids) {
    const raw = await tx.store.get(id);
    if (raw) {
      const existingTags = new Set(raw.tags || []);
      existingTags.add(tag.trim());
      raw.tags = Array.from(existingTags);
      raw.updatedAt = Date.now();
      await tx.store.put(raw);
    }
  }
  await tx.done;
}

export async function toggleFavoriteLibraryItem(id: string): Promise<boolean> {
  if (!isBrowser()) return false;
  const db = await getDatabase();
  const raw = await db.get("library", id);
  if (!raw) return false;
  raw.favorite = !raw.favorite;
  raw.updatedAt = Date.now();
  await db.put("library", raw);
  return raw.favorite;
}

export async function duplicateLibraryItem(id: string): Promise<LibraryItem | null> {
  if (!isBrowser()) return null;
  const item = await getLibraryItem(id);
  if (!item) return null;
  const clone: LibraryItem = {
    ...item,
    id: crypto.randomUUID(),
    title: `${item.title} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await saveLibraryItem(clone);
  return clone;
}

/* ------------------------------------------------------------------ */
/* BYOK & Pronunciation Storage                                       */
/* ------------------------------------------------------------------ */

export async function getByokKey(): Promise<string | null> {
  if (!isBrowser()) return null;
  const db = await getDatabase();
  const val = await db.get("kv", "byok_api_key");
  return typeof val === "string" ? val : null;
}

export async function setByokKey(key: string | null): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDatabase();
  const trimmed = key?.trim();
  if (trimmed) {
    await db.put("kv", trimmed, "byok_api_key");
  } else {
    await db.delete("kv", "byok_api_key");
  }
}

export async function getProviderByokKey(provider: string): Promise<string | null> {
  if (!isBrowser()) return null;
  const db = await getDatabase();
  const val = await db.get("kv", `byok_${provider}`);
  return typeof val === "string" ? val : null;
}

export async function setProviderByokKey(provider: string, key: string | null): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDatabase();
  const trimmed = key?.trim();
  if (trimmed) {
    await db.put("kv", trimmed, `byok_${provider}`);
  } else {
    await db.delete("kv", `byok_${provider}`);
  }
}

export async function getPronunciationDict(): Promise<Record<string, string>> {
  if (!isBrowser()) return {};
  const db = await getDatabase();
  const val = await db.get("kv", "pronunciation_dict");
  return val && typeof val === "object" ? (val as Record<string, string>) : {};
}

export async function savePronunciationDict(dict: Record<string, string>): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDatabase();
  await db.put("kv", dict, "pronunciation_dict");
}

/* ------------------------------------------------------------------ */
/* Storage Usage & Migration                                          */
/* ------------------------------------------------------------------ */

export async function getStorageUsage(): Promise<StorageUsage> {
  if (!isBrowser()) {
    return { historyCount: 0, presetsCount: 0, libraryCount: 0, audioCount: 0, storageEstimateMB: 0, usedBytes: 0, quotaBytes: 0 };
  }
  const db = await getDatabase();
  const historyCount = await db.count("history");
  const presetsCount = await db.count("presets");
  const libraryCount = await db.count("library");
  const audioCount = await db.count("generated_audio");
  const est = await getStorageEstimate();
  return {
    historyCount,
    presetsCount,
    libraryCount,
    audioCount,
    storageEstimateMB: est.usageMB,
    usedBytes: est.usageMB * 1024 * 1024,
    quotaBytes: est.quotaMB * 1024 * 1024,
  };
}

export async function exportAllData(): Promise<{
  product: string;
  version: number;
  exportedAt: number;
  library: LibraryItem[];
  presets: Preset[];
  history: HistoryEntry[];
  prefs: Prefs;
  stats: Stats;
}> {
  if (!isBrowser()) {
    return {
      product: "mk-voicekit",
      version: 2,
      exportedAt: Date.now(),
      library: [],
      presets: [],
      history: [],
      prefs: DEFAULT_PREFS,
      stats: EMPTY_STATS,
    };
  }
  const db = await getDatabase();
  const library = await db.getAll("library");
  const presets = await db.getAll("presets");
  const history = await db.getAll("history");
  const prefs = await getPrefs();
  const stats = await getStats();
  return {
    product: "mk-voicekit",
    version: 2,
    exportedAt: Date.now(),
    library,
    presets,
    history,
    prefs,
    stats,
  };
}

export async function importAllData(jsonStr: string): Promise<void> {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(jsonStr) as Record<string, unknown>;
  } catch {
    throw new ImportDataError("Failed to parse import JSON file.");
  }
  if (!data || typeof data !== "object" || data.product !== "mk-voicekit" || typeof data.version !== "number") {
    throw new ImportDataError("Invalid MK VoiceKit backup file.");
  }
  if (!isBrowser()) return;
  const db = await getDatabase();
  if (Array.isArray(data.library)) {
    const tx = db.transaction("library", "readwrite");
    for (const item of data.library) {
      await tx.store.put(item);
    }
    await tx.done;
  }
  if (Array.isArray(data.presets)) {
    const tx = db.transaction("presets", "readwrite");
    for (const item of data.presets) {
      await tx.store.put(item);
    }
    await tx.done;
  }
  if (Array.isArray(data.history)) {
    const tx = db.transaction("history", "readwrite");
    for (const item of data.history) {
      await tx.store.put(item);
    }
    await tx.done;
  }
  if (data.prefs && typeof data.prefs === "object") {
    await updatePrefs(data.prefs as Partial<Prefs>);
  }
}

export async function clearAllData(): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDatabase();
  await db.clear("library");
  await db.clear("history");
  await db.clear("presets");
  await db.clear("kv");
  await db.clear("generated_audio");
}

export async function getStorageEstimate(): Promise<{ usageMB: number; quotaMB: number }> {
  if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    const usageMB = Math.round((estimate.usage || 0) / (1024 * 1024));
    const quotaMB = Math.round((estimate.quota || 0) / (1024 * 1024));
    return { usageMB, quotaMB };
  }
  return { usageMB: 0, quotaMB: 0 };
}

export async function migrateLegacyData(): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDatabase();
  const migrated = await db.get("kv", "legacy_migrated");
  if (migrated) return;
  try {
    const legacyRate = localStorage.getItem("tts-rate");
    if (legacyRate) {
      const rate = JSON.parse(legacyRate);
      await updatePrefs({ defaultRate: Number(rate) });
    }

    const legacyHistory = localStorage.getItem("tts-history");
    if (legacyHistory) {
      const parsed = JSON.parse(legacyHistory);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          await addHistoryEntry({
            text: item.text || "",
            voiceName: item.voice || "Legacy Voice",
            completedAt: item.timestamp ? new Date(item.timestamp).getTime() : Date.now(),
          });
        }
      }
    }

    const legacyStats = localStorage.getItem("tts-stats");
    if (legacyStats) {
      const parsed = JSON.parse(legacyStats);
      if (parsed) {
        await updateStats({
          charactersSpoken: parsed.totalCharactersSpoken || 0,
        });
      }
    }
    await db.put("kv", true, "legacy_migrated");
  } catch {}
}
