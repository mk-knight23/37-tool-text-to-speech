/**
 * Route-level honesty tests for POST /api/ai/<capability>.
 *
 * The critical guarantee: a model failure in text mode must surface as a real
 * structured error, never a silent HTTP 200 with an empty body that the UI
 * would render as a (fabricated-looking) successful empty result. Object mode
 * and the no-credentials degraded state are covered too.
 *
 * The `ai` SDK and model resolver are mocked so no network/model is needed.
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const generateTextMock = vi.fn();
const generateObjectMock = vi.fn();
const hasServerCredentialsMock = vi.fn(() => true);

vi.mock("ai", () => ({
  generateText: (...args: unknown[]) => generateTextMock(...args),
  generateObject: (...args: unknown[]) => generateObjectMock(...args),
}));

vi.mock("@/lib/ai/models", () => ({
  hasServerCredentials: () => hasServerCredentialsMock(),
  resolveModel: () => "mock-model",
}));

import { POST } from "@/app/api/ai/[capability]/route";
import { __resetRateLimiter } from "@/lib/ai/rate-limit";
import { __resetQuota } from "@/lib/ai/quota";

function post(capability: string, body: unknown, ip = "1.2.3.4"): Promise<Response> {
  const req = new Request(`http://localhost/api/ai/${capability}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
  return POST(req, { params: Promise.resolve({ capability }) });
}

beforeEach(() => {
  __resetRateLimiter();
  __resetQuota();
  hasServerCredentialsMock.mockReturnValue(true);
  generateTextMock.mockReset();
  generateObjectMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/ai/<capability> — text mode", () => {
  test("returns the model output as plain text on success", async () => {
    generateTextMock.mockResolvedValue({ text: "Hello world." });
    const res = await post("summarize", { text: "some article text" }, "10.0.0.1");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");
    expect(await res.text()).toBe("Hello world.");
  });

  test("a model failure becomes an honest ai_error, never a silent empty 200", async () => {
    generateTextMock.mockRejectedValue(new Error("provider auth failed"));
    const res = await post("summarize", { text: "some article text" }, "10.0.0.2");
    expect(res.status).toBe(502);
    const body = (await res.json()) as { error: { code: string; message: string } };
    expect(body.error.code).toBe("ai_error");
    // Never leak the upstream provider detail.
    expect(body.error.message).not.toContain("provider auth failed");
  });

  test("client cancellation returns 499 with no body", async () => {
    const abort = new Error("aborted");
    abort.name = "AbortError";
    generateTextMock.mockRejectedValue(abort);
    const res = await post("summarize", { text: "some article text" }, "10.0.0.3");
    expect(res.status).toBe(499);
  });
});

describe("POST /api/ai/<capability> — guards", () => {
  test("unknown capability is rejected", async () => {
    const res = await post("does-not-exist", { text: "x" }, "10.0.1.1");
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("invalid_capability");
  });

  test("invalid input (empty text) is rejected with 400", async () => {
    const res = await post("summarize", { text: "" }, "10.0.1.2");
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("invalid_input");
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  test("no server credentials and no BYOK → honest 503 ai_unavailable", async () => {
    hasServerCredentialsMock.mockReturnValue(false);
    const res = await post("summarize", { text: "hello" }, "10.0.1.3");
    expect(res.status).toBe(503);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("ai_unavailable");
    expect(generateTextMock).not.toHaveBeenCalled();
  });
});

describe("POST /api/ai/<capability> — object mode", () => {
  test("returns the structured result on success", async () => {
    generateObjectMock.mockResolvedValue({
      object: { chapters: [{ title: "Intro", summary: "Opening." }] },
    });
    const res = await post("chapter-generation", { text: "long text" }, "10.0.2.1");
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      result: { chapters: { title: string }[] };
    };
    expect(body.result.chapters[0]?.title).toBe("Intro");
  });

  test("a model failure becomes an honest ai_error", async () => {
    generateObjectMock.mockRejectedValue(new Error("provider exploded"));
    const res = await post("chapter-generation", { text: "long text" }, "10.0.2.2");
    expect(res.status).toBe(502);
    const body = (await res.json()) as { error: { code: string; message: string } };
    expect(body.error.code).toBe("ai_error");
    expect(body.error.message).not.toContain("provider exploded");
  });
});
