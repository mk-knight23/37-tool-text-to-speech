/**
 * POST /api/ai/<capability> — the single dynamic handler for every AI
 * capability (STANDARDS §10).
 *
 * Pipeline: validate capability → per-IP rate limit → parse + size guard →
 * zod input validation → credential check → anonymous daily quota →
 * generateText (text mode) / generateObject (object mode) via a gateway model
 * string. BYOK (`x-byok-key`) overrides the gateway credential for that one
 * request and bypasses the server quota; it is never logged or persisted.
 *
 * Cancellation: the incoming `req.signal` is forwarded to the model call, so a
 * client that aborts the fetch also aborts the upstream generation.
 */

import { generateText, generateObject } from "ai";
import { getSpec } from "@/lib/ai/capabilities";
import {
  getCapabilityMeta,
  isCapabilityId,
  MAX_INPUT_CHARS,
} from "@/lib/ai/catalog";
import { resolveModel, hasServerCredentials } from "@/lib/ai/models";
import { consumeToken } from "@/lib/ai/rate-limit";
import { consumeQuota, type QuotaResult } from "@/lib/ai/quota";
import { AiError, errorResponse } from "@/lib/ai/errors";
import { byokKey, clientKey } from "@/lib/ai/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Coarse DoS cap on the raw request body; zod enforces the precise limit. */
const MAX_BODY_BYTES = 512 * 1024;

interface RouteContext {
  params: Promise<{ capability: string }>;
}

function quotaHeaders(quota: QuotaResult | null): Record<string, string> {
  if (!quota) return {};
  return {
    "X-Quota-Limit": String(quota.limit),
    "X-Quota-Remaining": String(quota.remaining),
  };
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const { capability } = await context.params;

    if (!isCapabilityId(capability)) {
      throw new AiError("invalid_capability", "Unknown AI capability.");
    }

    // 1. Rate limit (per client, best-effort).
    const key = clientKey(req);
    const rate = consumeToken(key);
    if (!rate.ok) {
      throw new AiError(
        "rate_limited",
        "Too many requests in a short time. Please wait a moment.",
        rate.retryAfterSeconds
      );
    }

    // 2. Read + size-guard the body.
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      throw new AiError("payload_too_large", "That request is too large.");
    }
    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(raw);
    } catch {
      throw new AiError("invalid_input", "The request body was not valid JSON.");
    }

    // 3. Validate input against the capability schema.
    const spec = getSpec(capability);
    const result = spec.inputSchema.safeParse(parsedBody);
    if (!result.success) {
      const message =
        result.error.issues[0]?.message ??
        `Text must be between 1 and ${MAX_INPUT_CHARS} characters.`;
      throw new AiError("invalid_input", message);
    }
    const input = result.data;

    // 4. Credentials: BYOK, else server (env key / OIDC), else unavailable.
    const byok = byokKey(req);
    if (!byok && !hasServerCredentials()) {
      throw new AiError(
        "ai_unavailable",
        "AI features aren't configured on this server. Add your own key in Settings, or use the deterministic text tools."
      );
    }

    // 5. Anonymous daily quota (skipped for BYOK — user's own credit).
    let quota: QuotaResult | null = null;
    if (!byok) {
      quota = consumeQuota(key);
      if (!quota.ok) {
        throw new AiError(
          "quota_reached",
          "You've reached today's free AI limit. Add your own key in Settings to keep going."
        );
      }
    }

    const meta = getCapabilityMeta(capability);
    const model = resolveModel(meta.tier, byok);
    const built = spec.build(input);

    // 6a. Object mode → structured JSON.
    if (spec.mode === "object") {
      try {
        const { object } = await generateObject({
          model,
          schema: spec.outputSchema,
          system: built.system,
          prompt: built.prompt,
          abortSignal: req.signal,
        });
        return Response.json(
          { result: object },
          { headers: quotaHeaders(quota) }
        );
      } catch (error) {
        return handleModelError(error);
      }
    }

    // 6b. Text mode → full text via generateText, returned as plain text.
    //
    // We deliberately do NOT stream. `streamText` routes fatal failures (bad
    // key, no credit, unknown model, provider auth) to its internal onError and
    // then CLOSES the text stream empty — which reaches the client as a silent
    // HTTP 200 with no body, indistinguishable from a real empty result. That
    // violates the product's honesty rule (never present a blank as success).
    // Awaiting `generateText` throws on failure (verified: the object-mode path
    // behaves the same), so a failure always becomes an honest structured error
    // and a success is the genuine model text. Plain text keeps the existing
    // client reader unchanged.
    try {
      const { text } = await generateText({
        model,
        system: built.system,
        prompt: built.prompt,
        abortSignal: req.signal,
      });
      return new Response(text, {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          ...quotaHeaders(quota),
        },
      });
    } catch (error) {
      return handleModelError(error);
    }
  } catch (error) {
    return errorResponse(error);
  }
}

function handleModelError(error: unknown): Response {
  if (error instanceof Error && error.name === "AbortError") {
    // Client cancelled — no body needed.
    return new Response(null, { status: 499 });
  }
  return errorResponse(
    new AiError(
      "ai_error",
      "The AI service could not complete the request. Try again shortly."
    )
  );
}
