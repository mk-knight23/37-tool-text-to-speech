"use client";

import { useEffect } from "react";
import { handleShortcutKey, type ShortcutActions } from "@/lib/keyboard";

/**
 * Attaches one window keydown listener and dispatches shortcuts. The listener
 * is attached once and always removed on unmount (legacy leaked its handler).
 * `getActions` must be stable; callers keep the latest actions behind a ref.
 */
export function useGlobalShortcuts(getActions: () => ShortcutActions): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      handleShortcutKey(event, getActions());
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [getActions]);
}
