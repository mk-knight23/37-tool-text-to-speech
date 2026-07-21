/**
 * Consent-gated typed analytics (STANDARDS §6).
 *
 * `track` is a no-op unless ALL of:
 * - the user explicitly accepted analytics (default: declined),
 * - NEXT_PUBLIC_GTM_ID or NEXT_PUBLIC_GA_MEASUREMENT_ID is configured,
 * - NODE_ENV is production (or debug mode is enabled).
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
  | "tts_started"
  | "tts_paused"
  | "tts_completed"
  | "voice_selected"
  | "document_import_started"
  | "document_import_completed"
  | "document_import_failed"
  | "ai_action_started"
  | "ai_action_completed"
  | "ai_action_failed"
  | "transcription_started"
  | "transcription_completed"
  | "project_created"
  | "audio_exported"
  | "subtitle_exported"
  | "utility_used"
  | "search_performed"
  | "filter_applied"
  | "backup_exported"
  | "backup_imported"
  | "cta_clicked"
  | "error_shown"
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
  | "quota_reached"
  | "page_view";

export type AnalyticsParams = Record<string, string | number | boolean>;

export type ConsentState = "granted" | "denied";

const CONSENT_KEY = "vk-consent";

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
export const ANALYTICS_DEBUG = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
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
  const hasId = GTM_ID.length > 0 || GA_MEASUREMENT_ID.length > 0;
  const isProdOrDebug = process.env.NODE_ENV === "production" || ANALYTICS_DEBUG;
  return isProdOrDebug && hasId && getConsent() === "granted";
}

/**
 * Dispatches a privacy-safe analytics event.
 * Never includes raw document content, secrets, transcript text, or personal data.
 */
export function track(event: AnalyticsEvent, params?: AnalyticsParams): void {
  if (ANALYTICS_DEBUG && typeof window !== "undefined") {
    console.debug(`[Analytics Debug] ${event}`, params);
  }
  if (!isAnalyticsEnabled()) return;
  if (typeof window === "undefined") return;

  try {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({
      event,
      ...params,
      timestamp: Date.now(),
    });

    // Optional direct GA4 fallback if GTM is not used
    if (!GTM_ID && GA_MEASUREMENT_ID && typeof window.gtag === "function") {
      window.gtag("event", event, params);
    }
  } catch (err) {
    // Analytics failure must never break user workflows
    console.warn("Analytics tracking failure suppressed:", err);
  }
}
