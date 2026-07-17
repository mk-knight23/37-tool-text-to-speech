# MK VoiceKit — Design System (v2)

Seeded with the `ui-ux-pro-max` skill (2026-07-17), then adapted: the skill
proposed an indigo palette + Google-Fonts-served Atkinson Hyperlegible; both
were replaced to honor the audio-first direction, the no-font-CDN CSP rule,
and the "no purple-blue default" constraint. Every color pair below was
contrast-checked computationally (WCAG 2.2 AA); ratios are printed inline.

**Personality**: a friendly, calm, audio-first workspace. Think "well-lit
recording studio", not "AI dashboard". Dimensional through soft layered
surfaces and one signature waveform motif — never through glow, particles,
or gradients-as-decoration.

---

## 1. Color tokens

Deep **teal** is the sound/voice brand color; warm **amber** is the "live /
speaking now" accent (an homage to the legacy `audio-*` palette, refined for
contrast). Neutrals are warm paper in light mode and deep blue-slate in dark.

### 1.1 Light theme

| Token | Hex | Use | Contrast (validated) |
|---|---|---|---|
| `--color-bg` | `#FAF9F7` | page background (warm paper) | — |
| `--color-surface` | `#FFFFFF` | cards, panels | — |
| `--color-surface-sunken` | `#F1EFEA` | wells, transcript gutter, input backgrounds | — |
| `--color-text` | `#1F2933` | primary text | 14.0:1 on bg, 14.8:1 on surface |
| `--color-text-muted` | `#52616B` | secondary text, captions | 6.1:1 on bg, 6.4:1 on surface |
| `--color-primary` | `#0F766E` | brand teal: primary buttons, links, active states, waveform bars | 5.5:1 as text on surface; white on it 5.5:1 |
| `--color-primary-hover` | `#115E59` | hover/active fill | white on it 7.6:1 |
| `--color-primary-soft` | `#CCFBF1` | selected-sentence highlight, soft chips | text on it 13.1:1 |
| `--color-on-primary` | `#FFFFFF` | text/icons on primary | 5.5:1 |
| `--color-accent` | `#B45309` | "speaking now" amber: live word highlight border, chapter markers, record-style indicators | 5.0:1 as text on surface, 4.8:1 on bg |
| `--color-accent-soft` | `#FDE68A` | live word highlight fill | text on it 11.9:1 |
| `--color-danger` | `#B91C1C` | destructive actions, errors | 6.5:1 on surface |
| `--color-success` | `#15803D` | success states | 5.0:1 on surface |
| `--color-border` | `#D8D2C6` | hairline separators (decorative) | 1.5:1 (non-semantic only) |
| `--color-border-strong` | `#667085` | input borders, slider tracks — WCAG 1.4.11 boundaries | 5.0:1 on surface |
| `--color-focus` | `#0F766E` | focus ring | 5.5:1 vs surface |

### 1.2 Dark theme

| Token | Hex | Use | Contrast (validated) |
|---|---|---|---|
| `--color-bg` | `#0B1519` | page background (deep blue-slate, faint teal cast) | — |
| `--color-surface` | `#102028` | cards, panels | — |
| `--color-surface-sunken` | `#0D1A20` | wells, transcript gutter | — |
| `--color-surface-raised` | `#162B34` | popovers, sticky playback bar | — |
| `--color-text` | `#E8F1F2` | primary text | 16.1:1 on bg, 14.5:1 on surface |
| `--color-text-muted` | `#9FB6BC` | secondary text | 7.9:1 on surface |
| `--color-primary` | `#2DD4BF` | brand teal (light variant) | 9.9:1 on bg |
| `--color-primary-hover` | `#5EEAD4` | hover | higher |
| `--color-primary-soft` | `#134E4A` | selected-sentence highlight fill | text on it 8.3:1 |
| `--color-on-primary` | `#0B1519` | dark text on teal buttons | 9.9:1 |
| `--color-accent` | `#FBBF24` | speaking-now amber | 10.0:1 on surface; `#0B1519` on it 11.1:1 |
| `--color-accent-soft` | `#4A3A10` | live word highlight fill (dark) | keep `--color-text` on it ≥7:1 |
| `--color-danger` | `#F87171` | destructive | 6.0:1 on surface |
| `--color-success` | `#4ADE80` | success | 9.6:1 on surface |
| `--color-border` | `#2A4854` | hairline separators | 1.7:1 (decorative) |
| `--color-border-strong` | `#63808C` | input borders, slider tracks | 4.0:1 on surface |
| `--color-focus` | `#2DD4BF` | focus ring | 9.9:1 vs bg |

### 1.3 Usage rules

- Raw hex never appears in components — semantic tokens only.
- Amber is reserved for "audio is happening" semantics (live word, speaking indicator, chapter markers). It is never a second CTA color.
- Meaning is never color-only: live states also get an icon/underline; errors get icon + text.
- Gradients: exactly one is allowed in the whole product — a subtle teal→transparent fade behind the landing waveform hero (≤8% opacity). No purple-blue gradients, glow, blobs, or particles anywhere.

## 2. Typography

**No font CDNs (CSP).** Two options, in preference order — the implementation
stage picks A if the package installs cleanly, else B; either satisfies this spec:

- **A (preferred):** self-hosted **Atkinson Hyperlegible** via `@fontsource/atkinson-hyperlegible` (woff2 bundled locally, weights 400/700, `font-display: swap`) for headings AND body — it is purpose-built for low-vision readability, on-brand for an accessibility-first product.
- **B (fallback):** full system stack.

```css
--font-sans: "Atkinson Hyperlegible", ui-sans-serif, system-ui, -apple-system,
             "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas,
             "Liberation Mono", monospace; /* timecodes, shortcuts, code */
```

### Scale (rem, base 16px)

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `--text-xs` | 0.75rem / 1.5 | 400 | timestamps, badges (never body copy) |
| `--text-sm` | 0.875rem / 1.5 | 400 | captions, helper text |
| `--text-base` | 1rem / 1.6 | 400 | UI body |
| `--text-lg` | 1.125rem / 1.7 | 400 | **transcript/reading text (default)** — user-scalable to 1.375rem in settings |
| `--text-xl` | 1.25rem / 1.4 | 700 | card titles |
| `--text-2xl` | 1.5rem / 1.35 | 700 | section headings |
| `--text-3xl` | 1.875rem / 1.25 | 700 | page titles |
| `--text-4xl` | 2.375rem / 1.15 | 700 | landing hero only |

Rules: transcript line length 60–72ch max; timecodes/readouts use
`--font-mono` with `font-variant-numeric: tabular-nums` (no layout shift while
counting); no letter-spacing tightening on body; no font weight below 400;
all text respects user zoom to 200% without loss (WCAG 1.4.4/1.4.10).

## 3. Spacing, radii, elevation, glass

### Spacing — 4px scale
`--space-1..12` = 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96 px.
Vertical rhythm tiers: 16 inside components, 24 between related blocks,
48 between page sections, 80 between landing sections.

### Radii
| Token | px | Use |
|---|---|---|
| `--radius-sm` | 6 | inputs, chips, menu items |
| `--radius-md` | 10 | buttons, small cards |
| `--radius-lg` | 14 | cards, panels |
| `--radius-xl` | 20 | workspace panels, modals |
| `--radius-full` | 9999 | play button, slider thumbs, pills |

### Elevation (dimensional-but-calm: soft, short, never glowing)
| Token | Value (light) | Use |
|---|---|---|
| `--shadow-1` | `0 1px 2px rgb(28 43 51 / 0.06)` | resting cards |
| `--shadow-2` | `0 2px 8px rgb(28 43 51 / 0.08), 0 1px 2px rgb(28 43 51 / 0.05)` | hover cards, dropdowns |
| `--shadow-3` | `0 8px 24px rgb(28 43 51 / 0.12)` | modals, sticky playback bar |

Dark mode: elevation is expressed by **surface steps** (`bg → surface →
raised`) plus a 1px inner border, shadows nearly invisible — never lighten
with white glows.

### Glass — one place only
The **sticky playback bar** may use `backdrop-filter: blur(12px)` over a
surface at ≥85% opacity (light: `rgb(255 255 255 / 0.88)`, dark:
`rgb(22 43 52 / 0.88)`). Text on it must still pass 4.5:1 against the
*opaque* fallback color, which is mandatory (`@supports` guard). No other
glass anywhere.

### Z-index scale
`0` content · `10` sticky section headers · `20` playback bar · `40` dropdown/popover · `50` modal+scrim · `60` toasts.

## 4. Motion

| Token | Value |
|---|---|
| `--motion-fast` | 120ms (exits, hovers) |
| `--motion-base` | 200ms (state changes, reveals) |
| `--motion-slow` | 300ms (modals, page-level) |
| `--ease-out` | `cubic-bezier(0.2, 0, 0, 1)` (enter) |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` (exit) |

Rules:

- Animate `transform`/`opacity` only. Exits ≈60% of enter duration. Everything interruptible; nothing blocks input.
- **Waveform motif**: animated bars run ONLY while speech is actually playing (it is a status indicator, not decoration). Idle = static low bars; paused = frozen at last frame.
- Sentence highlight moves with a 200ms background-color transition; auto-scroll uses smooth scrolling.
- **`prefers-reduced-motion: reduce`** (mandatory, tested): waveform becomes a static progress bar; auto-scroll becomes instant `scrollIntoView({behavior:'auto', block:'nearest'})`; all transitions collapse to ≤1ms; no element ever conveys state by motion alone.
- Max 1–2 animated elements per view. No parallax, no staggered landing reveals, no marquee.

## 5. Product-specific visual metaphors

1. **Waveform**: rounded-cap vertical bars (4px wide, 3px gap) in `--color-primary`; the bar cluster nearest the current word tints `--color-accent`. Appears in: landing hero (static SVG), speaking indicator in the playback bar (animated), favicon/logo mark (3 bars forming a "V").
2. **Chapters as track segments**: the timeline is a horizontal track split into chapter segments (like an album side); current chapter fills with `--color-primary`, markers are amber ticks with the chapter title in a tooltip/scrubber label.
3. **Transcript as teleprompter**: reading surface sits on `--color-surface` with a subtle sunken gutter; the active sentence carries `--color-primary-soft` fill + 3px teal left border (redundant non-color cue); the live word gets `--color-accent-soft` fill + underline.
4. **Presets as voice chips**: favorites render as pill chips with a mini 3-bar waveform glyph tinted by language group hue (decorative only; language name always printed).

## 6. Component inventory & interaction states

Every interactive component defines ALL of: `default / hover / focus-visible /
active / disabled / loading / error` (where applicable). Global rules:
focus ring = `2px solid var(--color-focus)` with `2px offset` (never removed,
`:focus-visible`); touch targets ≥44×44px (sliders thumbs 32px visual within
44px hit area — legacy heritage); disabled = 45% opacity + `cursor:
not-allowed` + `aria-disabled`; loading = inline spinner replacing the icon,
label kept, `aria-busy`.

| Component | Notes beyond global states |
|---|---|
| **Button** (primary / secondary / ghost / danger / icon) | primary = teal fill; secondary = 1px `--color-border-strong` outline; icon buttons require `aria-label`; press = scale 0.98 (skipped under reduced motion) |
| **Play/Pause master button** | 56px circle, `--radius-full`, teal fill; state icon morphs play↔pause; `aria-pressed` + live status announced via the status region |
| **Playback bar** (sticky bottom) | play/pause, stop, prev/next sentence, prev/next paragraph, elapsed/total in mono tabular-nums, chapter scrubber; glass rule §3; on <640px collapses to play/stop/±sentence + overflow menu |
| **Slider** (rate/pitch/volume) | native `input[type=range]` restyled; 32px thumb; visible value readout bound as number; keyboard arrows step 0.1 (Shift = 0.5); `aria-valuetext` ("1.2× speed"); track uses `--color-border-strong`, filled portion `--color-primary` |
| **Voice picker** | combobox + listbox grouped by language (`role=group` with labels); search input; local-voice badge; empty-voices state with per-OS help + reload button; selected = teal check + `aria-selected` |
| **Transcript view** | sentences are buttons (`speak from here`); active sentence + live word styles per §5.3; auto-scroll toggle; text size control; `aria-current="true"` on active sentence |
| **Chapter timeline** | horizontal segmented track; segments focusable (`role=slider` scrubber semantics or button-per-chapter — implementation picks one, documents it); amber markers; keyboard ←/→ across chapters |
| **Queue list** | reorder via drag handle AND keyboard (↑/↓ with modifier) — never drag-only; current item = teal edge + "Now playing"; remove buttons labeled |
| **Preset (favorite) chips/cards** | apply on click; missing-voice state shows warning icon + explanation; rename inline; delete confirms |
| **History rows** | excerpt, voice, settings summary, relative time; Speak again (primary), delete (danger, confirm via undo toast) |
| **File dropzone** | drag-over = teal dashed border + sunken fill; keyboard/click opens file picker; per-type errors under the zone (`role=alert`); parsing progress for PDFs |
| **Text prep panel** | toggles per transform + before/after preview diff; "Local processing — no AI" label |
| **AI panel** | per-capability cards; loading = skeleton lines (no spinners >1s); "AI unavailable" state = plain explanation + BYOK link + local-fallback button where one exists (labeled non-AI); never fakes output |
| **Modal / dialog** | focus trap, Esc closes, scrim `rgb(11 21 25 / 0.5)`, restores focus to trigger; unsaved-changes confirm |
| **Toast** | bottom-left, `aria-live=polite`, auto-dismiss 4s, hover pauses timer, action slot (Undo) |
| **Shortcuts dialog** | table of shortcut → action in `--font-mono` kbd chips; opened with `?`; every listed shortcut is real |
| **Tabs / nav** | header nav with `aria-current="page"` underline (teal); mobile = disclosure menu, not bottom nav |
| **Empty states** | icon + one plain sentence + one action; dashboards show honest zeros, never fabricated numbers |
| **Cookie consent banner** | default = declined; equal visual weight for accept/decline; links to `/cookies` |
| **Quota indicator** | small meter + "n of m AI uses today"; at limit fires `quota_reached` and explains reset |
| **Skip link** | first focusable element, visible on focus (legacy pattern kept) |

## 7. Accessibility constraints (WCAG 2.2 AA — binding)

1. Text contrast ≥4.5:1, large text ≥3:1, UI component boundaries/states ≥3:1 (tokens above are pre-validated; any new pair must be checked before use).
2. Full keyboard operability incl. the transcript, timeline, queue reorder, sliders; no keyboard trap; focus order = visual order; focus moved to main on route change.
3. `:focus-visible` ring never suppressed. Target size ≥24×24 CSS px minimum (WCAG 2.5.8), ≥44px for primary controls.
4. Live speech status via a single polite `aria-live` status region ("Speaking · paragraph 2, sentence 3 of 14"); state changes announced without spamming (debounced to sentence granularity).
5. `prefers-reduced-motion` per §4; `prefers-contrast: more` bumps borders to `--color-border-strong` and disables glass.
6. Never rely on color alone (§1.3); icons from **lucide-react** only, one stroke width (2px), never emoji.
7. Forms: visible labels, helper text, errors adjacent + `role=alert`, `aria-invalid`, first invalid field focused on submit.
8. Reading surface honors user font-size setting and browser zoom 200%; no horizontal scroll at 320px width.
9. `lang` attributes on transcript content when the user picks a non-UI-language voice (helps screen readers alongside).
10. Every page: unique `h1`, sequential headings, landmark regions (`header/main/nav/footer`), skip link.

## 8. Tailwind v4 `@theme` mapping (implement verbatim)

In `src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  /* fonts */
  --font-sans: "Atkinson Hyperlegible", ui-sans-serif, system-ui, -apple-system,
               "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas,
               "Liberation Mono", monospace;

  /* light theme (default) */
  --color-bg: #FAF9F7;
  --color-surface: #FFFFFF;
  --color-surface-sunken: #F1EFEA;
  --color-surface-raised: #FFFFFF;
  --color-text: #1F2933;
  --color-text-muted: #52616B;
  --color-primary: #0F766E;
  --color-primary-hover: #115E59;
  --color-primary-soft: #CCFBF1;
  --color-on-primary: #FFFFFF;
  --color-accent: #B45309;
  --color-accent-soft: #FDE68A;
  --color-danger: #B91C1C;
  --color-success: #15803D;
  --color-border: #D8D2C6;
  --color-border-strong: #667085;
  --color-focus: #0F766E;

  /* radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;

  /* elevation */
  --shadow-1: 0 1px 2px rgb(28 43 51 / 0.06);
  --shadow-2: 0 2px 8px rgb(28 43 51 / 0.08), 0 1px 2px rgb(28 43 51 / 0.05);
  --shadow-3: 0 8px 24px rgb(28 43 51 / 0.12);

  /* motion */
  --motion-fast: 120ms;
  --motion-base: 200ms;
  --motion-slow: 300ms;
  --ease-out: cubic-bezier(0.2, 0, 0, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
}

/* dark theme: class strategy on <html> (theme store: light/dark/system) */
.dark {
  --color-bg: #0B1519;
  --color-surface: #102028;
  --color-surface-sunken: #0D1A20;
  --color-surface-raised: #162B34;
  --color-text: #E8F1F2;
  --color-text-muted: #9FB6BC;
  --color-primary: #2DD4BF;
  --color-primary-hover: #5EEAD4;
  --color-primary-soft: #134E4A;
  --color-on-primary: #0B1519;
  --color-accent: #FBBF24;
  --color-accent-soft: #4A3A10;
  --color-danger: #F87171;
  --color-success: #4ADE80;
  --color-border: #2A4854;
  --color-border-strong: #63808C;
  --color-focus: #2DD4BF;
  --shadow-1: none;
  --shadow-2: 0 0 0 1px rgb(42 72 84 / 0.6);
  --shadow-3: 0 8px 24px rgb(0 0 0 / 0.5);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
}
```

Notes for the implementation stage:

- Tailwind v4 derives utilities from `@theme` (`bg-surface`, `text-text-muted`, `rounded-lg` → `--radius-lg`, etc.). Because dark mode swaps CSS variable **values** under `.dark`, components use one class set — do NOT write `dark:` duplicates for tokenized colors.
- Spacing uses Tailwind's default 4px scale (matches §3) — no override needed.
- Breakpoints: Tailwind defaults (sm 640 / md 768 / lg 1024 / xl 1280); design at 375, 768, 1024, 1440.
- Theme switching: `class="dark"` toggled on `<html>` by the theme store (system = `matchMedia` listener), persisted; no flash (inline script in `<head>` before paint).
- If `@fontsource/atkinson-hyperlegible` is not used (option B in §2), delete the family name from `--font-sans` — do not reference a font that is not shipped.
