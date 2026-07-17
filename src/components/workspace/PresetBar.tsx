"use client";

import { useState } from "react";
import { Check, Pencil, Star, Trash2, X } from "lucide-react";
import type { Preset } from "@/lib/storage";
import { Waveform } from "@/components/ui/Waveform";
import { Button } from "@/components/ui/Button";

interface PresetBarProps {
  presets: Preset[];
  /** voiceURIs currently available on this device (to flag missing voices). */
  availableVoiceURIs: Set<string>;
  canSave: boolean;
  onApply: (preset: Preset) => void;
  onSave: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function PresetBar({
  presets,
  availableVoiceURIs,
  canSave,
  onApply,
  onSave,
  onRename,
  onDelete,
}: PresetBarProps) {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const submitSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setName("");
  };

  return (
    <section aria-labelledby="presets-heading" className="flex flex-col gap-3">
      <h3 id="presets-heading" className="flex items-center gap-2 font-bold">
        <Star className="size-4 text-accent" aria-hidden="true" />
        Voice presets
      </h3>

      {presets.length === 0 ? (
        <p className="text-sm text-text-muted">
          No presets yet. Save your current voice and settings to reuse them
          later.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {presets.map((preset) => {
            const missing =
              preset.voiceURI !== null &&
              !availableVoiceURIs.has(preset.voiceURI);
            if (editingId === preset.id) {
              return (
                <li key={preset.id} className="flex items-center gap-1">
                  <input
                    value={editValue}
                    onChange={(event) => setEditValue(event.target.value)}
                    aria-label="Preset name"
                    className="rounded-md border border-border-strong bg-surface px-2 py-1 text-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = editValue.trim();
                      if (trimmed) onRename(preset.id, trimmed);
                      setEditingId(null);
                    }}
                    aria-label="Save name"
                    className="inline-flex size-8 items-center justify-center rounded-md text-primary hover:bg-surface-sunken"
                  >
                    <Check className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    aria-label="Cancel rename"
                    className="inline-flex size-8 items-center justify-center rounded-md text-text-muted hover:bg-surface-sunken"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </li>
              );
            }
            return (
              <li
                key={preset.id}
                className="flex items-center gap-1 rounded-full border border-border bg-surface pl-1 pr-1"
              >
                <button
                  type="button"
                  onClick={() => onApply(preset)}
                  className="flex items-center gap-2 rounded-full py-1.5 pl-2 pr-1 text-sm hover:text-primary"
                  title={
                    missing
                      ? `Voice “${preset.voiceName}” is not available here — other settings will still apply`
                      : `Apply ${preset.name}`
                  }
                >
                  <Waveform bars={3} className="h-3.5" />
                  <span className="font-medium">{preset.name}</span>
                  {missing ? (
                    <span className="text-xs text-danger">(voice missing)</span>
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(preset.id);
                    setEditValue(preset.name);
                  }}
                  aria-label={`Rename ${preset.name}`}
                  className="inline-flex size-7 items-center justify-center rounded-full text-text-muted hover:bg-surface-sunken"
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                </button>
                {confirmId === preset.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(preset.id);
                      setConfirmId(null);
                    }}
                    className="inline-flex items-center rounded-full bg-danger px-2 py-1 text-xs font-bold text-white"
                  >
                    Confirm
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(preset.id)}
                    aria-label={`Delete ${preset.name}`}
                    className="inline-flex size-7 items-center justify-center rounded-full text-text-muted hover:bg-surface-sunken hover:text-danger"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submitSave();
          }}
          placeholder="Name this preset"
          aria-label="New preset name"
          maxLength={60}
          className="flex-1 rounded-md border border-border-strong bg-surface px-3 py-2 text-sm"
        />
        <Button
          size="sm"
          onClick={submitSave}
          disabled={!canSave || name.trim().length === 0}
        >
          Save preset
        </Button>
      </div>
    </section>
  );
}
