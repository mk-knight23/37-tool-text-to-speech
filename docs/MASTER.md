# VoiceFlow — Minimal Voice UI Design System

## Theme Identity: Minimal Voice / Accessibility-First

A calm, focused interface optimized for voice output and accessibility. Large typography, high contrast, and minimal distractions create an experience that works beautifully for screen readers and users with visual impairments.

---

## Color Palette (Calm & High Contrast)

### Primary Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--voice-primary` | `#2563eb` | Primary actions (accessible blue) |
| `--voice-primary-hover` | `#1d4ed8` | Primary hover state |
| `--voice-secondary` | `#64748b` | Secondary text, labels |
| `--voice-muted` | `#94a3b8` | Muted text, placeholders |

### Background Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--voice-bg` | `#ffffff` | Primary background (light) |
| `--voice-surface` | `#f8fafc` | Card backgrounds |
| `--voice-border` | `#e2e8f0` | Borders, dividers |

### Text Colors

| Token | Value | WCAG | Usage |
|-------|-------|------|-------|
| `--voice-text` | `#0f172a` | 16.1:1 | Primary text |
| `--voice-text-secondary` | `#475569` | 7.5:1 | Secondary text |

### Dark Mode

| Token | Value | WCAG | Usage |
|-------|-------|------|-------|
| `--voice-bg-dark` | `#0f172a` | - | Primary background |
| `--voice-surface-dark` | `#1e293b` | - | Card backgrounds |
| `--voice-text-dark` | `#f1f5f9` | 15.8:1 | Primary text |
| `--voice-border-dark` | `#334155` | - | Borders |

---

## Typography

### Font Families

```css
--font-sans: "Inter", system-ui, -apple-system, sans-serif;
--font-mono: "SF Mono", "Consolas", monospace;
```

### Type Scale (Large & Readable)

| Size | rem | px | Usage |
|------|-----|-----|-------|
| Base | 1.125rem | 18px | Default text (larger for a11y) |
| LG | 1.25rem | 20px | Emphasized text |
| XL | 1.5rem | 24px | Subheadings |
| 2XL | 2rem | 32px | Headings |
| 3XL | 2.5rem | 40px | Page titles |
| SM | 1rem | 16px | Secondary text |

### Typography Rules

- Minimum body text: 18px (accessibility)
- Line height: 1.6 for body, 1.3 for headings
- Letter spacing: 0.01em for body, -0.02em for headings
- Maximum line length: 70 characters

---

## Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `--space-4` | 16px | Small padding |
| `--space-6` | 24px | Default padding |
| `--space-8` | 32px | Large padding |
| `--space-12` | 48px | Section gaps |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-md` | 8px | Cards, buttons |
| `--radius-lg` | 12px | Large containers |

---

## Touch Targets

**Minimum 44x44px** for all interactive elements (WCAG AAA)

| Element | Size |
|---------|------|
| Buttons | 48px min height |
| Links | 44px min height |
| Inputs | 48px min height |
| Checkboxes | 24px with 20px padding |

---

## Components

### Buttons (Large, Clear)

```css
background: var(--voice-primary);
color: white;
border: none;
border-radius: var(--radius-md);
padding: 14px 28px;
font-size: 18px;
font-weight: 600;
min-height: 48px;
cursor: pointer;
transition: background-color 150ms ease-out;
```

**Focus State:**
```css
outline: 3px solid var(--voice-primary);
outline-offset: 2px;
```

### Inputs (Accessible)

```css
background: var(--voice-bg);
border: 2px solid var(--voice-border);
border-radius: var(--radius-md);
padding: 14px 16px;
font-size: 18px;
min-height: 48px;
color: var(--voice-text);
```

**Focus State:**
```css
border-color: var(--voice-primary);
outline: 3px solid var(--voice-primary);
outline-offset: 2px;
box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.1);
```

### Cards

```css
background: var(--voice-surface);
border: 1px solid var(--voice-border);
border-radius: var(--radius-lg);
padding: var(--space-6);
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
```

---

## Focus Management

All interactive elements must have visible focus indicators:

```css
*:focus-visible {
  outline: 3px solid var(--voice-primary);
  outline-offset: 2px;
  border-radius: 4px;
}
```

---

## Motion & Transitions

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 150ms | Hover states |
| `--duration-base` | 250ms | Default transitions |
| `--ease-out` | ease-out | Smooth deceleration |

**Respect prefers-reduced-motion:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility Features

### Screen Reader Support

- Proper ARIA labels on all interactive elements
- Live regions for dynamic content
- Semantic HTML structure
- Alt text for all images

### Keyboard Navigation

- All features accessible via keyboard
- Visible focus indicators
- Logical tab order
- Skip to main content link

### High Contrast Mode Support

```css
@media (prefers-contrast: high) {
  :root {
    --voice-border: #000000;
    --voice-text: #000000;
    --voice-bg: #ffffff;
  }
}
```

---

## Iconography

- Use Lucide icons with stroke-width: 2
- Size: 20px, 24px
- High contrast colors
- Include aria-label or sr-only text

---

## Anti-Patterns

### Don't Use

- Small text below 16px
- Low contrast ratios below 4.5:1
- Tiny touch targets below 44px
- Color-only indicators
- Animations without reduced-motion support
- Placeholder text as labels (use proper labels)

### Use Instead

- Large, readable text (18px+)
- High contrast (7:1 or better)
- Generous touch targets
- Multiple indicators (color + text/icon)
- Respectful animations
- Proper label elements

---

## Print Styles

```css
@media print {
  background: white;
  color: black;
  box-shadow: none;
  max-width: 100%;
}
```

---

## Voice Feedback States

| State | Visual | Audio |
|-------|--------|------|
| Speaking | Pulsing animation + icon | Speech output |
| Paused | Static pause icon | None |
| Error | Red border + message | Error tone |
| Success | Green checkmark | Success chime |
