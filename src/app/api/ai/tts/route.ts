import { consumeToken } from "@/lib/ai/rate-limit";
import { clientKey, byokKey } from "@/lib/ai/request";
import { AiError, errorResponse } from "@/lib/ai/errors";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_INPUT_CHARS = 1000;

interface TtsRequestBody {
  text: string;
  voiceId: string;
  provider: "openai" | "elevenlabs" | "google" | "azure" | "polly";
  rate?: number;
  pitch?: number;
  volume?: number;
}

export async function POST(req: Request) {
  try {
    // 1. Rate limiting
    const key = clientKey(req);
    const rateLimit = consumeToken(key);
    if (!rateLimit.ok) {
      throw new AiError(
        "rate_limited",
        "Too many requests. Please wait a moment.",
        rateLimit.retryAfterSeconds
      );
    }

    // 2. Read and parse body
    const body = (await req.json()) as TtsRequestBody;
    const { text, voiceId, provider, rate = 1.0, pitch = 1.0 } = body;

    if (!text || !voiceId || !provider) {
      throw new AiError("invalid_input", "Missing text, voiceId, or provider.");
    }

    if (text.length > MAX_INPUT_CHARS) {
      throw new AiError("payload_too_large", `Text is too long (maximum ${MAX_INPUT_CHARS} characters).`);
    }

    // 3. Resolve key (BYOK header or server environment variable)
    const byok = byokKey(req);
    const apiKey = byok || getServerApiKey(provider);

    if (!apiKey) {
      throw new AiError(
        "ai_unavailable",
        `API key is missing for ${provider}. Please add your key in Settings.`
      );
    }

    // 4. Dispatch to provider adapter
    let audioBuffer: Buffer;
    const contentType = "audio/mpeg";

    switch (provider) {
      case "openai":
        audioBuffer = await synthesizeOpenAi(text, voiceId, rate, apiKey);
        break;
      case "elevenlabs":
        audioBuffer = await synthesizeElevenLabs(text, voiceId, apiKey);
        break;
      case "google":
        audioBuffer = await synthesizeGoogle(text, voiceId, rate, pitch, apiKey);
        break;
      case "azure":
        audioBuffer = await synthesizeAzure(text, voiceId, rate, pitch, apiKey);
        break;
      case "polly":
        audioBuffer = await synthesizePolly(text, voiceId, apiKey);
        break;
      default:
        throw new AiError("invalid_capability", "Unsupported TTS provider.");
    }

    return new Response(new Uint8Array(audioBuffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });

  } catch (error) {
    if (error instanceof AiError) {
      return errorResponse(error);
    }
    const msg = error instanceof Error ? error.message : String(error);
    return errorResponse(new AiError("ai_error", msg || "Speech synthesis failed."));
  }
}

function getServerApiKey(provider: string): string | undefined {
  switch (provider) {
    case "openai":
      return process.env.OPENAI_API_KEY;
    case "elevenlabs":
      return process.env.ELEVENLABS_API_KEY;
    case "google":
      return process.env.GOOGLE_TTS_API_KEY;
    case "azure":
      return process.env.AZURE_SPEECH_KEY;
    case "polly":
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        const region = process.env.AWS_REGION || "us-east-1";
        return `${region}:${process.env.AWS_ACCESS_KEY_ID}:${process.env.AWS_SECRET_ACCESS_KEY}`;
      }
      return undefined;
    default:
      return undefined;
  }
}

/* ------------------------------------------------------------------ */
/* Provider Adapters                                                  */
/* ------------------------------------------------------------------ */

async function synthesizeOpenAi(text: string, voiceId: string, rate: number, apiKey: string): Promise<Buffer> {
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      input: text,
      voice: voiceId,
      speed: Math.max(0.25, Math.min(4.0, rate)),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function synthesizeElevenLabs(text: string, voiceId: string, apiKey: string): Promise<Buffer> {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`ElevenLabs API error (${response.status}): ${errorBody}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function synthesizeGoogle(text: string, voiceId: string, rate: number, pitch: number, apiKey: string): Promise<Buffer> {
  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: "en-US",
        name: voiceId,
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: Math.max(0.25, Math.min(4.0, rate)),
        pitch: Math.max(-20.0, Math.min(20.0, (pitch - 1) * 20)),
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Google TTS API error (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as { audioContent?: string };
  if (!data.audioContent) {
    throw new Error("Google Cloud TTS returned no audio content.");
  }

  return Buffer.from(data.audioContent, "base64");
}

async function synthesizeAzure(text: string, voiceId: string, rate: number, pitch: number, apiKey: string): Promise<Buffer> {
  let region = process.env.AZURE_SPEECH_REGION || "eastus";
  let key = apiKey;

  if (apiKey.includes(":")) {
    const parts = apiKey.split(":");
    region = parts[0] || region;
    key = parts[1] || apiKey;
  }

  const ratePercent = Math.round((rate - 1) * 100);
  const pitchPercent = Math.round((pitch - 1) * 100);
  
  const ssml = `
    <speak version='1.0' xml:lang='en-US'>
      <voice name='${voiceId}'>
        <prosody rate='${ratePercent >= 0 ? "+" : ""}${ratePercent}%' pitch='${pitchPercent >= 0 ? "+" : ""}${pitchPercent}%'>
          ${escapeXml(text)}
        </prosody>
      </voice>
    </speak>
  `.trim();

  const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
      "User-Agent": "MK-VoiceKit",
    },
    body: ssml,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Azure Speech API error (${response.status}): ${errorBody}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function synthesizePolly(text: string, voiceId: string, apiKey: string): Promise<Buffer> {
  let region = "us-east-1";
  let accessKeyId = "";
  let secretAccessKey = "";

  if (apiKey.includes(":")) {
    const parts = apiKey.split(":");
    region = parts[0] || region;
    accessKeyId = parts[1] || "";
    secretAccessKey = parts[2] || "";
  }

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials incomplete. Format region:accessKeyId:secretAccessKey is required.");
  }

  const host = `polly.${region}.amazonaws.com`;
  const url = `https://${host}/v1/speech`;
  
  const body = JSON.stringify({
    OutputFormat: "mp3",
    Text: text,
    VoiceId: voiceId,
    Engine: "neural",
  });

  const amzDate = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${region}/polly/aws4_request`;

  const payloadHash = crypto.createHash("sha256").update(body).digest("hex");
  const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-date";
  const canonicalRequest = ["POST", "/v1/speech", "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    crypto.createHash("sha256").update(canonicalRequest).digest("hex"),
  ].join("\n");

  const kDate = crypto.createHmac("sha256", "AWS4" + secretAccessKey).update(dateStamp).digest();
  const kRegion = crypto.createHmac("sha256", kDate).update(region).digest();
  const kService = crypto.createHmac("sha256", kRegion).update("polly").digest();
  const kSigning = crypto.createHmac("sha256", kService).update("aws4_request").digest();
  const signature = crypto.createHmac("sha256", kSigning).update(stringToSign).digest("hex");

  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Host": host,
      "X-Amz-Date": amzDate,
      "Authorization": authHeader,
    },
    body,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`AWS Polly API error (${response.status}): ${errorBody}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case "\"": return "&quot;";
      default: return c;
    }
  });
}
