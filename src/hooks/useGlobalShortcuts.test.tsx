import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useGlobalShortcuts } from "./useGlobalShortcuts";
import type { ShortcutActions } from "@/lib/keyboard";

const noopActions: ShortcutActions = {
  toggle() {},
  stop() {},
  nextSentence() {},
  prevSentence() {},
  nextParagraph() {},
  prevParagraph() {},
  adjustRate() {},
  openShortcuts() {},
};

describe("useGlobalShortcuts", () => {
  afterEach(() => vi.restoreAllMocks());

  // Regression: legacy leaked its keydown listener (onMounted return ignored).
  it("removes the keydown listener on unmount", () => {
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const getActions = () => noopActions;

    const { unmount } = renderHook(() => useGlobalShortcuts(getActions));

    const addCall = add.mock.calls.find(([type]) => type === "keydown");
    expect(addCall).toBeTruthy();
    const handler = addCall?.[1];

    unmount();

    const removed = remove.mock.calls.some(
      ([type, fn]) => type === "keydown" && fn === handler
    );
    expect(removed).toBe(true);
  });

  it("dispatches through to the current actions", () => {
    const toggle = vi.fn();
    const actions: ShortcutActions = { ...noopActions, toggle };
    renderHook(() => useGlobalShortcuts(() => actions));

    window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    expect(toggle).toHaveBeenCalledTimes(1);
  });
});
