"use client";

import { useState, useCallback, useRef } from "react";

export interface UseUndoRedo {
  value: string;
  setValue: (nextValue: string) => void;
  undo: () => void;
  redo: () => void;
  reset: (newValue: string) => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useUndoRedo(initialValue: string): UseUndoRedo {
  const [history, setHistory] = useState<string[]>([initialValue]);
  const [index, setIndex] = useState(0);
  const isUpdatingFromUndoRedo = useRef(false);

  const value = history[index] ?? "";

  const setValue = useCallback(
    (nextValue: string) => {
      if (isUpdatingFromUndoRedo.current) {
        isUpdatingFromUndoRedo.current = false;
        return;
      }
      setHistory((prev) => {
        // Drop any forward history if we make a new change
        const nextHistory = prev.slice(0, index + 1);
        if (nextHistory[nextHistory.length - 1] === nextValue) {
          return prev;
        }
        const updated = [...nextHistory, nextValue];
        // Limit history size to 50 entries
        if (updated.length > 50) {
          updated.shift();
          setIndex(updated.length - 1);
          return updated;
        }
        setIndex(updated.length - 1);
        return updated;
      });
    },
    [index]
  );

  const undo = useCallback(() => {
    if (index > 0) {
      isUpdatingFromUndoRedo.current = true;
      setIndex(index - 1);
    }
  }, [index]);

  const redo = useCallback(() => {
    if (index < history.length - 1) {
      isUpdatingFromUndoRedo.current = true;
      setIndex(index + 1);
    }
  }, [index, history.length]);

  const reset = useCallback((newValue: string) => {
    setHistory([newValue]);
    setIndex(0);
    isUpdatingFromUndoRedo.current = false;
  }, []);

  return {
    value,
    setValue,
    undo,
    redo,
    reset,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
  };
}
