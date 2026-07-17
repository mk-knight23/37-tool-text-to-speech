import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Content-Security-Policy (STANDARDS §8).
 *
 * - `script-src 'unsafe-inline'`: required by Next.js App Router inline
 *   bootstrap scripts and the pre-paint theme script. Documented exception;
 *   no `unsafe-eval` in production.
 * - GTM/GA hosts are listed but the GTM script itself only loads after
 *   explicit consent AND a configured NEXT_PUBLIC_GTM_ID (see
 *   src/lib/analytics.ts) — no third-party request happens by default.
 * - `worker-src 'self' blob:`: the pdf.js text-extraction worker is served
 *   same-origin from /pdf.worker.min.mjs.
 * - CSP is applied in production only; Next dev tooling (HMR, eval source
 *   maps) is incompatible with it.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.googletagmanager.com",
  "font-src 'self'",
  "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  ...(isProd ? [{ key: "Content-Security-Policy", value: csp }] : []),
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
