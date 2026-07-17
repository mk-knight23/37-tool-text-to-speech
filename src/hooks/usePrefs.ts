"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_PREFS,
  getPrefs,
  migrateLegacyData,
  updatePrefs,
  type Prefs,
} from "@/lib/storage";

export interface UsePrefs {
  prefs: Prefs;
  loaded: boolean;
  update: (patch: Partial<Prefs>) => void;
}

/**
 * Loads persisted preferences once (running the one-time legacy migration
 * first), and exposes an optimistic updater that writes through to IndexedDB.
 */
export function usePrefs(): UsePrefs {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      await migrateLegacyData();
      const loadedPrefs = await getPrefs();
      if (active) {
        setPrefs(loadedPrefs);
        setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback((patch: Partial<Prefs>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      void updatePrefs(patch);
      return next;
    });
  }, []);

  return { prefs, loaded, update };
}
