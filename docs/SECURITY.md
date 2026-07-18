# Security — MK VoiceKit

## Responsible disclosure

If you find a security issue, please report it privately to **kazi@reprime.com**
(also published in [`public/.well-known/security.txt`](public/.well-known/security.txt)).
Please include steps to reproduce and, where relevant, a proof of concept. We
aim to acknowledge reports within a few days. Please do not open a public issue
for undisclosed vulnerabilities, and please avoid accessing or modifying other
people's data while testing.

## Scope

- In scope: this repository and the deployed app at `voicekit.mkazi.live`
  (front end and the `/api/ai/*` route).
- Out of scope: the upstream AI provider / Vercel AI Gateway, third-party
  browser speech voices (supplied by the user's operating system), and social
  engineering.

## Threat model summary

MK VoiceKit is local-first and holds no user accounts or server-side user data,
which removes whole classes of risk (no auth, no session store, no user
database to breach). The remaining surface and how it is addressed:

| Concern (STRIDE) | Surface | Mitigation |
|---|---|---|
| **Tampering / Injection** | `/api/ai/*` request body | Zod-validated input, JSON parse guard, 512 KB body cap plus a per-capability character limit. |
| **Information disclosure** | AI request text, BYOK key | No retention, no logging of request content; BYOK key used only in-flight and never persisted or logged. |
| **Denial of service** | `/api/ai/*` | Per-client in-memory token-bucket rate limit + anonymous daily quota; `maxDuration` cap. |
| **XSS** | Rendered content | React escaping; strict CSP in production; no `dangerouslySetInnerHTML` of untrusted input. |
| **Clickjacking** | All routes | `frame-ancestors 'none'` + `X-Content-Type-Options: nosniff`. |
| **Spoofing / MITM** | Transport | HSTS (2 years, `includeSubDomains; preload`); `upgrade-insecure-requests`. |
| **Elevation via device APIs** | Browser features | `Permissions-Policy: camera=(), microphone=(), geolocation=()`. |

## Security controls

### HTTP headers (`next.config.ts`)

- **Content-Security-Policy** (production): `default-src 'self'`;
  `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`;
  `frame-ancestors 'none'`; `worker-src 'self' blob:`;
  `upgrade-insecure-requests`. GTM/GA hosts are allowlisted in `script-src` /
  `img-src` / `connect-src` but no request is made to them until the user
  consents.
- **Strict-Transport-Security**, **X-Content-Type-Options: nosniff**,
  **Referrer-Policy: strict-origin-when-cross-origin**, **Permissions-Policy**.

### API route (`/api/ai/[capability]`)

- Zod schema validation per capability; typed, non-leaking error responses.
- Coarse 512 KB body cap and a `MAX_INPUT_CHARS` limit.
- Per-IP token-bucket rate limiting and an anonymous daily quota.
- Credentials resolved from Vercel OIDC / `AI_GATEWAY_API_KEY`, or a
  per-request BYOK key; **no secrets in client code**, none logged.
- Request content is never persisted or logged.

### Secrets & supply chain

- No secrets are committed; `.env*` is gitignored except the documented
  `.env.example`. Required credentials are read from the environment.
- CI runs **gitleaks** (secret scanning) and a non-blocking **`pnpm audit --prod`**
  dependency report on every push/PR (`.github/workflows/ci.yml`).

## Known limitations (documented, not hidden)

- **Rate limit / quota are best-effort per instance.** They live in memory, so
  in a multi-instance serverless deployment each instance keeps its own
  counters. This is a soft-abuse guard, not a hard security boundary. A shared
  store (e.g. Vercel KV) would be the upgrade path if abuse becomes real.
- **`script-src 'unsafe-inline'`** is required by Next.js App Router's inline
  bootstrap and the pre-paint theme script. This is a documented exception;
  `unsafe-eval` is **not** allowed in production.
- CSP is applied in production only; Next.js dev tooling (HMR, eval source maps)
  is incompatible with it.
