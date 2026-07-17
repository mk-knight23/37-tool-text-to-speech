"use client";

import { useMemo, useState } from "react";
import { Check, RefreshCw, Search } from "lucide-react";
import { groupVoicesByLanguage } from "@/lib/speech/voices";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

interface VoicePickerProps {
  voices: SpeechSynthesisVoice[];
  loading: boolean;
  supported: boolean;
  selectedURI: string | null;
  onSelect: (voice: SpeechSynthesisVoice) => void;
  onReload: () => void;
}

export function VoicePicker({
  voices,
  loading,
  supported,
  selectedURI,
  onSelect,
  onReload,
}: VoicePickerProps) {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const all = groupVoicesByLanguage(voices);
    const needle = query.trim().toLowerCase();
    if (!needle) return all;
    return all
      .map((group) => ({
        ...group,
        voices: group.voices.filter(
          (voice) =>
            voice.name.toLowerCase().includes(needle) ||
            group.label.toLowerCase().includes(needle) ||
            voice.lang.toLowerCase().includes(needle)
        ),
      }))
      .filter((group) => group.voices.length > 0);
  }, [voices, query]);

  if (!supported) {
    return (
      <EmptyState
        title="Speech is not available in this browser"
        body="Your browser does not expose the Web Speech API. Try the latest Chrome, Edge, Safari or Firefox on desktop."
      />
    );
  }

  if (loading) {
    return (
      <p className="text-sm text-text-muted" role="status">
        Loading voices…
      </p>
    );
  }

  if (voices.length === 0) {
    return (
      <EmptyState
        title="No voices found"
        body="Your browser reported zero speech voices. On Linux, install a speech engine such as speech-dispatcher with espeak-ng. On Chrome, some voices load only after the page has been open for a moment."
        action={
          <Button variant="secondary" size="sm" onClick={onReload}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Reload voices
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search voices or languages"
            aria-label="Search voices"
            className="w-full rounded-md border border-border-strong bg-surface py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={onReload}
          className="inline-flex size-10 items-center justify-center rounded-md border border-border-strong text-text-muted hover:bg-surface-sunken"
          aria-label="Reload voices"
          title="Reload voices"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div
        className="max-h-72 overflow-y-auto rounded-md border border-border"
        role="listbox"
        aria-label="Voices"
      >
        {groups.length === 0 ? (
          <p className="px-3 py-4 text-sm text-text-muted">
            No voices match “{query}”.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.code} role="group" aria-label={group.label}>
              <p className="sticky top-0 z-[1] bg-surface-sunken px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-text-muted">
                {group.label} · {group.voices.length}
              </p>
              <ul>
                {group.voices.map((voice) => {
                  const selected = voice.voiceURI === selectedURI;
                  return (
                    <li key={voice.voiceURI}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => onSelect(voice)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors",
                          selected
                            ? "bg-primary-soft text-text"
                            : "hover:bg-surface-sunken"
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          {selected ? (
                            <Check
                              className="size-4 shrink-0 text-primary"
                              aria-hidden="true"
                            />
                          ) : (
                            <span className="size-4 shrink-0" />
                          )}
                          <span className="truncate">{voice.name}</span>
                        </span>
                        <span className="shrink-0 text-xs text-text-muted">
                          {voice.localService ? "On device" : "Network"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="rounded-md border border-border bg-surface-sunken p-4"
      role="status"
    >
      <p className="font-bold text-text">{title}</p>
      <p className="mt-1 text-sm text-text-muted">{body}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
