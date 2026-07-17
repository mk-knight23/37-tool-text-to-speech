/**
 * One-shot text handoff between routes (e.g. "Speak again" from history).
 * Uses sessionStorage so the (potentially long, private) text never travels
 * through the URL. The workspace consumes and clears it on mount.
 */

export const LOAD_TEXT_KEY = "vk-load-text";

export function stashTextForWorkspace(text: string): void {
  try {
    sessionStorage.setItem(LOAD_TEXT_KEY, text);
  } catch {
    // sessionStorage may be unavailable (private mode); handoff is best-effort.
  }
}

export function takeStashedText(): string | null {
  try {
    const text = sessionStorage.getItem(LOAD_TEXT_KEY);
    if (text !== null) sessionStorage.removeItem(LOAD_TEXT_KEY);
    return text;
  } catch {
    return null;
  }
}
