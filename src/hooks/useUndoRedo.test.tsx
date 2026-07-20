import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUndoRedo } from "./useUndoRedo";

describe("useUndoRedo", () => {
  it("initializes with initial value", () => {
    const { result } = renderHook(() => useUndoRedo("hello"));
    expect(result.current.value).toBe("hello");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("updates value and tracks history", () => {
    const { result } = renderHook(() => useUndoRedo("first"));

    act(() => {
      result.current.setValue("second");
    });
    expect(result.current.value).toBe("second");
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);

    act(() => {
      result.current.undo();
    });
    expect(result.current.value).toBe("first");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.redo();
    });
    expect(result.current.value).toBe("second");
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it("limits history buffer", () => {
    const { result } = renderHook(() => useUndoRedo("0"));

    // Push 55 values (limit is 50)
    for (let i = 1; i <= 55; i++) {
      act(() => {
        result.current.setValue(String(i));
      });
    }

    expect(result.current.value).toBe("55");
    
    // Go all the way back
    let steps = 0;
    while (result.current.canUndo) {
      act(() => {
        result.current.undo();
      });
      steps++;
    }

    // Limit is 50, so we should go back exactly 49 times (values 6 to 55)
    expect(steps).toBe(49);
    expect(result.current.value).toBe("6");
  });
});
