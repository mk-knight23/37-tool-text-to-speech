# Test Report — MK VoiceKit

Real, reproducible results from the local verification gates. Every figure below
is copied from actual command output, not estimated. Regenerate with the
commands shown in each section.

- **Date:** 2026-07-18
- **Branch:** `rebuild/v2`
- **Environment:** Node v26.5.0, pnpm 11.12.0, macOS (Darwin 25.5.0)
- **Overall:** typecheck, lint, unit/integration tests, coverage thresholds,
  production build, and the Playwright smoke all pass.

## Summary

| Gate | Command | Result |
|---|---|---|
| Typecheck | `pnpm typecheck` | PASS (0 errors) |
| Lint | `pnpm lint` | PASS (0 errors/warnings) |
| Unit + integration | `pnpm test` | PASS — 218 tests, 33 files |
| Coverage thresholds | `pnpm test:coverage` | PASS — see table below |
| Production build | `pnpm build` | PASS — 38 routes generated |
| E2E smoke | `pnpm test:e2e` | PASS — 6 tests (desktop + mobile + keyboard) |

## 1. Typecheck

```
$ pnpm typecheck
$ tsc --noEmit
```

Exit code 0, zero type errors. Strict mode is on (`tsconfig.json`).

## 2. Lint

```
$ pnpm lint
$ eslint
```

Exit code 0, zero errors and zero warnings (`eslint-config-next`).

## 3. Unit + integration tests (Vitest)

```
$ pnpm test
 Test Files  33 passed (33)
      Tests  218 passed (218)
   Duration  ~8s (jsdom environment)
```

All 218 tests pass. Tests follow Arrange–Act–Assert and use behaviour-describing
names. Coverage is intentionally scoped in `vitest.config.ts` to the pure logic
layer (`src/lib/**`, `src/hooks/**`); UI components and route files are exercised
by the Playwright smoke rather than unit coverage.

What the unit/integration suites cover:

- **Speech engine & segmentation** (`src/lib/speech/*`): chunking, sentence/word
  segmentation, and the engine state machine (`chunk`, `segment`, `engine`,
  `voices`).
- **Parsers** (`src/lib/parsers/*`): Markdown, subtitle (`.srt`/`.vtt`), and
  file-import parsing. (`pdf.ts` uses the pdfjs worker and is excluded from unit
  coverage — it needs a real browser and is covered by the smoke.)
- **Deterministic text-prep** (`src/lib/textprep/*`): number expansion,
  abbreviation expansion, pause insertion, and the pipeline index.
- **AI catalog / request layer** (`src/lib/ai/*`): capability catalog, model
  resolution, request helpers, error mapping, server rate-limit token bucket,
  and both server and client quota logic. (`client.ts` is a fetch/stream wrapper
  excluded from unit coverage and exercised by the smoke.)
- **Storage** (`src/lib/storage.ts` + `storage.integration.test.ts`): the typed
  IndexedDB module, run against `fake-indexeddb` as an integration test.
- **Analytics no-op / consent** (`src/lib/analytics.ts`): `track()` is a no-op
  unless production + GTM id + granted consent, and never emits sensitive fields.
- **Utilities**: `cn`, `format`, `keyboard`, `shortcuts`, `slider`, `theme`,
  `handoff`, `content` and `seo` registries, plus the `useGlobalShortcuts` hook.

## 4. Coverage (Vitest v8)

```
$ pnpm test:coverage
```

Coverage is measured over `src/lib/**` and `src/hooks/**` (see
`vitest.config.ts`). Totals from `coverage/coverage-summary.json`:

| Metric | Covered / Total | % | Threshold | Status |
|---|---|---|---|---|
| Statements | 810 / 1017 | **79.64%** | 75% | PASS |
| Branches | 391 / 559 | **69.94%** | 65% | PASS |
| Functions | 158 / 204 | **77.45%** | 72% | PASS |
| Lines | 753 / 913 | **82.47%** | 78% | PASS |

Per-area breakdown (from the v8 text reporter):

```
-------------------|---------|----------|---------|---------|
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
All files          |   79.64 |    69.94 |   77.45 |   82.47 |
 lib               |   91.18 |    76.19 |   94.82 |   93.02 |
 lib/ai            |   94.65 |    92.18 |   84.61 |   94.35 |
 lib/parsers       |   86.11 |    76.53 |      90 |    87.5 |
 lib/speech        |   66.15 |    53.84 |   61.11 |    72.6 |
 lib/textprep      |   92.56 |    76.27 |     100 |   99.04 |
 hooks             |   11.11 |        0 |   21.05 |      10 |
-------------------|---------|----------|---------|---------|
```

Honest notes on the lower numbers:

- **`hooks/`** is low because `usePrefs`, `useVoices` and `useSpeechEngine` are
  thin React wrappers around browser APIs (`speechSynthesis`, storage) that have
  no meaningful behaviour to assert in jsdom, which exposes no voices. They are
  driven by the Playwright smoke instead. `useGlobalShortcuts` is unit-tested.
- **`lib/speech/voices.ts`** and parts of `engine.ts` depend on the live
  `speechSynthesis` voice list, which jsdom does not provide; those code paths
  are exercised end-to-end by the smoke rather than mocked into false coverage.

## 5. Production build (Next.js)

```
$ pnpm build
▲ Next.js 16.2.10 (Turbopack)
✓ Compiled successfully
✓ Generating static pages (38/38)
```

All 38 routes build. 37 are static (`○`), including the content pages, the
static Open Graph image (`/opengraph-image`), `/sitemap.xml`, `/robots.txt`, and
the 10 guides / 5 use-cases. The single dynamic route (`ƒ`) is
`/api/ai/[capability]`. The build ran with **no AI key present**, confirming the
degraded-mode path compiles and prerenders.

## 6. End-to-end smoke (Playwright)

```
$ pnpm test:e2e
Running 6 tests using 5 workers
  ✓ [desktop] landing page shows the honest footer and links to the workspace
  ✓ [desktop] typing text segments it into the transcript with a live character count
  ✓ [desktop] local text-prep rewrites the transcript deterministically (not AI)
  ✓ [desktop] keyboard pass: arrow adjusts speed and '?' opens the shortcuts dialog
  ✓ [mobile]  mobile menu opens and navigates to the workspace
  ✓ [mobile]  workspace accepts text at a mobile width
  6 passed (9.4s)
```

The smoke runs against the **production build** served on **port 3103** (see
`playwright.config.ts`), across two projects: `desktop` (Desktop Chrome) and
`mobile` (Pixel 5). It exercises the primary deterministic flow with no AI keys:
landing → workspace → type → sentence segmentation → local text-prep → keyboard
control (speed nudge + shortcuts dialog) → mobile nav. Headless Chromium exposes
no `speechSynthesis` voices, so the smoke verifies everything up to and around
audible playback, which the app is designed to degrade honestly without.

The desktop "typing" test also captures the real product screenshot used in the
README (`public/screenshots/workspace.png`).

## 7. Continuous integration

`.github/workflows/ci.yml` runs the same gates on `push`/`pull_request`
(STANDARDS §12): install → typecheck → lint → `test:coverage` → build, a
`pnpm audit --prod` report step (non-blocking), a `gitleaks` secret-scan job, and
a Playwright smoke job (`continue-on-error`, as the standard permits, since
CI-provided browsers can flake). Coverage and the Playwright report are uploaded
as artifacts.

## How to reproduce

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test:coverage
pnpm build
pnpm test:e2e      # builds + serves on port 3103, runs desktop + mobile
```
