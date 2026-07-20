import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

describe("POST /api/ai/tts", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 400 if input parameters are missing", async () => {
    const req = new NextRequest("https://example.com/api/ai/tts", {
      method: "POST",
      body: JSON.stringify({ text: "Hello" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("invalid_input");
  });

  it("returns 413 if text is too long", async () => {
    const longText = "a".repeat(2000);
    const req = new NextRequest("https://example.com/api/ai/tts", {
      method: "POST",
      body: JSON.stringify({ text: longText, voiceId: "alloy", provider: "openai" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(413);
    const body = await res.json();
    expect(body.error.code).toBe("payload_too_large");
  });

  it("returns 400 when API key is missing", async () => {
    const req = new NextRequest("https://example.com/api/ai/tts", {
      method: "POST",
      body: JSON.stringify({ text: "Hello", voiceId: "alloy", provider: "openai" }),
    });
    // Ensure env variable is cleared
    const originalOpenAiKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const res = await POST(req);
      expect(res.status).toBe(503);
      const body = await res.json();
      expect(body.error.code).toBe("ai_unavailable");
    } finally {
      process.env.OPENAI_API_KEY = originalOpenAiKey;
    }
  });

  it("invokes OpenAI synthesize when provider is openai", async () => {
    const mockAudioBytes = new Uint8Array([1, 2, 3, 4]);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(mockAudioBytes, { status: 200 })
    );

    const req = new NextRequest("https://example.com/api/ai/tts", {
      method: "POST",
      headers: { "x-byok-key": "test-openai-key" },
      body: JSON.stringify({ text: "Test voice", voiceId: "alloy", provider: "openai" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("audio/mpeg");

    const arrayBuffer = await res.arrayBuffer();
    expect(new Uint8Array(arrayBuffer)).toEqual(mockAudioBytes);
    expect(fetchSpy).toHaveBeenCalled();
  });
});
