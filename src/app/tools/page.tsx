"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Scissors,
  Clock,
  Subtitles,
  Languages,
  Copy,
  Check,
  RotateCcw,
  Download,
  Trash2,
  Plus,
  Volume2,
  Sparkles,
  FileText,
  Search,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getPronunciationDict, savePronunciationDict } from "@/lib/storage";
import {
  removeRepeatedSpaces,
  removeUnwantedLineBreaks,
  stripHtmlTags,
  fixPunctuationSpacing,
  convertCase,
  calculateTextMetrics,
  wordsToSpeechMinutes,
  minutesToWords,
  srtToVtt,
  vttToSrt,
  stripSubtitleTimestamps,
  createSilenceAudioBlob,
} from "@/lib/daily-tools";
import { cn } from "@/lib/cn";

function ToolsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = (searchParams.get("tab") as "cleaner" | "calc" | "dict" | "subs" | "audio") || "cleaner";
  const [activeTab, setActiveTab] = useState<"cleaner" | "calc" | "dict" | "subs" | "audio">(initialTab);

  /* ------------------------------------------------------------------ */
  /* 1. Text Cleaner States                                             */
  /* ------------------------------------------------------------------ */
  const [cleanerInput, setCleanerInput] = useState(
    "Paste messy text here... <p>HTML tags</p>,   repeated   spaces, and broken\nline breaks."
  );
  const [copiedCleaner, setCopiedCleaner] = useState(false);

  const cleanerMetrics = useMemo(() => calculateTextMetrics(cleanerInput), [cleanerInput]);

  const handleCleanAction = (action: "spaces" | "breaks" | "html" | "punct" | "upper" | "lower" | "title" | "sentence") => {
    let result = cleanerInput;
    if (action === "spaces") result = removeRepeatedSpaces(result);
    if (action === "breaks") result = removeUnwantedLineBreaks(result);
    if (action === "html") result = stripHtmlTags(result);
    if (action === "punct") result = fixPunctuationSpacing(result);
    if (["upper", "lower", "title", "sentence"].includes(action)) {
      result = convertCase(result, action as "upper" | "lower" | "title" | "sentence");
    }
    setCleanerInput(result);
  };

  const handleCopyCleaner = () => {
    navigator.clipboard.writeText(cleanerInput);
    setCopiedCleaner(true);
    setTimeout(() => setCopiedCleaner(false), 2000);
  };

  /* ------------------------------------------------------------------ */
  /* 2. Calculator States                                               */
  /* ------------------------------------------------------------------ */
  const [calcWords, setCalcWords] = useState<string>("750");
  const [calcRate, setCalcRate] = useState<string>("1.0");
  const [calcReadingWpm, setCalcReadingWpm] = useState<string>("220");
  const [targetMinutes, setTargetMinutes] = useState<string>("5");

  const calcResults = useMemo(() => {
    const words = Math.max(0, parseInt(calcWords, 10) || 0);
    const rate = Math.max(0.1, parseFloat(calcRate) || 1.0);
    const readingWpm = Math.max(50, parseInt(calcReadingWpm, 10) || 220);
    const speech = wordsToSpeechMinutes(words, rate);
    const readingMinutes = words / readingWpm;

    // YouTube 10-minute script target words
    const ytWords = minutesToWords(10, rate);
    const podcastWords = minutesToWords(30, rate);
    const targetWordsResult = minutesToWords(parseFloat(targetMinutes) || 5, rate);

    return {
      speechFormatted: speech.formatted,
      readingFormatted: `${Math.floor(readingMinutes)}m ${Math.round((readingMinutes % 1) * 60)}s`,
      ytWords,
      podcastWords,
      targetWordsResult,
    };
  }, [calcWords, calcRate, calcReadingWpm, targetMinutes]);

  /* ------------------------------------------------------------------ */
  /* 3. Subtitle States                                                 */
  /* ------------------------------------------------------------------ */
  const [subsInput, setSubsInput] = useState(
    "1\n00:00:01,000 --> 00:00:04,000\nWelcome to MK VoiceKit.\n\n2\n00:00:04,500 --> 00:00:08,000\nThis tool converts subtitle formats."
  );
  const [subsOutput, setSubsOutput] = useState("");
  const [copiedSubs, setCopiedSubs] = useState(false);

  const handleConvertSrtToVtt = () => setSubsOutput(srtToVtt(subsInput));
  const handleConvertVttToSrt = () => setSubsOutput(vttToSrt(subsInput));
  const handleStripTimestamps = () => setSubsOutput(stripSubtitleTimestamps(subsInput));

  const handleCopySubs = () => {
    navigator.clipboard.writeText(subsOutput || subsInput);
    setCopiedSubs(true);
    setTimeout(() => setCopiedSubs(false), 2000);
  };

  /* ------------------------------------------------------------------ */
  /* 4. Pronunciation Dictionary States                                 */
  /* ------------------------------------------------------------------ */
  const [dict, setDict] = useState<Record<string, string>>({});
  const [dictWord, setDictWord] = useState("");
  const [dictReplace, setDictReplace] = useState("");
  const [dictSearch, setDictSearch] = useState("");

  const loadDict = async () => {
    const loaded = await getPronunciationDict();
    setDict(loaded);
  };

  useEffect(() => {
    loadDict();
  }, []);

  const handleAddDict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dictWord.trim() || !dictReplace.trim()) return;
    const updated = { ...dict, [dictWord.trim()]: dictReplace.trim() };
    await savePronunciationDict(updated);
    setDict(updated);
    setDictWord("");
    setDictReplace("");
  };

  const handleDeleteDict = async (word: string) => {
    const updated = { ...dict };
    delete updated[word];
    await savePronunciationDict(updated);
    setDict(updated);
  };

  const filteredDict = useMemo(() => {
    if (!dictSearch.trim()) return Object.entries(dict);
    const query = dictSearch.toLowerCase();
    return Object.entries(dict).filter(
      ([word, rep]) => word.toLowerCase().includes(query) || rep.toLowerCase().includes(query)
    );
  }, [dict, dictSearch]);

  /* ------------------------------------------------------------------ */
  /* 5. Audio Utilities States                                          */
  /* ------------------------------------------------------------------ */
  const [silenceDuration, setSilenceDuration] = useState("5");

  const handleDownloadSilence = () => {
    const dur = Math.max(0.5, parseFloat(silenceDuration) || 5);
    const blob = createSilenceAudioBlob(dur);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `silence-${dur}s.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold sm:text-3xl text-text">Daily Audio & Script Utilities</h1>
        <p className="mt-1 text-xs sm:text-sm text-text-muted">
          100% free, deterministic browser utilities for writers, creators, podcasters, and voice artists. No signup required.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {[
          { key: "cleaner", label: "Text Cleaner", icon: Scissors },
          { key: "calc", label: "Speech & Reading Calculators", icon: Clock },
          { key: "subs", label: "Subtitle & SRT/VTT Converters", icon: Subtitles },
          { key: "dict", label: "Pronunciation Dictionary", icon: Languages },
          { key: "audio", label: "Web Audio Tools", icon: Volume2 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key as any);
              router.replace(`/tools?tab=${tab.key}`);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              activeTab === tab.key
                ? "bg-primary text-on-primary shadow-sm"
                : "text-text-muted hover:text-text hover:bg-surface-sunken"
            )}
          >
            <tab.icon className="size-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: TEXT CLEANER */}
      {activeTab === "cleaner" && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-base text-text">Text Cleaner & Normalizer</h2>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={handleCopyCleaner}>
                  {copiedCleaner ? <Check className="size-3.5 text-emerald-500 mr-1" /> : <Copy className="size-3.5 mr-1" />}
                  <span>{copiedCleaner ? "Copied" : "Copy Text"}</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCleanerInput("")}
                  className="text-danger hover:text-danger"
                >
                  <RotateCcw className="size-3.5 mr-1" /> Clear
                </Button>
              </div>
            </div>

            <textarea
              value={cleanerInput}
              onChange={(e) => setCleanerInput(e.target.value)}
              rows={8}
              placeholder="Paste raw or messy script text here…"
              className="w-full rounded-lg border border-border bg-surface-sunken p-3 text-sm focus:outline-none focus:border-primary"
            />

            {/* Quick Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
              <span className="text-xs font-bold text-text-muted mr-1">Clean:</span>
              <button
                onClick={() => handleCleanAction("spaces")}
                className="px-2.5 py-1 rounded bg-surface border border-border text-xs font-semibold hover:bg-surface-sunken cursor-pointer"
              >
                Remove Repeated Spaces
              </button>
              <button
                onClick={() => handleCleanAction("breaks")}
                className="px-2.5 py-1 rounded bg-surface border border-border text-xs font-semibold hover:bg-surface-sunken cursor-pointer"
              >
                Fix Line Breaks
              </button>
              <button
                onClick={() => handleCleanAction("html")}
                className="px-2.5 py-1 rounded bg-surface border border-border text-xs font-semibold hover:bg-surface-sunken cursor-pointer"
              >
                Strip HTML Tags
              </button>
              <button
                onClick={() => handleCleanAction("punct")}
                className="px-2.5 py-1 rounded bg-surface border border-border text-xs font-semibold hover:bg-surface-sunken cursor-pointer"
              >
                Fix Punctuation
              </button>

              <span className="text-xs font-bold text-text-muted mx-1">Case:</span>
              <button
                onClick={() => handleCleanAction("sentence")}
                className="px-2.5 py-1 rounded bg-surface border border-border text-xs font-semibold hover:bg-surface-sunken cursor-pointer"
              >
                Sentence case
              </button>
              <button
                onClick={() => handleCleanAction("title")}
                className="px-2.5 py-1 rounded bg-surface border border-border text-xs font-semibold hover:bg-surface-sunken cursor-pointer"
              >
                Title Case
              </button>
              <button
                onClick={() => handleCleanAction("lower")}
                className="px-2.5 py-1 rounded bg-surface border border-border text-xs font-semibold hover:bg-surface-sunken cursor-pointer"
              >
                lowercase
              </button>
              <button
                onClick={() => handleCleanAction("upper")}
                className="px-2.5 py-1 rounded bg-surface border border-border text-xs font-semibold hover:bg-surface-sunken cursor-pointer"
              >
                UPPERCASE
              </button>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border text-center text-xs">
              <div className="p-3 rounded-lg bg-surface-sunken border border-border/60">
                <p className="text-lg font-bold text-primary">{cleanerMetrics.words.toLocaleString()}</p>
                <p className="text-[11px] text-text-muted">Word Count</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-sunken border border-border/60">
                <p className="text-lg font-bold text-text">{cleanerMetrics.characters.toLocaleString()}</p>
                <p className="text-[11px] text-text-muted">Characters</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-sunken border border-border/60">
                <p className="text-lg font-bold text-text">{cleanerMetrics.sentences}</p>
                <p className="text-[11px] text-text-muted">Sentences</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-sunken border border-border/60">
                <p className="text-lg font-bold text-emerald-500">
                  {Math.ceil(cleanerMetrics.speakingTimeMinutes)}m
                </p>
                <p className="text-[11px] text-text-muted">Speaking Time</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CALCULATORS */}
      {activeTab === "calc" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Words to Minutes Calculator */}
            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-base text-text">Words to Speech & Reading Time</h2>
              <p className="text-xs text-text-muted">
                Calculate how long it will take to read or speak a given number of words.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-text-muted block mb-1">Total Word Count</label>
                  <input
                    type="number"
                    value={calcWords}
                    onChange={(e) => setCalcWords(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface-sunken p-2 text-sm font-bold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-text-muted block mb-1">Speech Speed Rate</label>
                    <select
                      value={calcRate}
                      onChange={(e) => setCalcRate(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface-sunken p-2 text-xs font-semibold focus:outline-none"
                    >
                      <option value="0.75">0.75× (Slow / Audiobooks)</option>
                      <option value="1.0">1.0× (Normal 150 WPM)</option>
                      <option value="1.25">1.25× (Fast 187 WPM)</option>
                      <option value="1.5">1.5× (YouTube 225 WPM)</option>
                      <option value="2.0">2.0× (Double Speed)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-muted block mb-1">Silent Reading WPM</label>
                    <input
                      type="number"
                      value={calcReadingWpm}
                      onChange={(e) => setCalcReadingWpm(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface-sunken p-2 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-text">Estimated Speaking Time:</span>
                  <span className="font-extrabold text-primary text-base">{calcResults.speechFormatted}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted border-t border-primary/20 pt-2">
                  <span>Estimated Silent Reading:</span>
                  <span className="font-bold text-text">{calcResults.readingFormatted}</span>
                </div>
              </div>
            </div>

            {/* Minutes to Words Target Calculator */}
            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-base text-text">Minutes to Target Word Count</h2>
              <p className="text-xs text-text-muted">
                Calculate the exact script length needed to hit a specific presentation or video time.
              </p>

              <div>
                <label className="text-xs font-semibold text-text-muted block mb-1">Desired Duration (Minutes)</label>
                <input
                  type="number"
                  value={targetMinutes}
                  onChange={(e) => setTargetMinutes(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-sunken p-2 text-sm font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <div className="p-4 rounded-xl bg-surface-sunken border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">Required Script Length:</span>
                  <span className="text-lg font-extrabold text-accent">
                    {calcResults.targetWordsResult.toLocaleString()} words
                  </span>
                </div>

                <div className="border-t border-border pt-2 space-y-1 text-xs text-text-muted">
                  <div className="flex justify-between">
                    <span>10-Minute YouTube Video:</span>
                    <span className="font-bold text-text">{calcResults.ytWords.toLocaleString()} words</span>
                  </div>
                  <div className="flex justify-between">
                    <span>30-Minute Podcast Episode:</span>
                    <span className="font-bold text-text">{calcResults.podcastWords.toLocaleString()} words</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SUBTITLE & SRT/VTT TOOLS */}
      {activeTab === "subs" && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-text">Subtitle & Transcript Converter</h2>
            <p className="text-xs text-text-muted">
              Convert between SRT and VTT formats, or strip all timestamps and cue numbers into clean spoken dialogue.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted">Input Subtitles (.srt / .vtt)</label>
                <textarea
                  value={subsInput}
                  onChange={(e) => setSubsInput(e.target.value)}
                  rows={10}
                  className="w-full rounded-lg border border-border bg-surface-sunken p-3 text-xs font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-muted">Output Result</label>
                  {subsOutput && (
                    <button
                      onClick={handleCopySubs}
                      className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1 font-medium"
                    >
                      {copiedSubs ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedSubs ? "Copied" : "Copy Output"}</span>
                    </button>
                  )}
                </div>
                <textarea
                  value={subsOutput}
                  readOnly
                  rows={10}
                  placeholder="Converted subtitle or clean text will appear here…"
                  className="w-full rounded-lg border border-border bg-surface-sunken p-3 text-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
              <Button size="sm" onClick={handleConvertSrtToVtt}>
                Convert SRT to VTT
              </Button>
              <Button size="sm" variant="secondary" onClick={handleConvertVttToSrt}>
                Convert VTT to SRT
              </Button>
              <Button size="sm" variant="secondary" onClick={handleStripTimestamps}>
                Strip Timestamps (Clean Text)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRONUNCIATION DICTIONARY */}
      {activeTab === "dict" && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-text">Pronunciation Dictionary</h2>
            <p className="text-xs text-text-muted">
              Configure phonetic replacements so synthetic voices pronounce technical terms, names, and acronyms correctly.
            </p>

            <form onSubmit={handleAddDict} className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-surface-sunken border border-border">
              <div className="flex-1 min-w-[180px]">
                <label className="text-[11px] font-semibold text-text-muted block mb-1">Word or Acronym</label>
                <input
                  type="text"
                  placeholder="e.g. SQL"
                  value={dictWord}
                  onChange={(e) => setDictWord(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface p-2 text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="text-[11px] font-semibold text-text-muted block mb-1">Spoken Phonetic Replacement</label>
                <input
                  type="text"
                  placeholder="e.g. Sequel"
                  value={dictReplace}
                  onChange={(e) => setDictReplace(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface p-2 text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <Button size="sm" type="submit" className="mt-auto h-9">
                <Plus size={14} className="mr-1" /> Add Replacement
              </Button>
            </form>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Active Rules ({filteredDict.length})
                </h3>
                <input
                  type="text"
                  placeholder="Search rules…"
                  value={dictSearch}
                  onChange={(e) => setDictSearch(e.target.value)}
                  className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs focus:outline-none"
                />
              </div>

              {filteredDict.length === 0 ? (
                <p className="text-xs text-text-muted italic py-4 text-center">No custom pronunciation rules configured.</p>
              ) : (
                <div className="divide-y divide-border rounded-xl border border-border bg-surface overflow-hidden">
                  {filteredDict.map(([word, rep]) => (
                    <div key={word} className="flex items-center justify-between p-3 text-xs hover:bg-surface-sunken">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-text">{word}</span>
                        <span className="text-text-muted">→</span>
                        <span className="text-primary font-medium">{rep}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteDict(word)}
                        className="text-danger/70 hover:text-danger cursor-pointer p-1"
                        title="Delete rule"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIO UTILITIES */}
      {activeTab === "audio" && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-base text-text">Web Audio Generators & Tools</h2>
            <p className="text-xs text-text-muted">
              Generate clean silence audio tracks for podcast padding or video intro gaps using the Web Audio API.
            </p>

            <div className="p-4 rounded-xl bg-surface-sunken border border-border space-y-3 max-w-md">
              <h3 className="font-bold text-sm text-text">Generate WAV Silence Track</h3>
              <div>
                <label className="text-xs text-text-muted block mb-1">Silence Duration (Seconds)</label>
                <input
                  type="number"
                  step="0.5"
                  value={silenceDuration}
                  onChange={(e) => setSilenceDuration(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface p-2 text-xs font-bold focus:outline-none focus:border-primary"
                />
              </div>
              <Button size="sm" onClick={handleDownloadSilence} className="w-full">
                <Download size={14} className="mr-1.5" /> Download {silenceDuration}s Silence (.wav)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ToolsPage() {
  return (
    <Suspense fallback={<div className="h-96 rounded-xl border border-border bg-surface-sunken animate-pulse" />}>
      <ToolsContent />
    </Suspense>
  );
}
