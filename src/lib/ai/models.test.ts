import { afterEach, describe, expect, it, vi } from "vitest";
import { hasServerCredentials, modelIdForTier, resolveModel } from "./models";

afterEach(() => vi.unstubAllEnvs());

describe("modelIdForTier", () => {
  it("returns the default fast model when AI_MODEL is unset", () => {
    vi.stubEnv("AI_MODEL", "");
    expect(modelIdForTier("fast")).toBe("anthropic/claude-haiku-4.5");
  });

  it("returns the default quality model when AI_MODEL_QUALITY is unset", () => {
    vi.stubEnv("AI_MODEL_QUALITY", "");
    expect(modelIdForTier("quality")).toBe("anthropic/claude-sonnet-4-5");
  });

  it("honours the AI_MODEL override for the fast tier", () => {
    vi.stubEnv("AI_MODEL", "openai/gpt-5-mini");
    expect(modelIdForTier("fast")).toBe("openai/gpt-5-mini");
  });

  it("honours the AI_MODEL_QUALITY override for the quality tier", () => {
    vi.stubEnv("AI_MODEL_QUALITY", "anthropic/claude-opus-4-6");
    expect(modelIdForTier("quality")).toBe("anthropic/claude-opus-4-6");
  });

  it("trims surrounding whitespace from an override", () => {
    vi.stubEnv("AI_MODEL", "  openai/gpt-5  ");
    expect(modelIdForTier("fast")).toBe("openai/gpt-5");
  });
});

describe("hasServerCredentials", () => {
  it("is false when neither gateway key nor OIDC token is present", () => {
    vi.stubEnv("AI_GATEWAY_API_KEY", "");
    vi.stubEnv("VERCEL_OIDC_TOKEN", "");
    expect(hasServerCredentials()).toBe(false);
  });

  it("is true when a gateway API key is configured", () => {
    vi.stubEnv("AI_GATEWAY_API_KEY", "gw-key");
    vi.stubEnv("VERCEL_OIDC_TOKEN", "");
    expect(hasServerCredentials()).toBe(true);
  });

  it("is true when a Vercel OIDC token is present", () => {
    vi.stubEnv("AI_GATEWAY_API_KEY", "");
    vi.stubEnv("VERCEL_OIDC_TOKEN", "oidc-token");
    expect(hasServerCredentials()).toBe(true);
  });
});

describe("resolveModel", () => {
  it("resolves a language model for the ambient gateway (no BYOK)", () => {
    expect(resolveModel("fast", null)).toBeDefined();
  });

  it("resolves a language model from a one-off BYOK gateway", () => {
    expect(resolveModel("quality", "sk-user-key")).toBeDefined();
  });
});
