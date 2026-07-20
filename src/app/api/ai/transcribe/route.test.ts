import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

describe("POST /api/ai/transcribe", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 400 if content-type is not multipart/form-data", async () => {
    const req = new NextRequest("https://example.com/api/ai/transcribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("invalid_input");
  });

  it("returns 503 if API key is missing", async () => {
    const req = new NextRequest("https://example.com/api/ai/transcribe", {
      method: "POST",
      headers: { "content-type": "multipart/form-data" }
    });

    req.formData = async () => {
      const data = new FormData();
      const mockFile = new File(["dummy contents"], "test.mp3", { type: "audio/mp3" });
      data.append("file", mockFile);
      return data;
    };

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

  it("invokes OpenAI Whisper transcription on success", async () => {
    const mockWhisperResponse = {
      text: "Hello world transcript",
      segments: [
        { id: 0, start: 0, end: 2, text: "Hello world transcript" }
      ]
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockWhisperResponse), { status: 200 })
    );

    const req = new NextRequest("https://example.com/api/ai/transcribe", {
      method: "POST",
      headers: { 
        "content-type": "multipart/form-data",
        "x-byok-key": "test-key"
      }
    });

    req.formData = async () => {
      const data = new FormData();
      const mockFile = new File(["dummy audio contents"], "test.mp3", { type: "audio/mp3" });
      data.append("file", mockFile);
      return data;
    };

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.text).toBe("Hello world transcript");
    expect(body.segments).toHaveLength(1);
    expect(body.segments[0].speaker).toBe("Speaker 1");
    expect(fetchSpy).toHaveBeenCalled();
  });
});
