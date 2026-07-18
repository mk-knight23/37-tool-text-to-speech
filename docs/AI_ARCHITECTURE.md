# MK VoiceKit — AI Architecture

The AI layer is an optional add-on. Every core feature of MK VoiceKit (voice
picker, playback, transcript highlighting, navigation, queue, presets, history,
text prep, file import) works with no AI key at all. When no credential is
available the AI tools show an honest "AI unavailable" state and point the user
at the deterministic, in-browser text tools instead. Nothing is ever faked.

This document is the source of truth for how the AI layer works and the privacy
and honesty rules it must uphold (see STANDARDS §10).

## 1. Design goals

1. **Honest or nothing.** A failure never surfaces as a blank "success". Every
   error path returns a typed, human-readable state.
2. **No retention.** Submitted text is sent to the model only when the user
   presses Run, processed, and discarded. It is never written to a server-side
   store or log.
3. **Config over code.** Model names are environment variables, so a model
   rename or swap is a config change.
4. **Degrade, don't break.** Missing credentials, rate limits, and quota caps
   all resolve to clear UI states; the rest of the app is unaffected.

## 2. Endpoint

A single dynamic route handles every capability:

```
POST /api/ai/<capability>
```

Source: `src/app/api/ai/[capability]/route.ts` (Node runtime, `force-dynamic`,
`maxDuration = 60`). The request pipeline, in order:

1. **Capability check** — unknown id → `404 invalid_capability`.
2. **Rate limit** — per-client token bucket; over budget → `429 rate_limited`
   with `Retry-After`.
3. **Body size guard** — raw body over 512 KB → `413 payload_too_large`; then
   JSON parse (`400 invalid_input` on malformed JSON).
4. **Zod validation** — the capability's input schema; failure →
   `400 invalid_input` with the first schema message.
5. **Credential check** — no BYOK key and no server credential →
   `503 ai_unavailable` (the honest degraded state). No model call is made.
6. **Quota** — anonymous daily counter (skipped for BYOK); exhausted →
   `429 quota_reached`.
7. **Generate** — `generateText` (text mode) or `generateObject` (object mode)
   via a gateway model string. `X-Quota-Limit` / `X-Quota-Remaining` headers are
   attached to successful responses.

### Why not streaming

Text mode uses `generateText`, not `streamText`. `streamText` routes fatal model
failures (bad key, no credit, unknown model, provider auth) to its internal
`onError` callback and then closes the text stream empty. That reaches the
client as HTTP 200 with an empty body, which is indistinguishable from a real
empty result — a silent failure that reads as success. Awaiting `generateText`
throws on failure, so a failure is always an honest structured error and a
success is always the genuine model text. The full text is returned as
`text/plain`, which the existing client reader consumes unchanged. This trades
token-by-token streaming for a guarantee the product's honesty rule requires.

## 3. Capabilities

The catalog (`src/lib/ai/catalog.ts`) is pure data, safe to import on the
client. The server specs (`src/lib/ai/capabilities.ts`) attach the zod schemas
and prompt builders. Two response modes exist:

- **text** — returns plain text (rewrite, simplify, reading level, translate,
  summarize, podcast script, notes-to-narration).
- **object** — returns validated structured JSON (chapters, pronunciation
  suggestions, multi-speaker turns).

| Capability id | Mode | Tier | Params |
|---|---|---|---|
| `rewrite-for-natural-speech` | text | quality | — |
| `simplify` | text | fast | — |
| `change-reading-level` | text | quality | `level` |
| `translate` | text | fast | `targetLanguage` |
| `summarize` | text | fast | — |
| `chapter-generation` | object | fast | — |
| `article-to-podcast-script` | text | quality | — |
| `notes-to-narration` | text | quality | — |
| `multi-speaker-formatting` | object | quality | — |
| `pronunciation-suggestions` | object | fast | — |

Max input length is `MAX_INPUT_CHARS` (20,000). Every prompt instructs the model
to return only the transformed content and never to invent facts.

## 4. Models and credentials

`src/lib/ai/models.ts` resolves a gateway model string per tier:

- `AI_MODEL` — fast/default tier (default `anthropic/claude-haiku-4.5`).
- `AI_MODEL_QUALITY` — higher-quality tier (default
  `anthropic/claude-sonnet-4-5`).

Auth uses the Vercel AI Gateway: `AI_GATEWAY_API_KEY` locally, or Vercel OIDC on
deploy (no key to set there). `hasServerCredentials()` is true when either is
present; when false and no BYOK key is sent, the route short-circuits with
`ai_unavailable` rather than attempting a call that would fail.

## 5. BYOK — the single documented pattern

MK VoiceKit uses exactly one bring-your-own-key pattern:

- The user pastes a Vercel AI Gateway key in **Settings**. It is stored on the
  device only, in IndexedDB via `src/lib/storage.ts` (`getByokKey` /
  `setByokKey`). It is never sent to analytics.
- On each AI request the client attaches it as the `x-byok-key` header
  (`src/lib/ai/client.ts`).
- The server reads it per request (`src/lib/ai/request.ts`), uses it to build a
  one-off gateway for that single call, and **never logs or persists it**.
- A BYOK request bypasses the server's anonymous daily quota (the user is
  spending their own credit) but still passes rate limiting and validation.

There is no other key path (no `Authorization` passthrough, no cookie, no
server-stored key).

## 6. Rate limiting and quota

Both are best-effort and in-memory, which on serverless means per-instance and
reset on cold start. This is documented, not hidden (see SECURITY.md). A durable
limiter (Redis/Upstash) would be needed for hard global guarantees.

- **Rate limit** (`src/lib/ai/rate-limit.ts`) — token bucket, capacity 12,
  refilling to full in ~60s, keyed by client IP.
- **Quota** (`src/lib/ai/quota.ts`) — daily anonymous counter, `DAILY_AI_LIMIT`
  (40) actions per UTC day. The client keeps its own counter
  (`src/lib/ai/quota-client.ts`) that drives the usage indicator and is
  authoritative for the UI; the server counter is a secondary guardrail.

## 7. Cancellation

The client holds an `AbortController` per run and calls `abort()` on Cancel. The
signal is passed to `fetch`, and the route forwards `req.signal` to the model
call. An aborted generation returns `499` (client cancelled) with no body; the
UI simply returns to idle.

## 8. Errors

`src/lib/ai/errors.ts` defines the stable error codes and their HTTP statuses:

| Code | Status | Meaning |
|---|---|---|
| `invalid_capability` | 404 | Unknown capability id |
| `invalid_input` | 400 | Failed zod validation / bad JSON |
| `payload_too_large` | 413 | Raw body over the hard cap |
| `rate_limited` | 429 | Token bucket empty (has `Retry-After`) |
| `quota_reached` | 429 | Daily anonymous quota spent |
| `ai_unavailable` | 503 | No credential and no BYOK key |
| `ai_error` | 502 | Upstream model/provider failure |

Error bodies carry only `{ code, message, retryAfterSeconds? }`. They never leak
stack traces, provider details, the user's text, or key material.

## 9. Honest degraded state and deterministic fallbacks

When AI is unavailable (no key) or fails, the AI panel shows the plain message
and links to the tools that run entirely in the browser, with no AI:

- **Text prep** (`src/lib/textprep/*`) — number expansion, abbreviation
  expansion, and pause normalization. These cover the deterministic path for
  cleaning text for speech, including the pronunciation-adjacent work (labelled
  "local processing, not AI").
- **Markdown headings → chapters** (`src/lib/parsers/markdown.ts`,
  `stripMarkdown`) — heading-based chapter detection for imported Markdown,
  independent of the AI chapter generator.

These are surfaced as normal core features, not as AI teasers.

## 10. Privacy

- Submitted text is sent to the model only on an explicit Run and is not
  retained server-side (no DB, no file store, no logging of prompts).
- Analytics (`ai_started` / `ai_completed` / `ai_failed` / `quota_reached`) are
  consent-gated and carry only the capability name, a bucketed character count,
  and error codes — never the text, the result, or the BYOK key.
- The BYOK key lives only on the user's device and is sent only as a per-request
  header.

See PRIVACY.md and SECURITY.md for the full statements.

## 11. Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `AI_GATEWAY_API_KEY` | no | — | Gateway credential (local / non-Vercel hosts) |
| `AI_MODEL` | no | `anthropic/claude-haiku-4.5` | Fast tier model |
| `AI_MODEL_QUALITY` | no | `anthropic/claude-sonnet-4-5` | Quality tier model |

With none set, the app builds and the text-to-speech workspace works fully; the
AI tools report `ai_unavailable` until a key (server or BYOK) exists. See
`.env.example` for the complete list including SEO and analytics variables.

## 12. Testing

- `src/lib/ai/capabilities.test.ts` — every catalog id has a matching spec and
  mode; input schemas reject empty/oversized input; object output schemas
  validate.
- `src/lib/ai/errors.test.ts` — code→status mapping, safe bodies, request
  helpers (client key, BYOK trimming).
- `src/lib/ai/quota.test.ts`, `rate-limit.test.ts` — counter and bucket logic,
  UTC day reset, per-key isolation.
- `src/lib/ai/route.test.ts` — the route end to end with the SDK mocked: text
  and object success, honest `ai_error` on model failure (the "no silent empty
  200" guarantee), `499` on abort, and the capability/input/credential guards.
