/**
 * Keyboard shortcut definitions + the focused-control guard.
 * Every shortcut listed here is implemented (the legacy app listed some it
 * never wired up — that does not happen in v2).
 */

export interface ShortcutInfo {
  keys: string;
  action: string;
}

export const SHORTCUTS: ShortcutInfo[] = [
  { keys: "Space", action: "Play / pause (when no control is focused)" },
  { keys: "Esc", action: "Stop playback" },
  { keys: "← / →", action: "Previous / next sentence" },
  { keys: "Shift + ← / →", action: "Previous / next paragraph" },
  { keys: "↑ / ↓", action: "Speed up / slow down (±0.1×)" },
  { keys: "?", action: "Open this shortcuts list" },
];

const INTERACTIVE_TAGS = new Set([
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "BUTTON",
  "A",
  "OPTION",
  "AUDIO",
  "VIDEO",
]);

/**
 * True when a keyboard event's target is an element that handles keys
 * itself. Global shortcuts must never hijack it (fixes the legacy bug where
 * Space on a focused button triggered play instead of the button).
 */
export function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (INTERACTIVE_TAGS.has(target.tagName)) return true;
  if (target.isContentEditable) return true;
  const role = target.getAttribute("role");
  if (role === "slider" || role === "textbox" || role === "combobox") {
    return true;
  }
  if (target.closest("dialog, [role='dialog']")) return true;
  return false;
}
