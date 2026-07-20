"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Clock, 
  Video, 
  Trash2, 
  Plus, 
  Scissors, 
  Subtitles, 
  Languages, 
  Check, 
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getPronunciationDict, savePronunciationDict } from "@/lib/storage";
import { expandNumbers } from "@/lib/textprep/numbers";
import { parseSubtitles } from "@/lib/parsers/subtitles";
import { cn } from "@/lib/cn";

export default function ToolsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"calc" | "dict" | "timer" | "cleaner" | "subs">("calc");

  /* ------------------------------------------------------------------ */
  /* 1. Calculator States                                               */
  /* ------------------------------------------------------------------ */
  const [calcWords, setCalcWords] = useState<string>("500");
  const [calcRate, setCalcRate] = useState<string>("1.0");
  const [calcWpm, setCalcWpm] = useState<string>("150");

  const calcResults = useMemo(() => {
    const words = Math.max(0, parseInt(calcWords, 10) || 0);
    const rate = Math.max(0.1, parseFloat(calcRate) || 1.0);
    const readingWpm = Math.max(10, parseInt(calcWpm, 10) || 200);

    // TTS speech speed (average 150 WPM at 1.0x rate)
    const ttsWpm = 150 * rate;
    const ttsMinutes = words / ttsWpm;
    const ttsSeconds = Math.round(ttsMinutes * 60);

    // Silent reading speed
    const readingMinutes = words / readingWpm;
    const readingSeconds = Math.round(readingMinutes * 60);

    return {
      ttsTime: ttsSeconds,
      readingTime: readingSeconds,
    };
  }, [calcWords, calcRate, calcWpm]);

  /* ------------------------------------------------------------------ */
  /* 2. Dictionary States                                               */
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
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    loadDict();
  }, []);

  const handleAddDictRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dictWord.trim() || !dictReplace.trim()) return;

    const updated = {
      ...dict,
      [dictWord.trim()]: dictReplace.trim(),
    };
    await savePronunciationDict(updated);
    setDict(updated);
    setDictWord("");
    setDictReplace("");
  };

  const handleDeleteDictRule = async (word: string) => {
    const updated = { ...dict };
    delete updated[word];
    await savePronunciationDict(updated);
    setDict(updated);
  };

  const filteredDict = useMemo(() => {
    if (!dictSearch.trim()) return Object.entries(dict);
    const query = dictSearch.toLowerCase();
    return Object.entries(dict).filter(
      ([word, replace]) => 
        word.toLowerCase().includes(query) || replace.toLowerCase().includes(query)
    );
  }, [dict, dictSearch]);

  /* ------------------------------------------------------------------ */
  /* 3. Script Timer States                                             */
  /* ------------------------------------------------------------------ */
  const [timerScript, setTimerScript] = useState("");
  const [timerWpmPreset, setTimerWpmPreset] = useState<"130" | "150" | "170">("150");
  const [timerTargetSeconds, setTimerTargetSeconds] = useState("60");

  const timerStats = useMemo(() => {
    const words = timerScript.trim().split(/\s+/).filter(Boolean).length;
    const wpm = parseInt(timerWpmPreset, 10);
    const estSeconds = Math.round((words / wpm) * 60);
    const target = parseInt(timerTargetSeconds, 10) || 60;
    const diff = estSeconds - target;

    return {
      words,
      estSeconds,
      diff,
      exceeds: diff > 0,
    };
  }, [timerScript, timerWpmPreset, timerTargetSeconds]);

  /* ------------------------------------------------------------------ */
  /* 4. Text Cleaner States                                             */
  /* ------------------------------------------------------------------ */
  const [cleanerInput, setCleanerInput] = useState("");
  const [cleanerOutput, setCleanerOutput] = useState("");
  const [copiedCleaner, setCopiedCleaner] = useState(false);

  const handleCleanText = (actions: {
    lines?: boolean;
    spaces?: boolean;
    numbers?: boolean;
    citations?: boolean;
    hyphens?: boolean;
  }) => {
    let text = cleanerInput;

    if (actions.hyphens) {
      // Fix hyphenated line breaks (e.g. read-\ning -> reading)
      text = text.replace(/(\w+)-\s*\n\s*(\w+)/g, "$1$2");
    }

    if (actions.lines) {
      // Remove double blank lines/multiple breaks
      text = text.replace(/\n{3,}/g, "\n\n");
    }

    if (actions.spaces) {
      // Clean multiple consecutive spaces
      text = text.replace(/[ \t]+/g, " ");
    }

    if (actions.citations) {
      // Strip citations like [1] or [citation needed]
      text = text.replace(/\[\d+\]|\[citation needed\]/gi, "");
    }

    if (actions.numbers) {
      // Expand numbers to text using the local numbers expander
      text = expandNumbers(text);
    }

    setCleanerOutput(text.trim());
  };

  const handleCopyCleaner = () => {
    navigator.clipboard.writeText(cleanerOutput);
    setCopiedCleaner(true);
    setTimeout(() => setCopiedCleaner(false), 2000);
  };

  const handleSendCleanerToWorkspace = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("vk-stash", cleanerOutput);
      router.push("/tool");
    }
  };

  /* ------------------------------------------------------------------ */
  /* 5. Subtitle Viewer States                                          */
  /* ------------------------------------------------------------------ */
  const [subtitleOutput, setSubtitleOutput] = useState<string>("");

  const handleSubtitleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const parsed = parseSubtitles(text, extension === "vtt" ? "vtt" : "srt");
      setSubtitleOutput(parsed);
    };
    reader.readAsText(file);
  };

  const handleSendSubtitlesToWorkspace = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("vk-stash", subtitleOutput);
      router.push("/tool");
    }
  };

  // Helper function to format duration
  const formatSeconds = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      {/* Header bar */}
      <header className="border-b bg-surface py-6 px-6 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Languages className="h-6 w-6 text-primary" /> Daily-Use Utilities
            </h1>
            <p className="text-xs text-text-muted">A collection of audio, timer, and text helper utilities.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/tool")} title="Back to Workspace">
            <ArrowLeft className="mr-1 h-4 w-4" /> Workspace
          </Button>
        </div>
      </header>

      {/* Main utilities dashboard */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Navigation Selector */}
        <section className="w-full md:w-56 space-y-2 shrink-0">
          {[
            { id: "calc", label: "Speech Calculator", icon: Clock },
            { id: "dict", label: "Pronunciation Dictionary", icon: Languages },
            { id: "timer", label: "Script Timer", icon: Video },
            { id: "cleaner", label: "Text Cleaner", icon: Scissors },
            { id: "subs", label: "Subtitle Reader", icon: Subtitles },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "calc" | "dict" | "timer" | "cleaner" | "subs")}
                className={cn(
                  "w-full text-left rounded-md px-3 py-2.5 text-xs font-semibold flex items-center gap-2 transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-on-primary font-bold"
                    : "text-text hover:bg-surface-sunken"
                )}
              >
                <Icon className="h-4 w-4" /> {tab.label}
              </button>
            );
          })}
        </section>

        {/* Tab Canvas Area */}
        <section className="flex-1 bg-surface border rounded-xl p-6 min-h-0 overflow-y-auto">
          {/* TAB 1: Speech Calculator */}
          {activeTab === "calc" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Reading and Speech Calculator
              </h2>
              <p className="text-xs text-text-muted">Calculate duration estimates for written scripts.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Word Count</label>
                  <input
                    type="number"
                    value={calcWords}
                    onChange={(e) => setCalcWords(e.target.value)}
                    className="w-full rounded border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono"
                    min="1"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Speech Speed Rate</label>
                  <select
                    value={calcRate}
                    onChange={(e) => setCalcRate(e.target.value)}
                    className="w-full rounded border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="0.8">Slow (0.8x)</option>
                    <option value="1.0">Standard (1.0x)</option>
                    <option value="1.2">Fast (1.2x)</option>
                    <option value="1.5">Very Fast (1.5x)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Silent Reading Speed (WPM)</label>
                  <input
                    type="number"
                    value={calcWpm}
                    onChange={(e) => setCalcWpm(e.target.value)}
                    className="w-full rounded border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono"
                    min="50"
                  />
                </div>
              </div>

              {/* Outputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-6">
                <div className="border rounded-xl p-4 bg-background flex flex-col justify-between">
                  <span className="text-xs text-text-muted font-bold block mb-1 uppercase tracking-widest">Spoken Audio Time</span>
                  <span className="text-3xl font-extrabold text-primary font-mono block">
                    {formatSeconds(calcResults.ttsTime)}
                  </span>
                  <span className="text-[10px] text-text-muted mt-2 block">
                    Estimated playback time using text-to-speech engine.
                  </span>
                </div>

                <div className="border rounded-xl p-4 bg-background flex flex-col justify-between">
                  <span className="text-xs text-text-muted font-bold block mb-1 uppercase tracking-widest">Silent Reading Time</span>
                  <span className="text-3xl font-extrabold font-mono block">
                    {formatSeconds(calcResults.readingTime)}
                  </span>
                  <span className="text-[10px] text-text-muted mt-2 block">
                    Estimated time to read silently at {calcWpm} words/min.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Pronunciation Dictionary */}
          {activeTab === "dict" && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Languages className="h-5 w-5 text-primary" /> Pronunciation Dictionary
              </h2>
              <p className="text-xs text-text-muted">Expose custom dictionary replacements inside the text-to-speech engine.</p>

              {/* Add rule */}
              <form onSubmit={handleAddDictRule} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end border-b pb-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Word / Phrase</label>
                  <input
                    type="text"
                    value={dictWord}
                    onChange={(e) => setDictWord(e.target.value)}
                    placeholder="e.g. AI"
                    className="w-full rounded border bg-surface px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Spoken Replacement</label>
                  <input
                    type="text"
                    value={dictReplace}
                    onChange={(e) => setDictReplace(e.target.value)}
                    placeholder="e.g. ay eye"
                    className="w-full rounded border bg-surface px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
                <Button type="submit" size="sm" className="w-full py-2">
                  <Plus className="h-4 w-4 mr-1" /> Add Rule
                </Button>
              </form>

              {/* Dictionary List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-muted">{filteredDict.length} rules defined</span>
                  <input
                    type="search"
                    placeholder="Search rules..."
                    value={dictSearch}
                    onChange={(e) => setDictSearch(e.target.value)}
                    className="border rounded px-2 py-1 text-xs focus:border-primary focus:outline-none"
                  />
                </div>

                {filteredDict.length === 0 ? (
                  <p className="text-xs text-text-muted italic text-center py-10">No matching dictionary rules.</p>
                ) : (
                  <div className="border rounded-lg overflow-hidden divide-y text-xs">
                    {filteredDict.map(([word, replace]) => (
                      <div key={word} className="flex items-center justify-between p-3 bg-surface hover:bg-surface-sunken">
                        <div className="grid grid-cols-2 gap-4 flex-1">
                          <span className="font-bold font-mono">{word}</span>
                          <span className="text-text-muted font-mono">{replace}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteDictRule(word)}
                          className="text-error hover:bg-error/10 h-7 w-7 p-0 shrink-0"
                          title="Delete rule"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Script Timer */}
          {activeTab === "timer" && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" /> Script Timer and Speech Pacing
              </h2>
              <p className="text-xs text-text-muted">Paste your voiceover script to verify timing fits targeted video lengths.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Target Duration (seconds)</label>
                  <input
                    type="number"
                    value={timerTargetSeconds}
                    onChange={(e) => setTimerTargetSeconds(e.target.value)}
                    className="w-full rounded border bg-surface px-3 py-2 text-sm focus:border-primary"
                    min="1"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Speech Profile Preset</label>
                  <select
                    value={timerWpmPreset}
                    onChange={(e) => setTimerWpmPreset(e.target.value as "130" | "150" | "170")}
                    className="w-full rounded border bg-surface px-3 py-2 text-sm focus:border-primary"
                  >
                    <option value="130">Educational / Relaxed (130 WPM)</option>
                    <option value="150">Conversational / News (150 WPM)</option>
                    <option value="170">Fast / Commercials (170 WPM)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted">Script Text</label>
                <textarea
                  value={timerScript}
                  onChange={(e) => setTimerScript(e.target.value)}
                  placeholder="Paste script copy here..."
                  className="w-full rounded border bg-surface px-3 py-2 text-xs focus:border-primary focus:outline-none min-h-[160px] font-sans"
                />
              </div>

              {/* Stats & Threshold Alerts */}
              {timerScript.trim() && (
                <div className="border rounded-xl p-4 bg-background space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-text-muted block uppercase">Words</span>
                      <span className="text-lg font-bold font-mono">{timerStats.words}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted block uppercase">Estimated time</span>
                      <span className={cn(
                        "text-lg font-extrabold font-mono",
                        timerStats.exceeds ? "text-error" : "text-primary"
                      )}>
                        {timerStats.estSeconds}s
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted block uppercase">Limit diff</span>
                      <span className={cn(
                        "text-lg font-bold font-mono",
                        timerStats.diff > 0 ? "text-error" : "text-green-500"
                      )}>
                        {timerStats.diff > 0 ? `+${timerStats.diff}s` : `${timerStats.diff}s`}
                      </span>
                    </div>
                  </div>

                  {timerStats.exceeds && (
                    <div className="bg-error/10 border border-error/20 rounded p-3 flex items-start gap-2 text-xs text-error">
                      <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Script Length Exceeded!</strong>
                        <span>Your script is estimated to be {timerStats.diff} seconds too long for the target of {timerTargetSeconds} seconds. Consider shortening the draft or reading faster.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Text Cleaner */}
          {activeTab === "cleaner" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Scissors className="h-5 w-5 text-primary" /> Text cleaner and sanitizer
              </h2>
              <p className="text-xs text-text-muted">Prepare text from PDFs or web articles to speak more naturally.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Messy / Copied Input</label>
                  <textarea
                    value={cleanerInput}
                    onChange={(e) => setCleanerInput(e.target.value)}
                    placeholder="Paste text containing extra breaks, hyphens, citations, etc..."
                    className="w-full rounded border bg-surface px-3 py-2 text-xs focus:border-primary focus:outline-none min-h-[180px] font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-muted">Cleaned Output</label>
                  <textarea
                    value={cleanerOutput}
                    readOnly
                    placeholder="Cleaned draft will display here..."
                    className="w-full rounded border bg-surface-sunken px-3 py-2 text-xs focus:outline-none min-h-[180px] font-sans select-all"
                  />
                </div>
              </div>

              {/* Cleaner quick actions list */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="ghost" size="sm" className="border text-xs" onClick={() => handleCleanText({ lines: true })}>
                  Normalize Line Breaks
                </Button>
                <Button variant="ghost" size="sm" className="border text-xs" onClick={() => handleCleanText({ spaces: true })}>
                  Clean Double Spaces
                </Button>
                <Button variant="ghost" size="sm" className="border text-xs" onClick={() => handleCleanText({ citations: true })}>
                  Strip Bracket Citations
                </Button>
                <Button variant="ghost" size="sm" className="border text-xs" onClick={() => handleCleanText({ hyphens: true })}>
                  Fix Line hyphens
                </Button>
                <Button variant="ghost" size="sm" className="border text-xs" onClick={() => handleCleanText({ numbers: true })}>
                  Expand Numbers to text
                </Button>
                <Button variant="ghost" size="sm" className="border text-xs" onClick={() => handleCleanText({ lines: true, spaces: true, citations: true, hyphens: true, numbers: true })}>
                  Run All Cleaners
                </Button>
              </div>

              {/* Handoff controls */}
              {cleanerOutput && (
                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button variant="ghost" size="sm" onClick={handleCopyCleaner} className="border text-xs">
                    {copiedCleaner ? <Check className="mr-1 h-3.5 w-3.5 text-green-500" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
                    Copy Clean Text
                  </Button>
                  <Button onClick={handleSendCleanerToWorkspace} size="sm" className="text-xs">
                    Send to Workspace
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Subtitle Reader */}
          {activeTab === "subs" && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Subtitles className="h-5 w-5 text-primary" /> Subtitle SRT/VTT Reader
              </h2>
              <p className="text-xs text-text-muted">Strip timestamps and formatting from subtitle files to get readable script copies.</p>

              <div className="border border-dashed border-border-strong rounded-xl p-8 text-center space-y-4 bg-background">
                <Subtitles className="h-10 w-10 mx-auto text-text-muted animate-pulse" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold">Upload Subtitle File</p>
                  <p className="text-[10px] text-text-muted">Supports .srt and .vtt subtitle formats</p>
                </div>
                <label className="inline-flex items-center justify-center rounded-md font-semibold text-xs border border-border bg-surface hover:bg-surface-sunken h-8 px-4 cursor-pointer select-none">
                  Select Subtitle File
                  <input type="file" accept=".srt,.vtt" onChange={handleSubtitleUpload} className="hidden" />
                </label>
              </div>

              {subtitleOutput && (
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-text-muted uppercase">Parsed Subtitle Script Preview</h4>
                    <Button onClick={handleSendSubtitlesToWorkspace} size="sm" className="text-xs">
                      Send script to Workspace
                    </Button>
                  </div>
                  <textarea
                    value={subtitleOutput}
                    readOnly
                    className="w-full rounded border bg-surface-sunken px-3 py-2 text-xs focus:outline-none min-h-[160px] font-sans"
                  />
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
