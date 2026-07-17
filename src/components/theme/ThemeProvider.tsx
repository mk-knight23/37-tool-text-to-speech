"use client";

/**
 * Theme context: exposes the current mode (light/dark/system) and a setter.
 * Applies the resolved appearance on mount and whenever the mode changes,
 * listens to the OS preference while in "system" mode, and persists the
 * choice. The pre-paint ThemeScript has already set the initial class, so this
 * never causes a flash.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  applyTheme,
  readStoredTheme,
  THEME_KEY,
  type ThemeMode,
} from "@/lib/theme";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");

  // Adopt the stored mode after mount. This must run in an effect (not a lazy
  // initializer) so the server and first client render agree, avoiding a
  // hydration mismatch; the DOM class was already set pre-paint by ThemeScript.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe hydration from localStorage
    setModeState(readStoredTheme());
  }, []);

  // Apply + persist whenever the mode changes.
  useEffect(() => {
    applyTheme(mode);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(THEME_KEY, mode);
    }
  }, [mode]);

  // Track OS changes while following the system preference.
  useEffect(() => {
    if (mode !== "system" || typeof window === "undefined") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => setModeState(next), []);

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
