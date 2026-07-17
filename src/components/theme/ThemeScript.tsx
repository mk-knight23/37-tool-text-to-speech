/**
 * Inline script injected into <head> so the stored theme is applied before
 * the first paint (no flash). Kept tiny and dependency-free. It reads the same
 * localStorage key ("vk-theme") that the ThemeProvider uses.
 */

import { THEME_KEY } from "@/lib/theme";

const script = `(function(){try{var m=localStorage.getItem(${JSON.stringify(
  THEME_KEY
)});if(m!=="light"&&m!=="dark"&&m!=="system")m="system";var d=m==="dark"||(m==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light";}catch(_){}})();`;

export function ThemeScript() {
  // Runs before hydration; content is a fixed string, not user data.
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
