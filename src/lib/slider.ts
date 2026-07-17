/**
 * Slider value coercion. The legacy Vue app bound range inputs without the
 * `.number` modifier, so rate/pitch/volume became *strings* — then `.toFixed`
 * threw and string values were assigned to utterance properties. This helper
 * guarantees a clamped, step-quantized NUMBER regardless of input type, and is
 * covered by a regression test.
 */

export function coerceSliderValue(
  raw: number | string,
  min: number,
  max: number,
  step: number
): number {
  const parsed = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(parsed)) return min;
  const clamped = Math.min(max, Math.max(min, parsed));
  // Quantize to the step relative to min, then fix binary drift.
  const steps = Math.round((clamped - min) / step);
  const quantized = min + steps * step;
  const decimals = (step.toString().split(".")[1] ?? "").length;
  return Number(quantized.toFixed(decimals));
}
