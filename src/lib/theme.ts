/**
 * Theme mode handling. Three modes: light / dark / system. The resolved
 * appearance is applied by toggling the `dark` class on <html> so the
 * DESIGN_SYSTEM CSS-variable swap takes effect. A pre-paint inline script
 * (see ThemeScript) applies the stored choice before first render to avoid a
 * flash of the wrong theme.
 */

export type ThemeMode = "light" | "dark" | "system";

export const THEME_KEY = "vk-theme";

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

/** The mode persisted in localStorage, or "system" when unset/invalid. */
export function readStoredTheme(): ThemeMode {
  if (typeof localStorage === "undefined") return "system";
  const raw = localStorage.getItem(THEME_KEY);
  return isThemeMode(raw) ? raw : "system";
}

export function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

/** Resolve a mode to a concrete appearance. */
export function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") return systemPrefersDark() ? "dark" : "light";
  return mode;
}

/** Apply the resolved appearance to the document root. */
export function applyTheme(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  const resolved = resolveTheme(mode);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
}
