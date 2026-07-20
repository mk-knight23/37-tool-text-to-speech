"use client";

import React, { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { SpeechEngine, type EngineSnapshot } from "@/lib/speech/engine";

export interface UseSpeechEngine {
  engine: SpeechEngine;
  snapshot: EngineSnapshot;
}

const SpeechContext = createContext<UseSpeechEngine | null>(null);

export function SpeechProvider({ children }: { children: React.ReactNode }) {
  const engine = useMemo(() => {
    return new SpeechEngine();
  }, []);

  const snapshot = useSyncExternalStore(
    engine.subscribe,
    engine.getSnapshot,
    engine.getSnapshot
  );

  return (
    <SpeechContext.Provider value={{ engine, snapshot }}>
      {children}
    </SpeechContext.Provider>
  );
}

export function useSpeech(): UseSpeechEngine {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error("useSpeech must be used within a SpeechProvider");
  }
  return context;
}
