/**
 * Model resolution for the AI routes (STANDARDS §10).
 *
 * Models are gateway model strings ("creator/model-name") and are
 * env-configurable so a model rename is a config change, not a code change:
 *   AI_MODEL          fast/default tier  (default anthropic/claude-haiku-4.5)
 *   AI_MODEL_QUALITY  higher-quality tier (default anthropic/claude-sonnet-4-5)
 *
 * Auth: the default gateway reads AI_GATEWAY_API_KEY, or uses Vercel OIDC when
 * deployed. A per-request BYOK key overrides the gateway credential for that
 * request only.
 */

import { createGateway, gateway, type LanguageModel } from "ai";

export type ModelTier = "fast" | "quality";

const DEFAULT_FAST = "anthropic/claude-haiku-4.5";
const DEFAULT_QUALITY = "anthropic/claude-sonnet-4-5";

export function modelIdForTier(tier: ModelTier): string {
  if (tier === "quality") {
    return process.env.AI_MODEL_QUALITY?.trim() || DEFAULT_QUALITY;
  }
  return process.env.AI_MODEL?.trim() || DEFAULT_FAST;
}

/**
 * True when the server can reach the gateway on its own (env key or Vercel
 * OIDC). When false and no BYOK key is supplied, routes short-circuit with a
 * clean `ai_unavailable` error instead of failing an upstream call.
 */
export function hasServerCredentials(): boolean {
  return Boolean(
    process.env.AI_GATEWAY_API_KEY?.trim() ||
      process.env.VERCEL_OIDC_TOKEN?.trim()
  );
}

/**
 * Resolve a LanguageModel for the tier. With a BYOK key, build a one-off
 * gateway that uses it as the credential; otherwise use the ambient gateway
 * (env key / OIDC).
 */
export function resolveModel(
  tier: ModelTier,
  byok: string | null
): LanguageModel {
  const id = modelIdForTier(tier);
  if (byok) {
    const byokGateway = createGateway({ apiKey: byok });
    return byokGateway(id);
  }
  return gateway(id);
}
