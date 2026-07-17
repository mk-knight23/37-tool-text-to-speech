/**
 * Request helpers for the AI routes: client identity (for best-effort limits)
 * and the per-request BYOK key.
 *
 * The BYOK key is read from the `x-byok-key` header, used only to build the
 * gateway for that single request, and NEVER logged or persisted server-side
 * (STANDARDS §10).
 */

export const BYOK_HEADER = "x-byok-key";

/**
 * Best-effort client key for rate limiting / quota. Prefers the first hop in
 * `x-forwarded-for` (set by Vercel), falling back to other proxy headers.
 * Never used for anything user-identifying beyond in-memory counters.
 */
export function clientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-vercel-forwarded-for") ??
    "unknown"
  );
}

/** Extract and trim the BYOK key, or null when absent/empty. */
export function byokKey(req: Request): string | null {
  const raw = req.headers.get(BYOK_HEADER);
  if (!raw) return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}
