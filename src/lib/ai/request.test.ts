import { describe, expect, it } from "vitest";
import { BYOK_HEADER, byokKey, clientKey } from "./request";

function req(headers: Record<string, string>): Request {
  return new Request("https://voicekit.mkazi.live/api/ai/summarize", { headers });
}

describe("clientKey", () => {
  it("uses the first hop of x-forwarded-for", () => {
    const key = clientKey(req({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }));
    expect(key).toBe("203.0.113.7");
  });

  it("trims whitespace around the forwarded address", () => {
    const key = clientKey(req({ "x-forwarded-for": "  198.51.100.4  " }));
    expect(key).toBe("198.51.100.4");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    expect(clientKey(req({ "x-real-ip": "192.0.2.9" }))).toBe("192.0.2.9");
  });

  it("returns 'unknown' when no client headers are present", () => {
    expect(clientKey(req({}))).toBe("unknown");
  });
});

describe("byokKey", () => {
  it("extracts and trims the BYOK header value", () => {
    expect(byokKey(req({ [BYOK_HEADER]: "  sk-test-123  " }))).toBe("sk-test-123");
  });

  it("returns null when the header is absent", () => {
    expect(byokKey(req({}))).toBeNull();
  });

  it("returns null when the header is present but empty/whitespace", () => {
    expect(byokKey(req({ [BYOK_HEADER]: "   " }))).toBeNull();
  });
});
