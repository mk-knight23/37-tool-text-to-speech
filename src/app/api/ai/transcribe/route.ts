import { consumeToken } from "@/lib/ai/rate-limit";
import { AiError, errorResponse } from "@/lib/ai/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

interface Segment {
  id: number;
  start: number;
  end: number;
  text: string;
  speaker: string;
}

export async function POST(request: Request): Promise<Response> {
  // 1. Rate limiting check
  const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const limitRes = consumeToken(clientIp);
  if (!limitRes.ok) {
    return errorResponse(
      new AiError(
        "rate_limited",
        `Too many requests. Please wait ${limitRes.retryAfterSeconds} seconds.`,
        limitRes.retryAfterSeconds
      )
    );
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      throw new AiError("invalid_input", "Content type must be multipart/form-data.");
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const language = formData.get("language") as string | null;

    if (!file) {
      throw new AiError("invalid_input", "Missing file parameter in request form data.");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new AiError("payload_too_large", "Audio file exceeds the 25MB limit.");
    }

    // Retrieve OpenAI API key
    const apiKey = request.headers.get("x-byok-key") || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new AiError(
        "ai_unavailable",
        "OpenAI API key is missing. Please add your key in Settings."
      );
    }

    // 2. Prepare OpenAI Whisper request form data
    const openAiFormData = new FormData();
    openAiFormData.append("file", file);
    openAiFormData.append("model", "whisper-1");
    openAiFormData.append("response_format", "verbose_json");
    if (language) {
      openAiFormData.append("language", language);
    }

    // 3. Dispatch to OpenAI
    const openAiRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: openAiFormData,
    });

    if (!openAiRes.ok) {
      const errBody = await openAiRes.json().catch(() => ({}));
      const msg = errBody.error?.message || "OpenAI Whisper request failed.";
      throw new AiError("ai_error", msg);
    }

    const result = await openAiRes.json();

    // Map OpenAI verbose_json segments to clean Editor segments
    const segments: Segment[] = (result.segments || []).map((seg: { id?: number; start?: number; end?: number; text?: string }) => ({
      id: Number(seg.id) || 0,
      start: Number(seg.start) || 0,
      end: Number(seg.end) || 0,
      text: (seg.text || "").trim(),
      speaker: "Speaker 1",
    }));

    return new Response(
      JSON.stringify({
        text: result.text || "",
        segments,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    return errorResponse(error);
  }
}
