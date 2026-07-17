/**
 * Global keyboard shortcut dispatch. Extracted from the workspace so the
 * behavior is unit-testable — including the two legacy regressions this guards
 * against: the Space key must not hijack a focused control, and the listener
 * must be cleaned up (see useGlobalShortcuts).
 */

import { isInteractiveTarget } from "./shortcuts";

export interface ShortcutActions {
  toggle: () => void;
  stop: () => void;
  nextSentence: () => void;
  prevSentence: () => void;
  nextParagraph: () => void;
  prevParagraph: () => void;
  adjustRate: (delta: number) => void;
  openShortcuts: () => void;
}

/** Rate nudge applied by the up/down arrows. */
export const RATE_STEP = 0.1;

/**
 * Handle a keydown as a global shortcut. Returns true when it was handled.
 * When a control is focused (interactive target), no shortcut fires — so
 * Space activates the focused button instead of toggling playback.
 */
export function handleShortcutKey(
  event: KeyboardEvent,
  actions: ShortcutActions
): boolean {
  const target = event.target;

  // "?" opens help, but never while typing in a field.
  if (event.key === "?") {
    if (isInteractiveTarget(target)) return false;
    event.preventDefault();
    actions.openShortcuts();
    return true;
  }

  // Every other shortcut must yield to a focused control.
  if (isInteractiveTarget(target)) return false;

  switch (event.key) {
    case " ":
    case "Spacebar":
      event.preventDefault();
      actions.toggle();
      return true;
    case "Escape":
      actions.stop();
      return true;
    case "ArrowLeft":
      event.preventDefault();
      if (event.shiftKey) actions.prevParagraph();
      else actions.prevSentence();
      return true;
    case "ArrowRight":
      event.preventDefault();
      if (event.shiftKey) actions.nextParagraph();
      else actions.nextSentence();
      return true;
    case "ArrowUp":
      event.preventDefault();
      actions.adjustRate(RATE_STEP);
      return true;
    case "ArrowDown":
      event.preventDefault();
      actions.adjustRate(-RATE_STEP);
      return true;
    default:
      return false;
  }
}
