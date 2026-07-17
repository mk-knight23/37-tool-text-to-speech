# MK VoiceKit — Analytics Plan

Covers the consent-gated analytics implemented in this phase (STANDARDS §6).

## Principles

- **Off by default.** No analytics script loads unless three conditions all
  hold: `NEXT_PUBLIC_GTM_ID` is set, `NODE_ENV === "production"`, and the user
  has explicitly granted consent (default: declined).
- **No personal or content data ever.** Events carry only feature names, counts,
  bucketed sizes and durations — never document/narration text, file names,
  voice names typed by the user, keys, or BYOK credentials.

## Implementation

- `src/lib/analytics.ts` — the typed core:
  - `AnalyticsEvent` union (the shared event vocabulary).
  - `track(event, params?)` — a no-op unless `isAnalyticsEnabled()` is true.
  - `getConsent` / `setConsent` — consent stored in `localStorage` under
    `vk-consent`; changes broadcast a `vk-consent-changed` event so open tabs
    stay in sync.
- `src/components/analytics/Analytics.tsx` — renders the consent banner (only
  when a GTM id is configured) and injects the GTM script only after consent in
  production. When no GTM id is set, there is no banner and no script at all.
- Consent can be changed anytime on `/cookies`
  (`src/components/content/ConsentControl.tsx`) and in `/settings`.

## Event map (where each fires)

| Event              | Fires when…                                       |
| ------------------ | ------------------------------------------------- |
| `tool_opened`      | Workspace mounts                                  |
| `tool_started`     | Playback starts (button, keyboard, or a sentence) |
| `tool_completed`   | An item finishes playing                          |
| `file_selected`    | A file is chosen to import (param: extension)     |
| `file_processed`   | A file is imported successfully                    |
| `ai_started`       | An AI capability run begins (param: capability)   |
| `ai_completed`     | An AI run succeeds                                 |
| `ai_failed`        | An AI run fails (param: capability, error code)   |
| `quota_reached`    | The daily free AI limit is hit                    |
| `result_copied`    | An AI result is copied (param: capability)        |
| `history_opened`   | The history page mounts                            |
| `settings_changed` | A discrete setting is toggled (param: setting)    |
| `guide_opened`     | A guide or use-case article mounts (param: slug)  |

Events defined in the union but not yet wired (`tool_failed`,
`result_exported`, `result_shared`, `feedback_submitted`) are reserved for
features that don't exist in this phase (e.g. there is no audio export, so no
`result_exported`). They will be wired when those features land, rather than
firing dishonestly now.

## Parameter hygiene

- `file_selected` sends only the file **extension**, derived locally — never the
  file name.
- Sizes, when sent, are bucketed via `bucketChars` (`src/lib/format.ts`).
- Setting changes send a stable `setting` key (e.g. `auto_scroll`), never the
  value if it could be sensitive.

## Verification

- With no `NEXT_PUBLIC_GTM_ID` (the default for local/dev), `track()` is a no-op
  and no banner or script appears — confirmed by the app running with a clean
  network panel.
- In development, analytics are disabled regardless of consent.
