"use client";

import { useMemo, useState, useEffect } from "react";
import { Check, RefreshCw, Search, Star, Play, Volume2 } from "lucide-react";
import { groupVoicesByLanguage } from "@/lib/speech/voices";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { usePrefs } from "@/hooks/usePrefs";

interface VoicePickerProps {
  voices: SpeechSynthesisVoice[];
  loading: boolean;
  supported: boolean;
  selectedURI: string | null;
  onSelect: (voice: SpeechSynthesisVoice) => void;
  onReload: () => void;
}

const isMale = (name: string) => {
  const lowercase = name.toLowerCase();
  return (
    lowercase.includes("male") ||
    lowercase.includes("david") ||
    lowercase.includes("george") ||
    lowercase.includes("mark") ||
    lowercase.includes("ravi") ||
    lowercase.includes("pavel") ||
    lowercase.includes("daniel")
  );
};

const isFemale = (name: string) => {
  const lowercase = name.toLowerCase();
  return (
    lowercase.includes("female") ||
    lowercase.includes("zira") ||
    lowercase.includes("hazel") ||
    lowercase.includes("heera") ||
    lowercase.includes("haruka") ||
    lowercase.includes("elsa") ||
    lowercase.includes("susan") ||
    lowercase.includes("zanya") ||
    lowercase.includes("ira")
  );
};

const getVoiceGender = (name: string): "male" | "female" | "unknown" => {
  if (isMale(name)) return "male";
  if (isFemale(name)) return "female";
  return "unknown";
};

export function VoicePicker({
  voices,
  loading,
  supported,
  selectedURI,
  onSelect,
  onReload,
}: VoicePickerProps) {
  const { prefs, loaded: prefsLoaded, update: updatePrefs } = usePrefs();
  const [query, setQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState<"all" | "male" | "female" | "unknown">("all");
  const [previewingURI, setPreviewingURI] = useState<string | null>(null);

  // Stop preview voice when unmounting
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleFavorite = (uri: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!prefsLoaded) return;
    const favorites = prefs.favoriteVoiceURIs ?? [];
    const nextFavorites = favorites.includes(uri)
      ? favorites.filter((f) => f !== uri)
      : [...favorites, uri];
    updatePrefs({ favoriteVoiceURIs: nextFavorites });
  };

  const handlePlayPreview = (voice: SpeechSynthesisVoice, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    if (previewingURI === voice.voiceURI) {
      setPreviewingURI(null);
      return;
    }

    setPreviewingURI(voice.voiceURI);
    const sampleText = `This is a preview of the ${voice.name} voice in ${voice.lang}.`;
    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.voice = voice;
    utterance.onend = () => setPreviewingURI(null);
    utterance.onerror = () => setPreviewingURI(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleSelect = (voice: SpeechSynthesisVoice) => {
    onSelect(voice);
    if (!prefsLoaded) return;

    // Track recently used (keep last 5)
    const recents = prefs.recentVoiceURIs ?? [];
    const nextRecents = [
      voice.voiceURI,
      ...recents.filter((r) => r !== voice.voiceURI),
    ].slice(0, 5);

    updatePrefs({ recentVoiceURIs: nextRecents });
  };

  const favorites = useMemo(() => {
    if (!prefsLoaded) return [];
    return voices.filter((v) => prefs.favoriteVoiceURIs?.includes(v.voiceURI));
  }, [voices, prefs.favoriteVoiceURIs, prefsLoaded]);

  const recents = useMemo(() => {
    if (!prefsLoaded) return [];
    return voices.filter((v) => prefs.recentVoiceURIs?.includes(v.voiceURI));
  }, [voices, prefs.recentVoiceURIs, prefsLoaded]);

  const groups = useMemo(() => {
    const all = groupVoicesByLanguage(voices);
    const needle = query.trim().toLowerCase();

    return all
      .map((group) => {
        let filteredVoices = group.voices;

        // Search query filter
        if (needle) {
          filteredVoices = filteredVoices.filter(
            (voice) =>
              voice.name.toLowerCase().includes(needle) ||
              group.label.toLowerCase().includes(needle) ||
              voice.lang.toLowerCase().includes(needle)
          );
        }

        // Gender filter
        if (selectedGender !== "all") {
          filteredVoices = filteredVoices.filter(
            (voice) => getVoiceGender(voice.name) === selectedGender
          );
        }

        return {
          ...group,
          voices: filteredVoices,
        };
      })
      .filter((group) => group.voices.length > 0);
  }, [voices, query, selectedGender]);

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

  const renderVoiceItem = (voice: SpeechSynthesisVoice) => {
    const selected = voice.voiceURI === selectedURI;
    const isFav = prefs.favoriteVoiceURIs?.includes(voice.voiceURI) ?? false;
    const isPlaying = previewingURI === voice.voiceURI;

    return (
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={() => handleSelect(voice)}
        className={cn(
          "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors",
          selected ? "bg-primary-soft text-text" : "hover:bg-surface-sunken"
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {selected ? (
            <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
          ) : (
            <span className="size-4 shrink-0" />
          )}
          <span className="truncate font-medium">{voice.name}</span>
          <span className="shrink-0 text-2xs px-1.5 py-0.5 rounded bg-surface-sunken text-text-muted capitalize">
            {getVoiceGender(voice.name)}
          </span>
        </span>

        <span className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-text-muted mr-1">
            {voice.localService ? "Local" : "Cloud"}
          </span>
          <button
            type="button"
            onClick={(e) => handlePlayPreview(voice, e)}
            className="p-1 rounded text-text-muted hover:bg-surface border border-transparent hover:border-border transition-all"
            title={isPlaying ? "Stop preview" : "Play preview sample"}
          >
            {isPlaying ? (
              <Volume2 className="size-3.5 text-primary animate-pulse" />
            ) : (
              <Play className="size-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={(e) => handleToggleFavorite(voice.voiceURI, e)}
            className="p-1 rounded text-text-muted hover:bg-surface border border-transparent hover:border-border transition-all"
            title={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={cn("size-3.5", isFav ? "fill-accent text-accent" : "")} />
          </button>
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search and reload controls */}
      <div className="flex flex-col gap-2 sm:flex-row">
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
            className="w-full rounded-md border border-border-strong bg-surface py-2 pl-9 pr-3 text-sm focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Gender Filter */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value as "all" | "male" | "female" | "unknown")}
            className="rounded-md border border-border-strong bg-surface px-2 py-2 text-sm focus:border-primary"
            aria-label="Filter by gender"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unknown">Unknown</option>
          </select>

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
      </div>

      <div
        className="max-h-80 overflow-y-auto rounded-lg border border-border bg-surface"
        role="listbox"
        aria-label="Voices"
      >
        {/* Favorites Section */}
        {favorites.length > 0 && !query && selectedGender === "all" && (
          <div role="group" aria-label="Favorite Voices" className="border-b border-border">
            <p className="sticky top-0 z-[1] bg-surface-sunken px-3 py-1 text-2xs font-extrabold uppercase tracking-wider text-accent flex items-center gap-1">
              <Star className="size-3 fill-accent" /> Favorites ({favorites.length})
            </p>
            <ul>
              {favorites.map((voice) => (
                <li key={`fav-${voice.voiceURI}`}>{renderVoiceItem(voice)}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recently Used Section */}
        {recents.length > 0 && !query && selectedGender === "all" && (
          <div role="group" aria-label="Recent Voices" className="border-b border-border">
            <p className="sticky top-0 z-[1] bg-surface-sunken px-3 py-1 text-2xs font-extrabold uppercase tracking-wider text-primary">
              Recently Used ({recents.length})
            </p>
            <ul>
              {recents.map((voice) => (
                <li key={`rec-${voice.voiceURI}`}>{renderVoiceItem(voice)}</li>
              ))}
            </ul>
          </div>
        )}

        {groups.length === 0 ? (
          <p className="px-3 py-4 text-sm text-text-muted text-center">
            No voices match your filters.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.code} role="group" aria-label={group.label} className="border-b border-border last:border-b-0">
              <p className="sticky top-0 z-[1] bg-surface-sunken px-3 py-1.5 text-2xs font-bold uppercase tracking-wider text-text-muted">
                {group.label} · {group.voices.length}
              </p>
              <ul>
                {group.voices.map((voice) => (
                  <li key={voice.voiceURI}>{renderVoiceItem(voice)}</li>
                ))}
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
