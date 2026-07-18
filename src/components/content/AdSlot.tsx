/**
 * Reserved advertising slot (STANDARDS §7). Ads are PREPARED but DISABLED.
 *
 * While `NEXT_PUBLIC_ADSENSE_ENABLED` is not exactly "true" (the default), this
 * renders nothing at all — no ad script is loaded, no network request is made,
 * and no layout space is reserved, so there is zero cumulative layout shift and
 * zero third-party contact. The reservation logic lives here so that enabling
 * ads later is a single, auditable change rather than edits scattered across
 * pages. No real publisher id exists yet, so no ad markup is emitted even when
 * the flag is on; the slot only reserves fixed dimensions to avoid CLS.
 *
 * See docs/MONETIZATION_PLAN.md for intended placements and the activation checklist.
 */

const ADSENSE_ENABLED = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";

interface AdSlotProps {
  /** Where this slot sits, for the plan/labelling. Not sent anywhere. */
  placement: "guide-inline" | "docs-sidebar";
  /** Fixed reserved height in px (prevents layout shift when active). */
  height?: number;
}

export function AdSlot({ placement, height = 280 }: AdSlotProps) {
  // Disabled by default: emit nothing, load nothing.
  if (!ADSENSE_ENABLED) return null;

  // Enabled-but-not-configured: reserve fixed space only (no publisher id yet,
  // so no ad script is loaded — this stays honest until a real id exists).
  return (
    <div
      aria-hidden="true"
      data-ad-placement={placement}
      className="my-8 flex items-center justify-center rounded-lg border border-dashed border-border text-sm text-text-muted"
      style={{ height }}
    >
      Advertisement
    </div>
  );
}
