/**
 * Consent-gated typed analytics (STANDARDS §6).
 *
 * `track` is a no-op unless ALL of:
 * - the user explicitly accepted analytics (default: declined),
 * - NEXT_PUBLIC_GTM_ID is configured,
 * - NODE_ENV is production.
 *
 * Event params are limited to counts, bucketed sizes, feature names and
 * durations. Never send document text, file names, voice names typed by
 * users, keys, or any credential.
 */

export type AnalyticsEvent =
  | "tool_opened"
  | "tool_started"
  | "tool_completed"
  | "tool_failed"
  | "file_selected"
  | "file_processed"
  | "ai_started"
  | "ai_completed"
  | "ai_failed"
  | "result_exported"
  | "result_copied"
  | "result_shared"
  | "history_opened"
  | "settings_changed"
  | "feedback_submitted"
  | "guide_opened"
  | "quota_reached";

export type AnalyticsParams = Record<string, string | number | boolean>;

export type ConsentState = "granted" | "denied";

const CONSENT_KEY = "vk-consent";

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function getConsent(): ConsentState | null {
  if (typeof localStorage === "undefined") return null;
  const value = localStorage.getItem(CONSENT_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

export function setConsent(state: ConsentState): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(CONSENT_KEY, state);
  window.dispatchEvent(new CustomEvent("vk-consent-changed", { detail: state }));
}

export function isAnalyticsEnabled(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    GTM_ID.length > 0 &&
    getConsent() === "granted"
  );
}

export function track(event: AnalyticsEvent, params?: AnalyticsParams): void {
  if (!isAnalyticsEnabled()) return;
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
}
