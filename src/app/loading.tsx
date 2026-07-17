import { Waveform } from "@/components/ui/Waveform";

export default function Loading() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <span className="flex items-center gap-3 text-text-muted">
        <Waveform bars={5} playing className="h-6" />
        Loading…
      </span>
    </div>
  );
}
