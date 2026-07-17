import { cn } from "@/lib/cn";

/**
 * The product's signature waveform motif (DESIGN_SYSTEM §5.1). Rounded-cap
 * vertical bars. When `playing`, the bars animate via the `.vk-wave--playing`
 * CSS rule — which is a status indicator, not decoration, and is disabled
 * under prefers-reduced-motion. Idle/paused bars are static.
 */

interface WaveformProps {
  playing?: boolean;
  paused?: boolean;
  /** Number of bars. */
  bars?: number;
  className?: string;
  "aria-hidden"?: boolean;
}

export function Waveform({
  playing = false,
  paused = false,
  bars = 5,
  className,
  "aria-hidden": ariaHidden = true,
}: WaveformProps) {
  const heights = [0.5, 0.85, 1, 0.7, 0.55];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[3px] h-5",
        playing && "vk-wave--playing",
        paused && "vk-wave--paused",
        className
      )}
      aria-hidden={ariaHidden}
    >
      {Array.from({ length: bars }).map((_, index) => (
        <span
          key={index}
          className="vk-wave-bar w-1 rounded-full bg-primary"
          style={{ height: `${(heights[index % heights.length] ?? 0.6) * 100}%` }}
        />
      ))}
    </span>
  );
}
