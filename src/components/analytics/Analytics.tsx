"use client";

/**
 * Consent-gated analytics shell (STANDARDS §6/§7).
 *
 * Honesty first: when neither NEXT_PUBLIC_GTM_ID nor NEXT_PUBLIC_GA_MEASUREMENT_ID is configured,
 * there is no third-party script to load and nothing to consent to, so neither the banner
 * nor GTM/GA4 ever appears.
 */

import Script from "next/script";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  GTM_ID,
  GA_MEASUREMENT_ID,
  getConsent,
  setConsent,
  track,
  type ConsentState,
} from "@/lib/analytics";

const IS_PROD = process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true";

export function Analytics() {
  const [consent, setConsentState] = useState<ConsentState | null>(null);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
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

  // Track client-side route changes without duplicate page views
  useEffect(() => {
    if (ready && consent === "granted" && pathname) {
      track("page_view", { path: pathname });
    }
  }, [pathname, ready, consent]);

  const hasIdentifier = GTM_ID.length > 0 || GA_MEASUREMENT_ID.length > 0;
  if (!hasIdentifier || !ready) return null;

  const loadScripts = IS_PROD && consent === "granted";

  return (
    <>
      {loadScripts && GTM_ID ? (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="gtm-noscript"
            />
          </noscript>
        </>
      ) : loadScripts && GA_MEASUREMENT_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });`}
          </Script>
        </>
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
