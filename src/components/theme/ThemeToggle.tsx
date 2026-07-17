"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/cn";
import type { ThemeMode } from "@/lib/theme";

const ORDER: ThemeMode[] = ["light", "dark", "system"];
const LABEL: Record<ThemeMode, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

/** Compact header control that cycles light -> dark -> system. */
export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;

  return (
    <button
      type="button"
      onClick={() => setMode(next)}
      className="inline-flex size-11 items-center justify-center rounded-md text-text hover:bg-surface-sunken transition-colors"
      aria-label={`Theme: ${LABEL[mode]}. Switch to ${LABEL[next]}.`}
      title={`Theme: ${LABEL[mode]}`}
    >
      <Icon className="size-5" aria-hidden="true" />
    </button>
  );
}

/** Full segmented control for the settings page. */
export function ThemeModeSelect() {
  const { mode, setMode } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex rounded-md border border-border-strong p-1 gap-1"
    >
      {ORDER.map((option) => {
        const Icon =
          option === "light" ? Sun : option === "dark" ? Moon : Monitor;
        const active = mode === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setMode(option)}
            className={cn(
              "inline-flex items-center gap-2 rounded-sm px-3 min-h-9 text-sm font-bold transition-colors",
              active
                ? "bg-primary text-on-primary"
                : "text-text hover:bg-surface-sunken"
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {LABEL[option]}
          </button>
        );
      })}
    </div>
  );
}
