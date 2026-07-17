"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard } from "lucide-react";
import { useSpeechEngine } from "@/hooks/useSpeechEngine";
import { useVoices } from "@/hooks/useVoices";
import { usePrefs } from "@/hooks/usePrefs";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { segmentText } from "@/lib/speech/segment";
import { findVoiceByURI } from "@/lib/speech/voices";
import { isPrepActive, prepareText, type PrepOptions } from "@/lib/textprep";
import type { ShortcutActions } from "@/lib/keyboard";
import { coerceSliderValue } from "@/lib/slider";
import { excerpt } from "@/lib/format";
import {
  addHistoryEntry,
  deletePreset,
  listPresets,
  loadQueue,
  savePreset,
  saveQueue,
  updateStats,
  type Preset,
  type QueueItem,
} from "@/lib/storage";
import type { ImportResult } from "@/lib/parsers/file";
import { takeStashedText } from "@/lib/handoff";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { VoicePicker } from "./VoicePicker";
import { Slider } from "./Slider";
import { Transcript } from "./Transcript";
import { PlaybackBar } from "./PlaybackBar";
import { TextPrepPanel } from "./TextPrepPanel";
import { PresetBar } from "./PresetBar";
import { QueuePanel } from "./QueuePanel";
import { ImportDropzone } from "./ImportDropzone";
import { ShortcutsDialog } from "./ShortcutsDialog";

const CHAR_SOFT_LIMIT = 100_000;

function pickDefaultVoice(
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  const uiLang = (typeof navigator !== "undefined" ? navigator.language : "en")
    .split("-")[0]
    .toLowerCase();
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith(uiLang) && v.localService) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(uiLang)) ??
    voices.find((v) => v.lang.toLowerCase().startsWith("en")) ??
    voices[0]
  );
}

export function Workspace() {
  const { engine, snapshot } = useSpeechEngine();
  const { voices, loading: voicesLoading, supported, reload } = useVoices();
  const { prefs, loaded: prefsLoaded, update: updatePrefs } = usePrefs();

  const [rawText, setRawText] = useState("");
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);
  const [selectedURI, setSelectedURI] = useState<string | null>(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [prep, setPrep] = useState<PrepOptions>({
    expandNumbers: false,
    expandAbbreviations: false,
    normalizePauses: false,
  });
  const [presets, setPresets] = useState<Preset[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [activeQueueId, setActiveQueueId] = useState<string | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const sessionCounted = useRef(false);

  // Adopt persisted preferences once loaded (async source of truth).
  useEffect(() => {
    if (!prefsLoaded) return;
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate local state from persisted prefs */
    setRate(prefs.defaultRate);
    setPitch(prefs.defaultPitch);
    setVolume(prefs.defaultVolume);
    setSelectedURI(prefs.lastVoiceURI);
    setPrep(prefs.prep);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [prefsLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load presets + queue once, and adopt any "Speak again" handoff text.
  useEffect(() => {
    void listPresets().then(setPresets);
    void loadQueue().then(setQueue);
    const stashed = takeStashedText();
    if (stashed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot handoff from /history
      setRawText(stashed);
      setSourceLabel(null);
    }
    track("tool_opened");
  }, []);

  const spokenText = useMemo(
    () => (isPrepActive(prep) ? prepareText(rawText, prep) : rawText),
    [rawText, prep]
  );
  const segmentation = useMemo(() => segmentText(spokenText), [spokenText]);

  const selectedVoice = useMemo(
    () => findVoiceByURI(voices, selectedURI),
    [voices, selectedURI]
  );

  // Default a voice once voices are available and none is chosen.
  useEffect(() => {
    if (voices.length === 0) return;
    if (selectedURI && findVoiceByURI(voices, selectedURI)) return;
    const fallback = pickDefaultVoice(voices);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pick a default once async voices arrive
    if (fallback) setSelectedURI(fallback.voiceURI);
  }, [voices, selectedURI]);

  // Push sentences to the engine whenever segmentation changes.
  useEffect(() => {
    engine.setSentences(segmentation.sentences);
  }, [engine, segmentation.sentences]);

  // Push settings to the engine (applies from the next sentence onward).
  useEffect(() => {
    engine.setSettings({ voice: selectedVoice, rate, pitch, volume });
  }, [engine, selectedVoice, rate, pitch, volume]);

  // Wire completion/stop callbacks with fresh values captured each change.
  useEffect(() => {
    const record = (spokenMs: number) => {
      if (spokenText.trim().length === 0) return;
      const voiceName = selectedVoice?.name ?? "Browser default";
      void addHistoryEntry({
        id: crypto.randomUUID(),
        text: rawText,
        excerpt: excerpt(rawText),
        chars: rawText.length,
        voiceName,
        voiceURI: selectedVoice?.voiceURI ?? null,
        rate,
        pitch,
        volume,
        durationMs: spokenMs,
        completedAt: Date.now(),
      });
      void updateStats((stats) => ({
        ...stats,
        itemsSpoken: stats.itemsSpoken + 1,
        charactersSpoken: stats.charactersSpoken + rawText.length,
        msListened: stats.msListened + spokenMs,
        voiceUsage: {
          ...stats.voiceUsage,
          [voiceName]: (stats.voiceUsage[voiceName] ?? 0) + 1,
        },
      }));
    };
    engine.setCallbacks({
      onComplete: (ms) => {
        record(ms);
        track("tool_completed");
      },
      onStopped: (ms) => record(ms),
    });
  }, [engine, rawText, spokenText, selectedVoice, rate, pitch, volume]);

  const countSession = () => {
    if (sessionCounted.current) return;
    sessionCounted.current = true;
    void updateStats((stats) => ({ ...stats, sessions: stats.sessions + 1 }));
  };

  // Global keyboard shortcuts. The listener (attached once, cleaned up on
  // unmount by useGlobalShortcuts) reads the latest actions from a ref that is
  // refreshed in an effect — never during render.
  const actions: ShortcutActions = {
    toggle: () => {
      countSession();
      track("tool_started");
      engine.toggle();
    },
    stop: () => engine.stop(),
    nextSentence: () => engine.nextSentence(),
    prevSentence: () => engine.prevSentence(),
    nextParagraph: () => engine.nextParagraph(),
    prevParagraph: () => engine.prevParagraph(),
    adjustRate: (delta: number) =>
      setRate((current) => coerceSliderValue(current + delta, 0.5, 3, 0.1)),
    openShortcuts: () => setShortcutsOpen(true),
  };
  const actionsRef = useRef(actions);
  useEffect(() => {
    actionsRef.current = actions;
  });
  const getActions = useCallback(() => actionsRef.current, []);
  useGlobalShortcuts(getActions);

  // Stop speech if the component unmounts.
  useEffect(() => () => engine.stop(), [engine]);

  const handleSelectVoice = (voice: SpeechSynthesisVoice) => {
    setSelectedURI(voice.voiceURI);
    const lang = voice.lang.split(/[-_]/)[0].toLowerCase();
    updatePrefs({
      lastVoiceURI: voice.voiceURI,
      lastVoiceByLang: { ...prefs.lastVoiceByLang, [lang]: voice.voiceURI },
    });
  };

  const handlePrepChange = (patch: Partial<PrepOptions>) => {
    const next = { ...prep, ...patch };
    setPrep(next);
    updatePrefs({ prep: next });
  };

  const handleImported = (result: ImportResult) => {
    engine.stop();
    setRawText(result.text);
    setSourceLabel(result.fileName);
    setActiveQueueId(null);
    setNotice(
      result.pages
        ? `Imported ${result.fileName} (${result.pages} page${result.pages === 1 ? "" : "s"}).`
        : `Imported ${result.fileName}.`
    );
    track("file_processed");
  };

  const queueTitle = () => {
    if (sourceLabel) return sourceLabel;
    const first = segmentation.sentences[0]?.text ?? "Untitled";
    return excerpt(first, 48);
  };

  const handleAddToQueue = () => {
    if (rawText.trim().length === 0) return;
    const item: QueueItem = {
      id: crypto.randomUUID(),
      title: queueTitle(),
      text: rawText,
      addedAt: Date.now(),
    };
    const next = [...queue, item];
    setQueue(next);
    setActiveQueueId(item.id);
    void saveQueue(next);
  };

  const handleLoadQueue = (item: QueueItem) => {
    engine.stop();
    setRawText(item.text);
    setSourceLabel(item.title);
    setActiveQueueId(item.id);
  };

  const handleRemoveQueue = (id: string) => {
    const next = queue.filter((item) => item.id !== id);
    setQueue(next);
    if (activeQueueId === id) setActiveQueueId(null);
    void saveQueue(next);
  };

  const handleMoveQueue = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= queue.length) return;
    const next = [...queue];
    [next[index], next[target]] = [next[target], next[index]];
    setQueue(next);
    void saveQueue(next);
  };

  const handleClearQueue = () => {
    setQueue([]);
    setActiveQueueId(null);
    void saveQueue([]);
  };

  const handleSavePreset = async (name: string) => {
    const preset: Preset = {
      id: crypto.randomUUID(),
      name,
      voiceURI: selectedVoice?.voiceURI ?? null,
      voiceName: selectedVoice?.name ?? "Browser default",
      lang: selectedVoice?.lang ?? "",
      rate,
      pitch,
      volume,
      createdAt: Date.now(),
    };
    await savePreset(preset);
    setPresets(await listPresets());
  };

  const handleApplyPreset = (preset: Preset) => {
    setRate(preset.rate);
    setPitch(preset.pitch);
    setVolume(preset.volume);
    const voice = findVoiceByURI(voices, preset.voiceURI);
    if (voice) {
      setSelectedURI(voice.voiceURI);
      setNotice(`Applied preset “${preset.name}”.`);
    } else {
      setNotice(
        `Applied “${preset.name}”. Its voice “${preset.voiceName}” isn't available here, so the current voice is kept.`
      );
    }
  };

  const handleRenamePreset = async (id: string, name: string) => {
    const existing = presets.find((preset) => preset.id === id);
    if (!existing) return;
    await savePreset({ ...existing, name });
    setPresets(await listPresets());
  };

  const handleDeletePreset = async (id: string) => {
    await deletePreset(id);
    setPresets(await listPresets());
  };

  const handlePlaySentence = (index: number) => {
    countSession();
    track("tool_started");
    engine.playSentence(index);
  };

  const availableVoiceURIs = useMemo(
    () => new Set(voices.map((voice) => voice.voiceURI)),
    [voices]
  );

  const hasText = segmentation.sentences.length > 0;
  const overLimit = rawText.length > CHAR_SOFT_LIMIT;

  const liveStatus = useMemo(() => {
    if (snapshot.status === "idle" || snapshot.sentenceIndex < 0) return "";
    const sentence = segmentation.sentences[snapshot.sentenceIndex];
    const paragraph = sentence ? sentence.paragraphIndex + 1 : 0;
    const verb = snapshot.status === "paused" ? "Paused" : "Speaking";
    return `${verb} — paragraph ${paragraph}, sentence ${
      snapshot.sentenceIndex + 1
    } of ${segmentation.sentences.length}`;
  }, [snapshot.status, snapshot.sentenceIndex, segmentation.sentences]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Workspace</h1>
          <p className="text-text-muted">
            Paste or import text, choose a voice, and listen.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShortcutsOpen(true)}
        >
          <Keyboard className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Shortcuts</span>
        </Button>
      </div>

      {/* Polite status region for assistive tech (sentence granularity). */}
      <p className="sr-only" role="status" aria-live="polite">
        {liveStatus}
      </p>

      {snapshot.error ? (
        <p
          role="alert"
          className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {snapshot.error}
        </p>
      ) : null}
      {notice ? (
        <p className="mb-4 rounded-md border border-border bg-surface-sunken px-3 py-2 text-sm text-text-muted">
          {notice}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="source-text" className="font-bold">
              Your text
            </label>
            <textarea
              id="source-text"
              value={rawText}
              onChange={(event) => {
                setRawText(event.target.value);
                setSourceLabel(null);
                setActiveQueueId(null);
              }}
              rows={6}
              placeholder="Paste or type text here, or import a file below…"
              className="w-full resize-y rounded-lg border border-border-strong bg-surface p-3 text-base"
            />
            <div className="flex items-center justify-between text-sm text-text-muted">
              <span className={overLimit ? "text-danger" : undefined}>
                {rawText.length.toLocaleString()} characters
                {overLimit ? " — very long text may be slow" : ""}
              </span>
              {rawText.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    engine.stop();
                    setRawText("");
                    setSourceLabel(null);
                    setActiveQueueId(null);
                  }}
                  className="hover:text-danger"
                >
                  Clear text
                </button>
              ) : null}
            </div>
          </div>

          <ImportDropzone onImported={handleImported} />

          <section
            aria-label="Transcript"
            className="rounded-xl border border-border bg-surface p-4"
          >
            <Transcript
              sentences={segmentation.sentences}
              activeIndex={snapshot.sentenceIndex}
              wordRange={snapshot.wordRange}
              hasWordBoundaries={snapshot.hasWordBoundaries}
              autoScroll={prefs.autoScroll}
              textScale={prefs.textScale}
              lang={selectedVoice?.lang}
              onPlaySentence={handlePlaySentence}
            />
          </section>

          <PlaybackBar
            status={snapshot.status}
            sentenceIndex={snapshot.sentenceIndex}
            totalSentences={segmentation.sentences.length}
            disabled={!hasText || !supported}
            autoScroll={prefs.autoScroll}
            onToggle={() => {
              countSession();
              track("tool_started");
              engine.toggle();
            }}
            onStop={() => engine.stop()}
            onPrevSentence={() => engine.prevSentence()}
            onNextSentence={() => engine.nextSentence()}
            onPrevParagraph={() => engine.prevParagraph()}
            onNextParagraph={() => engine.nextParagraph()}
            onToggleAutoScroll={() =>
              updatePrefs({ autoScroll: !prefs.autoScroll })
            }
          />
        </div>

        <aside className="flex flex-col gap-6">
          <section
            aria-labelledby="voice-heading"
            className="rounded-xl border border-border bg-surface p-4"
          >
            <h2 id="voice-heading" className="mb-3 font-bold">
              Voice
            </h2>
            <VoicePicker
              voices={voices}
              loading={voicesLoading}
              supported={supported}
              selectedURI={selectedURI}
              onSelect={handleSelectVoice}
              onReload={reload}
            />
          </section>

          <section
            aria-label="Playback settings"
            className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4"
          >
            <Slider
              id="rate"
              label="Speed"
              min={0.5}
              max={3}
              step={0.1}
              largeStep={0.5}
              value={rate}
              defaultValue={prefs.defaultRate}
              onChange={setRate}
              format={(v) => `${v.toFixed(1)}×`}
              formatAria={(v) => `${v.toFixed(1)} times speed`}
            />
            <Slider
              id="pitch"
              label="Pitch"
              min={0.5}
              max={2}
              step={0.1}
              largeStep={0.5}
              value={pitch}
              defaultValue={prefs.defaultPitch}
              onChange={setPitch}
              format={(v) => v.toFixed(1)}
              formatAria={(v) => `pitch ${v.toFixed(1)}`}
            />
            <Slider
              id="volume"
              label="Volume"
              min={0}
              max={1}
              step={0.05}
              largeStep={0.2}
              value={volume}
              defaultValue={prefs.defaultVolume}
              onChange={setVolume}
              format={(v) => `${Math.round(v * 100)}%`}
              formatAria={(v) => `volume ${Math.round(v * 100)} percent`}
            />
          </section>

          <div className="rounded-xl border border-border bg-surface p-4">
            <TextPrepPanel
              prep={prep}
              onChange={handlePrepChange}
              sampleText={rawText}
            />
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <PresetBar
              presets={presets}
              availableVoiceURIs={availableVoiceURIs}
              canSave={selectedVoice !== null || voices.length === 0}
              onApply={handleApplyPreset}
              onSave={handleSavePreset}
              onRename={handleRenamePreset}
              onDelete={handleDeletePreset}
            />
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <QueuePanel
              items={queue}
              activeId={activeQueueId}
              canAdd={rawText.trim().length > 0}
              onAddCurrent={handleAddToQueue}
              onLoad={handleLoadQueue}
              onRemove={handleRemoveQueue}
              onMove={handleMoveQueue}
              onClear={handleClearQueue}
            />
          </div>
        </aside>
      </div>

      <ShortcutsDialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}
