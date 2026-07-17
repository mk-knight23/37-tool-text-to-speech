"use client";

/**
 * Consent-gated analytics shell (STANDARDS §6/§7).
 *
 * Honesty first: when NEXT_PUBLIC_GTM_ID is not configured, there is no
 * third-party script to load and nothing to consent to, so neither the banner
 * nor GTM ever appears — the "works entirely in your browser" claim stays
 * literally true. When GTM *is* configured, the banner is shown until the user
 * chooses (default: declined), and the GTM script loads only after an explicit
 * "granted" choice in production.
 */

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  GTM_ID,
  getConsent,
  setConsent,
  type ConsentState,
} from "@/lib/analytics";

const IS_PROD = process.env.NODE_ENV === "production";

export function Analytics() {
  const [consent, setConsentState] = useState<ConsentState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Consent lives in localStorage, only readable on the client.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only consent read
    setConsentState(getConsent());
    setReady(true);
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<ConsentState>).detail;
      setConsentState(detail);
    };
    window.addEventListener("vk-consent-changed", onChange);
    return () => window.removeEventListener("vk-consent-changed", onChange);
  }, []);

  // No GTM configured -> no banner, no scripts, ever.
  if (!GTM_ID) return null;
  if (!ready) return null;

  const loadGtm = IS_PROD && consent === "granted";

  return (
    <>
      {loadGtm ? (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      ) : null}

      {consent === null ? (
        <ConsentBanner
          onChoice={(choice) => {
            setConsent(choice);
            setConsentState(choice);
          }}
        />
      ) : null}
    </>
  );
}

function ConsentBanner({
  onChoice,
}: {
  onChoice: (choice: ConsentState) => void;
}) {
  return (
    <div
      role="dialog"
      aria-label="Analytics consent"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-lg border border-border bg-surface-raised p-4 shadow-[var(--shadow-3)]"
    >
      <p className="text-sm text-text">
        We use privacy-respecting analytics only if you allow it. No document or
        narration text is ever sent — just anonymous usage counts. You can
        change this any time in Settings.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onChoice("granted")}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-primary px-4 font-bold text-on-primary hover:bg-primary-hover"
        >
          Allow
        </button>
        <button
          type="button"
          onClick={() => onChoice("denied")}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-border-strong px-4 font-bold text-text hover:bg-surface-sunken"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
