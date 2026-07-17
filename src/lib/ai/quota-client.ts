/**
 * Client-side daily AI usage counter (STANDARDS §10).
 *
 * Drives the usage indicator so the count is instant and works before the
 * first request. The server keeps its own best-effort counter; this one is
 * authoritative for the UI. Stored in localStorage (tiny, non-sensitive).
 */

import { DAILY_AI_LIMIT } from "./catalog";

const KEY = "vk-ai-quota";

export interface ClientQuota {
  limit: number;
  used: number;
  remaining: number;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function readCount(): number {
  if (typeof localStorage === "undefined") return 0;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { day?: string; count?: number };
    if (parsed.day !== today()) return 0;
    return typeof parsed.count === "number" && parsed.count >= 0
      ? parsed.count
      : 0;
  } catch {
    return 0;
  }
}

export function getClientQuota(): ClientQuota {
  const used = readCount();
  return {
    limit: DAILY_AI_LIMIT,
    used,
    remaining: Math.max(0, DAILY_AI_LIMIT - used),
  };
}

/** Record one used action; returns the updated quota. */
export function recordClientUsage(): ClientQuota {
  const used = readCount() + 1;
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify({ day: today(), count: used }));
    } catch {
      // Storage full or blocked — the indicator degrades, requests still work.
    }
  }
  return {
    limit: DAILY_AI_LIMIT,
    used,
    remaining: Math.max(0, DAILY_AI_LIMIT - used),
  };
}
