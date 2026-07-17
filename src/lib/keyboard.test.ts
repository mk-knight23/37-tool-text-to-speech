import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleShortcutKey, type ShortcutActions } from "./keyboard";

function makeActions(): ShortcutActions {
  return {
    toggle: vi.fn(),
    stop: vi.fn(),
    nextSentence: vi.fn(),
    prevSentence: vi.fn(),
    nextParagraph: vi.fn(),
    prevParagraph: vi.fn(),
    adjustRate: vi.fn(),
    openShortcuts: vi.fn(),
  };
}

function keyEvent(
  key: string,
  target: EventTarget | null,
  shiftKey = false
): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key, shiftKey, bubbles: true });
  if (target) Object.defineProperty(event, "target", { value: target });
  return event;
}

describe("handleShortcutKey", () => {
  let actions: ShortcutActions;

  beforeEach(() => {
    actions = makeActions();
  });

  it("toggles playback on Space when nothing interactive is focused", () => {
    const target = document.createElement("div");
    const event = keyEvent(" ", target);
    const prevent = vi.spyOn(event, "preventDefault");
    expect(handleShortcutKey(event, actions)).toBe(true);
    expect(actions.toggle).toHaveBeenCalledTimes(1);
    expect(prevent).toHaveBeenCalled();
  });

  // Regression: legacy Space handler hijacked focused buttons.
  it("does NOT hijack Space when a button is focused", () => {
    const button = document.createElement("button");
    const event = keyEvent(" ", button);
    const prevent = vi.spyOn(event, "preventDefault");
    expect(handleShortcutKey(event, actions)).toBe(false);
    expect(actions.toggle).not.toHaveBeenCalled();
    expect(prevent).not.toHaveBeenCalled();
  });

  it("does not fire shortcuts while typing in a textarea", () => {
    const textarea = document.createElement("textarea");
    expect(handleShortcutKey(keyEvent(" ", textarea), actions)).toBe(false);
    expect(handleShortcutKey(keyEvent("ArrowRight", textarea), actions)).toBe(
      false
    );
    expect(actions.toggle).not.toHaveBeenCalled();
    expect(actions.nextSentence).not.toHaveBeenCalled();
  });

  it("maps arrows to sentence and paragraph navigation", () => {
    const target = document.createElement("div");
    handleShortcutKey(keyEvent("ArrowRight", target), actions);
    handleShortcutKey(keyEvent("ArrowLeft", target), actions);
    handleShortcutKey(keyEvent("ArrowRight", target, true), actions);
    handleShortcutKey(keyEvent("ArrowLeft", target, true), actions);
    expect(actions.nextSentence).toHaveBeenCalledTimes(1);
    expect(actions.prevSentence).toHaveBeenCalledTimes(1);
    expect(actions.nextParagraph).toHaveBeenCalledTimes(1);
    expect(actions.prevParagraph).toHaveBeenCalledTimes(1);
  });

  it("adjusts rate with up/down arrows and stops on Escape", () => {
    const target = document.createElement("div");
    handleShortcutKey(keyEvent("ArrowUp", target), actions);
    handleShortcutKey(keyEvent("ArrowDown", target), actions);
    handleShortcutKey(keyEvent("Escape", target), actions);
    expect(actions.adjustRate).toHaveBeenNthCalledWith(1, 0.1);
    expect(actions.adjustRate).toHaveBeenNthCalledWith(2, -0.1);
    expect(actions.stop).toHaveBeenCalledTimes(1);
  });

  it("opens help on '?' only when not typing", () => {
    const div = document.createElement("div");
    const input = document.createElement("input");
    expect(handleShortcutKey(keyEvent("?", div), actions)).toBe(true);
    expect(handleShortcutKey(keyEvent("?", input), actions)).toBe(false);
    expect(actions.openShortcuts).toHaveBeenCalledTimes(1);
  });
});
