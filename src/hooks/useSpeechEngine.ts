"use client";

import { useMemo, useSyncExternalStore } from "react";
import { SpeechEngine, type EngineSnapshot } from "@/lib/speech/engine";

export interface UseSpeechEngine {
  engine: SpeechEngine;
  snapshot: EngineSnapshot;
}

/**
 * Creates one SpeechEngine per component instance and subscribes to its
 * immutable snapshots via useSyncExternalStore. The initial snapshot is a
 * stable module constant, so server rendering returns a consistent value.
 */
export function useSpeechEngine(): UseSpeechEngine {
  const engine = useMemo(() => new SpeechEngine(), []);
  const snapshot = useSyncExternalStore(
    engine.subscribe,
    engine.getSnapshot,
    engine.getSnapshot
  );
  return { engine, snapshot };
}
