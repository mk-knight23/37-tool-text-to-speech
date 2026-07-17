"use client";

import { RotateCcw } from "lucide-react";
import { coerceSliderValue } from "@/lib/slider";

interface SliderProps {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  /** Larger step used with Shift + arrow. */
  largeStep: number;
  value: number;
  defaultValue: number;
  onChange: (value: number) => void;
  /** Render the visible numeric readout, e.g. "1.2×". */
  format: (value: number) => string;
  /** Spoken description for assistive tech, e.g. "1.2 times speed". */
  formatAria: (value: number) => string;
}

export function Slider({
  id,
  label,
  min,
  max,
  step,
  largeStep,
  value,
  defaultValue,
  onChange,
  format,
  formatAria,
}: SliderProps) {
  const isDefault = value === defaultValue;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!event.shiftKey) return;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      onChange(coerceSliderValue(value + largeStep, min, max, step));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      onChange(coerceSliderValue(value - largeStep, min, max, step));
    }
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-bold text-text">
          {label}
        </label>
        <div className="flex items-center gap-1">
          <span className="vk-tabular text-sm text-text-muted" aria-hidden="true">
            {format(value)}
          </span>
          <button
            type="button"
            onClick={() => onChange(defaultValue)}
            disabled={isDefault}
            className="inline-flex size-6 items-center justify-center rounded-sm text-text-muted hover:bg-surface-sunken disabled:opacity-40"
            aria-label={`Reset ${label} to default`}
            title="Reset to default"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <input
        id={id}
        type="range"
        className="vk-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(coerceSliderValue(event.target.valueAsNumber, min, max, step))
        }
        onKeyDown={handleKeyDown}
        aria-valuetext={formatAria(value)}
      />
    </div>
  );
}
