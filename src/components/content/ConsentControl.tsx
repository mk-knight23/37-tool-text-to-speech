"use client";

import { useEffect, useState } from "react";
import { GTM_ID, getConsent, setConsent, type ConsentState } from "@/lib/analytics";
import { cn } from "@/lib/cn";

/**
 * Consent toggle used on /cookies and mirrored in /settings. Reads and writes
 * the local consent preference (default: declined). When no analytics container
 * is configured for the build, it explains that nothing is tracked instead of
 * offering a meaningless switch.
 */
export function ConsentControl() {
  const [consent, setConsentState] = useState<ConsentState | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only consent read
    setConsentState(getConsent());
    const onChange = (event: Event) => {
      setConsentState((event as CustomEvent<ConsentState>).detail);
    };
    window.addEventListener("vk-consent-changed", onChange);
    return () => window.removeEventListener("vk-consent-changed", onChange);
  }, []);

  if (!GTM_ID) {
    return (
      <div className="rounded-lg border border-border bg-surface-sunken p-4 text-sm text-text-muted">
        Analytics is not configured in this build, so nothing is tracked and no
        third-party scripts load. There is nothing to consent to.
      </div>
    );
  }

  const choose = (state: ConsentState) => {
    setConsent(state);
    setConsentState(state);
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-sm font-medium text-text">
        Analytics is currently{" "}
        <strong>
          {consent === "granted" ? "allowed" : "declined"}
        </strong>
        {consent === null ? " (declined by default)" : ""}.
      </p>
      <div
        role="radiogroup"
        aria-label="Analytics consent"
        className="mt-3 inline-flex gap-1 rounded-md border border-border-strong p-1"
      >
        {(["denied", "granted"] as const).map((state) => (
          <button
            key={state}
            type="button"
            role="radio"
            aria-checked={consent === state}
            onClick={() => choose(state)}
            className={cn(
              "min-h-9 rounded-sm px-4 text-sm font-bold",
              consent === state
                ? "bg-primary text-on-primary"
                : "text-text hover:bg-surface-sunken"
            )}
          >
            {state === "granted" ? "Allow" : "Decline"}
          </button>
        ))}
      </div>
    </div>
  );
}
