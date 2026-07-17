/**
 * In-memory per-IP token-bucket rate limiter (STANDARDS §8).
 *
 * BEST-EFFORT ONLY. State lives in module memory, so on serverless it is
 * per-instance (each warm lambda has its own bucket) and resets on cold start.
 * It smooths bursts from a single client; it is not a global guarantee. A
 * durable limiter (e.g. Upstash/Redis) would be needed for hard limits — see
 * SECURITY.md.
 */

export interface RateLimitConfig {
  /** Maximum tokens in the bucket (burst size). */
  capacity: number;
  /** Tokens added per second. */
  refillPerSecond: number;
}

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  capacity: 12,
  refillPerSecond: 12 / 60, // full bucket refills in ~60s
};

export interface RateLimitResult {
  ok: boolean;
  /** Whole seconds until the next token is available (only when blocked). */
  retryAfterSeconds: number;
  remaining: number;
}

interface Bucket {
  tokens: number;
  updatedAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Attempt to spend one token for `key`. Pure w.r.t. its `now` argument so it
 * is deterministically testable.
 */
export function consumeToken(
  key: string,
  now: number = Date.now(),
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): RateLimitResult {
  const existing = buckets.get(key);
  const bucket: Bucket = existing ?? { tokens: config.capacity, updatedAt: now };

  // Refill based on elapsed time.
  const elapsedSeconds = Math.max(0, (now - bucket.updatedAt) / 1000);
  const refilled = Math.min(
    config.capacity,
    bucket.tokens + elapsedSeconds * config.refillPerSecond
  );

  if (refilled >= 1) {
    const nextTokens = refilled - 1;
    buckets.set(key, { tokens: nextTokens, updatedAt: now });
    return { ok: true, retryAfterSeconds: 0, remaining: Math.floor(nextTokens) };
  }

  // Not enough for one token — report when the next one arrives.
  const deficit = 1 - refilled;
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil(deficit / config.refillPerSecond)
  );
  buckets.set(key, { tokens: refilled, updatedAt: now });
  return { ok: false, retryAfterSeconds, remaining: 0 };
}

/** Test helper — clears all buckets. */
export function __resetRateLimiter(): void {
  buckets.clear();
}
