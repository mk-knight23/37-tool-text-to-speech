"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  Settings,
  Undo2,
  Redo2,
  Maximize2,
  Minimize2,
  Search,
  Replace,
  Sparkles,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { useSpeechEngine } from "@/hooks/useSpeechEngine";
import { useVoices } from "@/hooks/useVoices";
import { usePrefs } from "@/hooks/usePrefs";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { segmentText } from "@/lib/speech/segment";
import { findVoiceByURI, detectLanguage, suggestVoiceForLanguage } from "@/lib/speech/voices";
import { isPrepActive, prepareText, type PrepOptions } from "@/lib/textprep";
import type { ShortcutActions } from "@/lib/keyboard";
import { coerceSliderValue } from "@/lib/slider";
import { excerpt, formatDuration } from "@/lib/format";
import { cn } from "@/lib/cn";
import {
  addHistoryEntry,
  deletePreset,
  listPresets,
  loadQueue,
  savePreset,
  saveQueue,
  updateStats,
  getDraftText,
  setDraftText,
  type Preset,
  type QueueItem,
  type UsageStats,
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
import { AiPanel } from "./AiPanel";
import { ReadingRuler } from "./ReadingRuler";

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

  // Load welcome text and wrap in undo/redo stack
  const {
    value: rawText,
    setValue: setRawText,
    undo,
    redo,
    reset: resetText,
    canUndo,
    canRedo,
  } = useUndoRedo(
    "Welcome to MK VoiceKit. Type or paste your text here, drop a PDF or subtitle file, or click Improve with AI to polish your script."
  );

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

  // Advanced toggler & accessibility options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [dyslexiaSpacing, setDyslexiaSpacing] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [rulerFollow, setRulerFollow] = useState<"cursor" | "sentence">("sentence");

  // Find and Replace States
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);

  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const sessionCounted = useRef(false);

  // Load draft text on mount
  useEffect(() => {
    async function loadDraft() {
      const draft = await getDraftText();
      if (draft !== null) {
        resetText(draft);
      }
    }
    void loadDraft();
  }, [resetText]);

  // Auto-save draft text
  useEffect(() => {
    if (!rawText.trim()) return;
    const timer = setTimeout(() => {
      void setDraftText(rawText);
    }, 2000);
    return () => clearTimeout(timer);
  }, [rawText]);

  // Adopt persisted preferences once loaded (async source of truth).
  useEffect(() => {
    if (!prefsLoaded) return;
    setRate(prefs.defaultRate);
    setPitch(prefs.defaultPitch);
    setVolume(prefs.defaultVolume);
    setSelectedURI(prefs.lastVoiceURI);
    setPrep(prefs.prep);
  }, [prefsLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load presets + queue once, and adopt any "Speak again" handoff text.
  useEffect(() => {
    void listPresets().then(setPresets);
    void loadQueue().then(setQueue);
    const stashed = takeStashedText();
    if (stashed) {
      setRawText(stashed);
      setSourceLabel(null);
    }
    track("tool_opened");
  }, [setRawText]);

  const spokenText = useMemo(
    () => (isPrepActive(prep) ? prepareText(rawText, prep) : rawText),
    [rawText, prep]
  );
  const segmentation = useMemo(() => segmentText(spokenText), [spokenText]);

  const selectedVoice = useMemo(
    () => findVoiceByURI(voices, selectedURI),
    [voices, selectedURI]
  );

  // Auto-suggest best voice on language detection
  useEffect(() => {
    if (voices.length === 0 || !rawText.trim()) return;
    const timer = setTimeout(() => {
      const detectedLang = detectLanguage(rawText);
      const currentVoiceLang = selectedVoice ? selectedVoice.lang.split(/[-_]/)[0].toLowerCase() : "";
      if (currentVoiceLang && currentVoiceLang !== detectedLang) {
        const suggested = suggestVoiceForLanguage(voices, detectedLang);
        if (suggested && suggested.voiceURI !== selectedURI) {
          setSelectedURI(suggested.voiceURI);
          setNotice(`Auto-switched voice to ${suggested.name} based on detected text language.`);
        }
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [rawText, voices, selectedVoice, selectedURI]);

  // Default a voice once voices are available and none is chosen.
  useEffect(() => {
    if (voices.length === 0) return;
    if (selectedURI && findVoiceByURI(voices, selectedURI)) return;
    const fallback = pickDefaultVoice(voices);
    if (fallback) setSelectedURI(fallback.voiceURI);
  }, [voices, selectedURI]);

  // Text metrics calculation
  const wordCount = useMemo(() => {
    const clean = rawText.trim();
    if (!clean) return 0;
    return clean.split(/\s+/).length;
  }, [rawText]);

  const paragraphCount = useMemo(() => {
    if (!rawText.trim()) return 0;
    return rawText.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || 1;
  }, [rawText]);

  const sentenceCount = segmentation.sentences.length;

  const estimatedDurationSec = useMemo(() => {
    if (rate <= 0) return 0;
    return (wordCount / (150 * rate)) * 60;
  }, [wordCount, rate]);

  const remainingDurationSec = useMemo(() => {
    if (rate <= 0 || sentenceCount === 0) return 0;
    const currentIdx = Math.max(0, snapshot.sentenceIndex);
    const remainingSentences = segmentation.sentences.slice(currentIdx);
    const remainingWords = remainingSentences
      .map((s) => s.text)
      .join(" ")
      .split(/\s+/)
      .filter(Boolean).length;
    return (remainingWords / (150 * rate)) * 60;
  }, [sentenceCount, snapshot.sentenceIndex, segmentation.sentences, rate]);

  // Find matches count
  const findMatchesCount = useMemo(() => {
    if (!findQuery.trim() || !rawText) return 0;
    const flags = caseSensitive ? "g" : "gi";
    try {
      const escaped = findQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, flags);
      const matches = rawText.match(regex);
      return matches ? matches.length : 0;
    } catch {
      return 0;
    }
  }, [findQuery, rawText, caseSensitive]);

  const handleReplaceNext = () => {
    if (!findQuery.trim() || !rawText) return;
    const flags = caseSensitive ? "" : "i";
    try {
      const escaped = findQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, flags);
      const nextText = rawText.replace(regex, replaceQuery);
      setRawText(nextText);
    } catch {
      // ignore
    }
  };

  const handleReplaceAll = () => {
    if (!findQuery.trim() || !rawText) return;
    const flags = caseSensitive ? "g" : "gi";
    try {
      const escaped = findQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, flags);
      const nextText = rawText.replaceAll(regex, replaceQuery);
      setRawText(nextText);
      setNotice(`Replaced all occurrences of "${findQuery}".`);
    } catch {
      // ignore
    }
  };

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
        text: rawText,
        excerpt: excerpt(rawText),
        chars: rawText.length,
        voiceName,
        voiceURI: selectedVoice?.voiceURI ?? null,
        rate,
        pitch,
        volume,
        durationMs: spokenMs,
      });
      void updateStats((stats: UsageStats) => {
        const usage = stats.voiceUsage || {};
        return {
          ...stats,
          itemsSpoken: stats.itemsSpoken + 1,
          charactersSpoken: stats.charactersSpoken + rawText.length,
          msListened: stats.msListened + spokenMs,
          voiceUsage: {
            ...usage,
            [voiceName]: (usage[voiceName] ?? 0) + 1,
          },
        };
      });
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

  const handleUseAiText = (text: string) => {
    engine.stop();
    setRawText(text);
    setSourceLabel(null);
    setActiveQueueId(null);
    setNotice("Replaced your text with the AI transformation.");
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
    <div
      className={cn(
        "mx-auto max-w-5xl overflow-x-clip px-4 py-6 transition-all duration-300",
        focusMode &&
          "fixed inset-0 z-50 max-w-none bg-background p-6 sm:p-10 overflow-y-auto flex flex-col gap-6"
      )}
    >
      {/* Top Workspace Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl text-text">
            {focusMode ? "Focus Mode" : "Text to Speech Workspace"}
          </h2>
          <p className="text-text-muted text-xs sm:text-sm">
            {focusMode
              ? "Distraction-free focus view. Press Escape or Exit Focus when done."
              : "Paste text, import documents, choose voice and speed, then click Listen."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {focusMode ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFocusMode(false)}
              className="cursor-pointer"
            >
              <Minimize2 className="size-4 mr-1.5" />
              <span>Exit Focus</span>
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFocusMode(true)}
              className="cursor-pointer"
              title="Enter distraction-free fullscreen view"
            >
              <Maximize2 className="size-4 mr-1.5" />
              <span className="hidden sm:inline">Focus Mode</span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAiPanel(!showAiPanel)}
            className={cn(
              "cursor-pointer border-accent/40",
              showAiPanel && "bg-accent/15 text-accent border-accent"
            )}
            title="Improve or transform script with AI"
          >
            <Sparkles className="size-4 mr-1.5 text-accent" />
            <span>Improve with AI</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShortcutsOpen(true)}
            className="cursor-pointer"
          >
            <Keyboard className="size-4 mr-1.5" />
            <span className="hidden sm:inline">Shortcuts</span>
          </Button>
        </div>
      </div>

      {/* Polite status region for screen readers */}
      <p className="sr-only" role="status" aria-live="polite">
        {liveStatus}
      </p>

      {snapshot.error ? (
        <p
          role="alert"
          className="mb-4 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger font-medium"
        >
          {snapshot.error}
        </p>
      ) : null}

      {notice ? (
        <div className="mb-4 flex items-center justify-between rounded-md border border-border bg-surface-sunken px-3 py-2 text-sm text-text-muted">
          <span>{notice}</span>
          <button
            onClick={() => setNotice(null)}
            className="text-text-muted hover:text-text cursor-pointer p-1"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        {/* Main Text Input & Playback Area */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 bg-surface border border-border p-4 rounded-xl shadow-sm">
            {/* Top Toolbar: Undo/Redo, Find/Replace, Reading Ruler, Dyslexia Mode */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 mb-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={undo}
                  disabled={!canUndo}
                  className="p-1.5 rounded hover:bg-surface-sunken disabled:opacity-40 cursor-pointer"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={redo}
                  disabled={!canRedo}
                  className="p-1.5 rounded hover:bg-surface-sunken disabled:opacity-40 cursor-pointer"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="size-4" />
                </button>
                <div className="h-4 w-px bg-border mx-1" />
                <button
                  type="button"
                  onClick={() => setShowFindReplace(!showFindReplace)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border transition-all cursor-pointer",
                    showFindReplace
                      ? "bg-primary text-on-primary border-primary"
                      : "border-border text-text hover:bg-surface-sunken"
                  )}
                  title="Find and replace text"
                >
                  <Search size={12} />
                  <span>Find & Replace</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDyslexiaSpacing(!dyslexiaSpacing)}
                  className={cn(
                    "px-2 py-1 rounded text-xs font-semibold border transition-all cursor-pointer",
                    dyslexiaSpacing
                      ? "bg-primary text-on-primary border-primary"
                      : "border-border text-text hover:bg-surface-sunken"
                  )}
                  title="Toggle wide word/letter spacing for easier reading"
                >
                  Dyslexia Mode
                </button>

                <button
                  type="button"
                  onClick={() => setShowRuler(!showRuler)}
                  className={cn(
                    "px-2 py-1 rounded text-xs font-semibold border transition-all cursor-pointer",
                    showRuler
                      ? "bg-primary text-on-primary border-primary"
                      : "border-border text-text hover:bg-surface-sunken"
                  )}
                  title="Toggle reading focus ruler overlay"
                >
                  Reading Ruler
                </button>

                {showRuler && (
                  <select
                    value={rulerFollow}
                    onChange={(e) => setRulerFollow(e.target.value as "cursor" | "sentence")}
                    className="text-xs rounded border border-border bg-surface px-1.5 py-1"
                  >
                    <option value="sentence">Follow Active Sentence</option>
                    <option value="cursor">Follow Mouse Cursor</option>
                  </select>
                )}
              </div>
            </div>

            {/* Find and Replace Modal/Toolbar */}
            {showFindReplace && (
              <div className="mb-3 rounded-lg border border-border bg-surface-sunken p-3 flex flex-wrap items-center gap-2 animate-fade-in text-xs">
                <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                  <Search size={14} className="text-text-muted" />
                  <input
                    type="text"
                    placeholder="Find text…"
                    value={findQuery}
                    onChange={(e) => setFindQuery(e.target.value)}
                    className="flex-1 rounded border border-border bg-surface px-2 py-1 text-xs focus:outline-none focus:border-primary"
                  />
                  {findQuery && (
                    <span className="text-[10px] text-text-muted font-mono">
                      {findMatchesCount} {findMatchesCount === 1 ? "match" : "matches"}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                  <Replace size={14} className="text-text-muted" />
                  <input
                    type="text"
                    placeholder="Replace with…"
                    value={replaceQuery}
                    onChange={(e) => setReplaceQuery(e.target.value)}
                    className="flex-1 rounded border border-border bg-surface px-2 py-1 text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-[11px] cursor-pointer text-text-muted select-none">
                    <input
                      type="checkbox"
                      checked={caseSensitive}
                      onChange={(e) => setCaseSensitive(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span>Match Case</span>
                  </label>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={findMatchesCount === 0}
                    onClick={handleReplaceNext}
                    className="text-xs py-1 h-7"
                  >
                    Replace
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={findMatchesCount === 0}
                    onClick={handleReplaceAll}
                    className="text-xs py-1 h-7"
                  >
                    Replace All
                  </Button>
                  <button
                    onClick={() => setShowFindReplace(false)}
                    className="p-1 text-text-muted hover:text-text cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* AI Panel Expansion if triggered */}
            {showAiPanel && (
              <div className="mb-4 rounded-xl border border-accent/30 bg-surface-sunken p-4 shadow-sm animate-fade-in">
                <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-accent" />
                    <h3 className="font-bold text-sm">Improve Script with AI</h3>
                  </div>
                  <button
                    onClick={() => setShowAiPanel(false)}
                    className="text-text-muted hover:text-text cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
                <AiPanel sourceText={rawText} onUseText={handleUseAiText} />
              </div>
            )}

            {/* Main Textarea */}
            <label htmlFor="source-text" className="font-semibold text-sm flex items-center justify-between">
              <span>Text to read aloud</span>
              {sourceLabel && (
                <span className="text-xs font-normal text-primary">Source: {sourceLabel}</span>
              )}
            </label>
            <textarea
              id="source-text"
              value={rawText}
              onChange={(event) => {
                setRawText(event.target.value);
                setSourceLabel(null);
                setActiveQueueId(null);
              }}
              rows={focusMode ? 18 : 8}
              placeholder="Paste or type text here, or import a document below…"
              className={cn(
                "w-full resize-y rounded-lg border border-border bg-surface p-3.5 text-base focus:border-primary focus:outline-none transition-all leading-relaxed",
                dyslexiaSpacing && "vk-dyslexia font-sans tracking-wide leading-loose"
              )}
            />

            {/* Enhanced Counters & Metrics Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted pt-1 border-t border-border/60">
              <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                <span className={overLimit ? "text-danger font-semibold" : undefined}>
                  {rawText.length.toLocaleString()} chars
                </span>
                <span>•</span>
                <span>{wordCount.toLocaleString()} words</span>
                <span>•</span>
                <span>{sentenceCount} sentences</span>
                <span>•</span>
                <span>{paragraphCount} paragraphs</span>
                <span>•</span>
                <span className="font-medium text-text">
                  Est. time: {formatDuration(estimatedDurationSec * 1000)}
                </span>
                {snapshot.status !== "idle" && snapshot.sentenceIndex >= 0 && (
                  <>
                    <span>•</span>
                    <span className="text-primary font-medium">
                      Remaining: {formatDuration(remainingDurationSec * 1000)}
                    </span>
                  </>
                )}
              </div>

              {rawText.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to clear all text?")) {
                      engine.stop();
                      setRawText("");
                      setSourceLabel(null);
                      setActiveQueueId(null);
                      void setDraftText("");
                    }
                  }}
                  className="text-danger/80 hover:text-danger cursor-pointer font-medium"
                >
                  Clear text
                </button>
              ) : null}
            </div>
          </div>

          {/* Voice Picker Section */}
          <div className="bg-surface border border-border p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm sm:text-base text-text">
                Select Voice & Language
              </h2>
              <span className="text-xs text-text-muted">
                {voices.length} {voices.length === 1 ? "voice" : "voices"} available
              </span>
            </div>
            <VoicePicker
              voices={voices}
              loading={voicesLoading}
              supported={supported}
              selectedURI={selectedURI}
              onSelect={handleSelectVoice}
              onReload={reload}
            />
          </div>

          {/* Active Sentence & Word Highlighting Transcript */}
          {hasText && (
            <section
              aria-label="Interactive Transcript"
              className={cn(
                "rounded-xl border border-border bg-surface p-4 shadow-sm relative overflow-hidden",
                dyslexiaSpacing && "vk-dyslexia"
              )}
            >
              <div className="mb-2 flex items-center justify-between text-xs text-text-muted border-b border-border pb-2">
                <span className="font-semibold text-text">Live Speech Transcript</span>
                <span>Click any sentence to listen from there</span>
              </div>
              <div ref={transcriptContainerRef} className="relative max-h-80 overflow-y-auto p-1">
                <ReadingRuler
                  show={showRuler}
                  followMode={rulerFollow}
                  activeIndex={snapshot.sentenceIndex}
                  containerRef={transcriptContainerRef}
                />
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
              </div>
            </section>
          )}

          {/* Primary Playback Bar */}
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
            onReplay={() => {
              const current = snapshot.sentenceIndex;
              if (current >= 0) {
                engine.playSentence(current);
              } else {
                engine.playSentence(0);
              }
            }}
          />
        </div>

        {/* Advanced Options & Tools Drawer */}
        <div className="border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-primary transition-colors cursor-pointer py-1"
          >
            <SlidersHorizontal size={14} />
            <span>Document Uploads, Speed Presets, Queue & Text Normalization</span>
            <span>{showAdvanced ? "▲" : "▼"}</span>
          </button>

          {showAdvanced && (
            <div className="mt-4 grid gap-6 md:grid-cols-2 animate-fade-in border border-border p-5 rounded-xl bg-surface-sunken">
              <div className="flex flex-col gap-6">
                {/* File Dropzone */}
                <div className="bg-surface border border-border p-4 rounded-xl shadow-sm">
                  <h3 className="mb-2 font-semibold text-sm">Import Documents</h3>
                  <p className="text-xs text-text-muted mb-3">
                    Drag and drop PDF, Word DOCX, Markdown, TXT, or subtitle files (.srt, .vtt).
                  </p>
                  <ImportDropzone onImported={handleImported} />
                </div>

                {/* Speech Sliders */}
                <section
                  aria-label="Playback settings"
                  className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm"
                >
                  <h3 className="font-semibold text-sm">Voice Modulation</h3>
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
              </div>

              <div className="flex flex-col gap-6">
                {/* Text Preparation Replacements */}
                <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                  <h3 className="font-semibold text-sm mb-3">Offline Text Normalization</h3>
                  <TextPrepPanel
                    prep={prep}
                    onChange={handlePrepChange}
                    sampleText={rawText}
                  />
                </div>

                {/* Preset Voice Profiles */}
                <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                  <h3 className="font-semibold text-sm mb-3">Voice Presets</h3>
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

                {/* Playlist Queue */}
                <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                  <h3 className="font-semibold text-sm mb-3">Listening Queue</h3>
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
              </div>
            </div>
          )}
        </div>
      </div>

      <ShortcutsDialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}
