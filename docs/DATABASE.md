# Data storage — MK VoiceKit

## No server database in v1 (by design)

MK VoiceKit has **no server-side database and no server file storage**. This is
a deliberate decision, not a gap:

- The product is **local-first**. Everything the user creates — history,
  presets, the listening queue, preferences and usage stats — is theirs and
  lives on their device. There is no account system and no reason to hold user
  content on a server.
- The core feature (text-to-speech via the browser's `speechSynthesis`) needs
  no backend at all.
- The only server code is the optional, stateless `POST /api/ai/[capability]`
  route, which processes submitted text in-flight and **retains nothing**.

Adding a database now would be speculative (YAGNI) and would weaken the privacy
guarantee that imported text never leaves the device. If a future version adds
hosted/neural voices or cross-device sync, a server datastore will be designed
then, with its own migration and privacy review.

## Client-side persistence (IndexedDB)

Durable local data lives in **IndexedDB**, accessed through the typed module
`src/lib/storage.ts` (built on the `idb` package). Tiny, non-sensitive UI flags
use `localStorage`.

### Database: `mk-voicekit` (version 1)

| Object store | Key | Contents |
|---|---|---|
| `history` | `id` (keyPath) | Completed/spoken items: text, excerpt, char count, voice, rate/pitch/volume, duration, timestamp. |
| `presets` | `id` (keyPath) | Named voice + speed/pitch/volume favourites. |
| `kv` | explicit key | Small singletons: `prefs`, `stats`, `queue`, `byokKey`, and the `legacyMigrated` flag. |

### localStorage keys

| Key | Purpose |
|---|---|
| `vk-theme` | `light` / `dark` / `system` theme choice. |
| `vk-consent` | Analytics consent (`granted` / `denied`; unset ⇒ declined). |
| `vk-ai-quota` | Client-side daily AI usage counter (`{ day, count }`). |
| `tts-*` (legacy) | Read-only: migrated once from the previous Vue app, then left untouched. |

## Schemas & validation

Every record is defined by a **Zod schema** in `src/lib/storage.ts`
(`historyEntrySchema`, `presetSchema`, `queueItemSchema`, `statsSchema`,
`prefsSchema`). All reads are `safeParse`d: corrupted or outdated data degrades
to typed defaults instead of throwing. Reads also guard against SSR and against
IndexedDB being unavailable (private mode), returning defaults in both cases.

## Limits & lifecycle

- **History cap:** the newest `MAX_HISTORY_ENTRIES = 200` entries are kept;
  older ones are trimmed on insert.
- **History toggle:** when `historyEnabled` is false, nothing is recorded.
- **Export / import:** `exportAllData()` produces a versioned
  (`product: "mk-voicekit", version: 1`) JSON payload; `importAllData()`
  validates it before replacing local data. Both power the Settings page.
- **Clear-all:** wipes the three stores and the theme/consent keys.

## One-time legacy migration

`migrateLegacyData()` reads the legacy `tts-rate` / `tts-pitch` / `tts-volume`,
`tts-history` and `tts-stats` localStorage keys written by the earlier Vue
prototype, imports them into IndexedDB exactly once (guarded by a
`legacyMigrated` kv flag), and leaves the legacy keys in place (non-destructive).
Migration never blocks the app: any failure is swallowed and a partial result is
acceptable.

## Testing

The storage layer is integration-tested against an in-memory `fake-indexeddb`
(`src/lib/storage.integration.test.ts`): prefs round-trips, history
add/list/trim/delete/restore, presets ordering, queue and stats persistence,
BYOK handling, the export/import round-trip, and the one-time migration. Reads
under "no IndexedDB" conditions are covered separately in `storage.test.ts`.
