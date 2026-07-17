/** Small formatting helpers shared across pages. */

export function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  const hours = Math.floor(minutes / 60);
  if (hours === 0) return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  return `${hours}h ${(minutes % 60).toString().padStart(2, "0")}m`;
}

export function formatRelativeTime(epochMs: number, now: number = Date.now()): string {
  const diffMs = now - epochMs;
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} d ago`;
  return new Date(epochMs).toLocaleDateString();
}

export function excerpt(text: string, maxChars: number = 140): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return clean;
  return `${clean.slice(0, maxChars - 1).trimEnd()}…`;
}

/** Bucketed size for analytics — raw counts never leave the device. */
export function bucketChars(count: number): string {
  if (count < 1_000) return "<1k";
  if (count < 10_000) return "1k-10k";
  if (count < 100_000) return "10k-100k";
  return "100k+";
}
