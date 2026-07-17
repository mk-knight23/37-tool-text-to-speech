/**
 * Browser-side client for the AI routes.
 *
 * - Sends the source text and any params to `POST /api/ai/<id>`.
 * - Streams text-mode responses chunk-by-chunk via `onChunk`.
 * - Returns parsed structured results for object-mode responses.
 * - Attaches the BYOK key as `x-byok-key` only when the caller supplies one.
 * - Surfaces the server's structured error as an `AiClientError`.
 */

import type { AiErrorCode } from "./errors";
import { BYOK_HEADER } from "./request";
import type { CapabilityId } from "./catalog";

export type AiClientErrorCode = AiErrorCode | "network";

export class AiClientError extends Error {
  readonly code: AiClientErrorCode;
  readonly retryAfterSeconds?: number;

  constructor(
    code: AiClientErrorCode,
    message: string,
    retryAfterSeconds?: number
  ) {
    super(message);
    this.name = "AiClientError";
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

interface BaseRequest {
  id: CapabilityId;
  text: string;
  params?: Record<string, string>;
  byok?: string | null;
  signal?: AbortSignal;
}

function buildInit(request: BaseRequest): RequestInit {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (request.byok) {
    headers[BYOK_HEADER] = request.byok;
  }
  return {
    method: "POST",
    headers,
    body: JSON.stringify({ text: request.text, ...(request.params ?? {}) }),
    signal: request.signal,
  };
}

async function throwForErrorResponse(response: Response): Promise<never> {
  let code: AiClientErrorCode = "ai_error";
  let message = "Something went wrong. Please try again.";
  let retryAfterSeconds: number | undefined;
  try {
    const body = (await response.json()) as {
      error?: { code?: AiErrorCode; message?: string; retryAfterSeconds?: number };
    };
    if (body.error) {
      if (body.error.code) code = body.error.code;
      if (body.error.message) message = body.error.message;
      retryAfterSeconds = body.error.retryAfterSeconds;
    }
  } catch {
    // Non-JSON error body — keep the defaults.
  }
  throw new AiClientError(code, message, retryAfterSeconds);
}

export interface QuotaSnapshot {
  limit: number | null;
  remaining: number | null;
}

function readQuotaHeaders(response: Response): QuotaSnapshot {
  const limit = response.headers.get("X-Quota-Limit");
  const remaining = response.headers.get("X-Quota-Remaining");
  return {
    limit: limit ? Number(limit) : null,
    remaining: remaining ? Number(remaining) : null,
  };
}

export interface TextRequest extends BaseRequest {
  onChunk: (delta: string) => void;
}

export interface TextRunResult {
  text: string;
  quota: QuotaSnapshot;
}

export async function runTextCapability(
  request: TextRequest
): Promise<TextRunResult> {
  const response = await fetch(`/api/ai/${request.id}`, buildInit(request));
  if (!response.ok) {
    await throwForErrorResponse(response);
  }
  const quota = readQuotaHeaders(response);

  if (!response.body) {
    const text = await response.text();
    request.onChunk(text);
    return { text, quota };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) {
      full += chunk;
      request.onChunk(chunk);
    }
  }
  const tail = decoder.decode();
  if (tail) {
    full += tail;
    request.onChunk(tail);
  }
  return { text: full, quota };
}

export interface ObjectRunResult<T> {
  result: T;
  quota: QuotaSnapshot;
}

export async function runObjectCapability<T>(
  request: BaseRequest
): Promise<ObjectRunResult<T>> {
  const response = await fetch(`/api/ai/${request.id}`, buildInit(request));
  if (!response.ok) {
    await throwForErrorResponse(response);
  }
  const quota = readQuotaHeaders(response);
  const body = (await response.json()) as { result: T };
  return { result: body.result, quota };
}
