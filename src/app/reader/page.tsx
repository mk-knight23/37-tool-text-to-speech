"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useState, useRef, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  BookOpen, 
  Menu, 
  Search, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  X
} from "lucide-react";
import { getLibraryItem, saveLibraryItem, type LibraryItem } from "@/lib/storage";
import { useSpeechEngine } from "@/hooks/useSpeechEngine";
import { useVoices } from "@/hooks/useVoices";
import { usePrefs } from "@/hooks/usePrefs";
import { segmentText } from "@/lib/speech/segment";
import { ReadingRuler } from "@/components/workspace/ReadingRuler";
import { PlaybackBar } from "@/components/workspace/PlaybackBar";
import { Slider } from "@/components/workspace/Slider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format";

function ReaderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const itemId = searchParams.get("id");

  const [item, setItem] = useState<LibraryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Settings states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

  // Reading styling configurations
  const [readTheme, setReadTheme] = useState<"default" | "cream" | "contrast">("default");
  const [textWidth, setTextWidth] = useState<"narrow" | "normal" | "wide">("normal");
  const [lineSpacing, setLineSpacing] = useState<"normal" | "relaxed" | "double">("relaxed");
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("lg");
  const [dyslexicFont, setDyslexicFont] = useState(false);

  // Ruler overlay states
  const [showRuler, setShowRuler] = useState(false);
  const [rulerFollow, setRulerFollow] = useState<"cursor" | "sentence">("sentence");

  // Speech parameters
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Speech States
  const { engine, snapshot } = useSpeechEngine();
  const { voices } = useVoices();
  const { prefs, update: updatePrefs } = usePrefs();

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Load document
  useEffect(() => {
    if (!itemId) {
      setError("No document ID provided. Please select a file from the Library.");
      setLoading(false);
      return;
    }

    async function loadItem() {
      try {
        const doc = await getLibraryItem(itemId!);
        if (!doc) {
          setError("Document not found in the Library.");
        } else {
          setItem(doc);
          if (doc.progress?.sentenceIndex) {
            engine.playSentence(doc.progress.sentenceIndex);
            engine.stop();
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg || "Failed to load document.");
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [itemId, engine]);

  // Sync preferences
  useEffect(() => {
    if (prefs) {
      setRate(prefs.defaultRate);
      setPitch(prefs.defaultPitch);
      setVolume(prefs.defaultVolume);
      if (prefs.lastVoiceURI) {
        const v = voices.find((x) => x.voiceURI === prefs.lastVoiceURI);
        if (v) setSelectedVoice(v);
      }
    }
  }, [prefs, voices]);

  // Sync settings with speech engine
  useEffect(() => {
    engine.setSettings({
      voice: selectedVoice,
      rate,
      pitch,
      volume,
    });
  }, [engine, selectedVoice, rate, pitch, volume]);

  // Segment sentences
  const segmentation = useMemo(() => {
    if (!item?.content) return { sentences: [], paragraphs: [] };
    return segmentText(item.content);
  }, [item]);

  const sentences = segmentation.sentences;

  // Sync sentence index changes to IndexedDB to track progress
  useEffect(() => {
    if (!item || snapshot.sentenceIndex < 0) return;
    
    const timer = setTimeout(async () => {
      const updated: LibraryItem = {
        ...item,
        progress: {
          sentenceIndex: snapshot.sentenceIndex,
          scrollOffset: containerRef.current?.scrollTop || 0,
        },
        updatedAt: Date.now(),
      };
      await saveLibraryItem(updated);
      setItem(updated);
    }, 1000);

    return () => clearTimeout(timer);
  }, [snapshot.sentenceIndex, item]);

  // Prepare text for speech engine
  useEffect(() => {
    if (sentences.length === 0) return;
    engine.setSentences(sentences);
    if (item?.progress?.sentenceIndex) {
      // Just align the active index without playing
      engine.playSentence(item.progress.sentenceIndex);
      engine.stop();
    }
  }, [sentences, item?.progress?.sentenceIndex, engine]);

  // Handle auto-scroll to keep active sentence visible
  useEffect(() => {
    if (snapshot.sentenceIndex < 0 || !containerRef.current) return;
    const activeEl = containerRef.current.querySelector(
      `[data-sentence-index="${snapshot.sentenceIndex}"]`
    );
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [snapshot.sentenceIndex]);

  // Est. remaining time
  const remainingStats = useMemo(() => {
    if (sentences.length === 0) return { percent: 0, timeRemaining: 0 };
    const currentIndex = Math.max(0, snapshot.sentenceIndex);
    const remainingSentences = sentences.slice(currentIndex);
    const textRemaining = remainingSentences.map((s) => s.text).join(" ");
    const wordsRemaining = textRemaining.split(/\s+/).filter(Boolean).length;
    
    const wpm = 150 * rate;
    const timeRemainingMs = (wordsRemaining / wpm) * 60 * 1000;
    const percent = Math.min(100, Math.round((currentIndex / sentences.length) * 100));
    
    return {
      percent,
      timeRemaining: timeRemainingMs,
    };
  }, [sentences, snapshot.sentenceIndex, rate]);

  // TOC mappings
  const toc = useMemo(() => {
    if (!item?.headings || sentences.length === 0) return [];
    
    // Find closest sentence index for heading charIndex
    return item.headings.map((h) => {
      let bestIndex = 0;
      let minDiff = Infinity;
      for (let idx = 0; idx < sentences.length; idx++) {
        const diff = Math.abs(sentences[idx].start - h.charIndex);
        if (diff < minDiff) {
          minDiff = diff;
          bestIndex = idx;
        }
      }
      return {
        title: h.title,
        level: h.level,
        sentenceIndex: bestIndex,
      };
    });
  }, [item, sentences]);

  // Search inside document
  useEffect(() => {
    if (!searchQuery.trim() || sentences.length === 0) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const matches: number[] = [];
    sentences.forEach((sentence, idx) => {
      if (sentence.text.toLowerCase().includes(query)) {
        matches.push(idx);
      }
    });
    setSearchResults(matches);
    setCurrentSearchIndex(0);

    if (matches.length > 0) {
      engine.playSentence(matches[0]);
      engine.stop();
    }
  }, [searchQuery, sentences, engine]);

  const handleNextSearch = () => {
    if (searchResults.length === 0) return;
    const nextIdx = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIdx);
    engine.playSentence(searchResults[nextIdx]);
    engine.stop();
  };

  const handlePrevSearch = () => {
    if (searchResults.length === 0) return;
    const prevIdx = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentSearchIndex(prevIdx);
    engine.playSentence(searchResults[prevIdx]);
    engine.stop();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-text">
        <div className="text-center space-y-4">
          <BookOpen className="h-10 w-10 animate-pulse mx-auto text-primary" />
          <p className="text-sm text-text-muted">Loading your document...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-text px-4">
        <div className="max-w-md text-center space-y-6">
          <BookOpen className="h-16 w-16 mx-auto text-error" />
          <h2 className="text-xl font-bold">Failed to Load</h2>
          <p className="text-sm text-text-muted">{error || "An unexpected error occurred."}</p>
          <Button onClick={() => router.push("/library")} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex h-screen w-screen overflow-hidden",
      readTheme === "cream" && "bg-[#FAF7F0] text-[#2C2C2C]",
      readTheme === "contrast" && "bg-black text-[#00FF00]",
      readTheme === "default" && "bg-background text-text"
    )}>
      {/* Sidebar - TOC / Headings */}
      {sidebarOpen && (
        <aside className={cn(
          "w-80 border-r flex flex-col shrink-0 z-20 transition-all duration-200",
          readTheme === "cream" ? "bg-[#F3EFE0] border-[#E4DFD3] text-[#2C2C2C]" : "bg-surface border-border text-text"
        )}>
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="truncate max-w-[160px]">{item.title}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} title="Close Sidebar">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Table of Contents</h3>
            {toc.length === 0 ? (
              <p className="text-xs text-text-muted italic">No headings found in this document.</p>
            ) : (
              <nav className="space-y-1">
                {toc.map((heading, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      engine.playSentence(heading.sentenceIndex);
                      engine.stop();
                    }}
                    className={cn(
                      "w-full text-left rounded-md px-3 py-2 text-xs transition-colors hover:bg-accent/10 block truncate",
                      heading.level === 1 && "font-semibold pl-3",
                      heading.level === 2 && "pl-5 text-text-muted",
                      heading.level >= 3 && "pl-8 text-text-muted/80",
                      snapshot.sentenceIndex === heading.sentenceIndex && "bg-primary/10 text-primary font-bold"
                    )}
                  >
                    {heading.title}
                  </button>
                ))}
              </nav>
            )}
          </div>
        </aside>
      )}

      {/* Main Body */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        {/* Reader Top bar */}
        <header className="h-14 border-b flex items-center justify-between px-4 bg-surface/50 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} title="Open Sidebar">
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => router.push("/library")} title="Back to Library">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="hidden sm:block">
              <h1 className="font-bold text-sm max-w-[200px] truncate md:max-w-md">{item.title}</h1>
              <p className="text-[10px] text-text-muted flex items-center gap-1">
                <span>Estimated duration: {formatDuration(item.estimatedDurationMs || 0)}</span>
                <span>•</span>
                <span>{sentences.length} sentences</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Toggle */}
            <Button variant="ghost" size="sm" onClick={() => setSearchOpen(!searchOpen)} title="Search Document">
              <Search className="h-5 w-5" />
            </Button>

            {/* Spacing Ruler Toggle */}
            <button
              onClick={() => {
                if (!showRuler) {
                  setShowRuler(true);
                  setRulerFollow("sentence");
                } else if (rulerFollow === "sentence") {
                  setRulerFollow("cursor");
                } else {
                  setShowRuler(false);
                }
              }}
              className={cn(
                "h-9 w-9 flex items-center justify-center rounded-md border text-xs font-bold transition-all",
                showRuler
                  ? "bg-primary text-on-primary border-primary"
                  : "border-border-strong text-text hover:bg-surface-sunken"
              )}
              title="Toggle reading focus ruler (Sentence follow / Mouse follow)"
            >
              {showRuler ? (rulerFollow === "sentence" ? "R:S" : "R:M") : "Ruler"}
            </button>

            {/* Settings Toggle */}
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)} title="Format & Spacing Settings">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Dynamic Search Box */}
        {searchOpen && (
          <div className="bg-surface border-b px-4 py-3 flex items-center gap-2 z-10 shrink-0">
            <Search className="h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Find text inside document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none text-sm placeholder:text-text-muted"
            />
            {searchResults.length > 0 && (
              <span className="text-xs text-text-muted px-2">
                {currentSearchIndex + 1} of {searchResults.length}
              </span>
            )}
            <Button variant="ghost" size="sm" disabled={searchResults.length === 0} onClick={handlePrevSearch}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" disabled={searchResults.length === 0} onClick={handleNextSearch}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Floating Settings Drawer */}
        {showSettings && (
          <div className="absolute right-4 top-16 w-80 bg-surface border rounded-xl shadow-2xl p-4 z-30 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-sm">Display Preferences</h4>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Reading themes */}
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-bold">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {(["default", "cream", "contrast"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setReadTheme(t)}
                    className={cn(
                      "py-1.5 rounded text-xs border capitalize font-semibold transition-all",
                      readTheme === t ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-surface-sunken"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Width */}
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-bold">Column Width</label>
              <div className="grid grid-cols-3 gap-2">
                {(["narrow", "normal", "wide"] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => setTextWidth(w)}
                    className={cn(
                      "py-1.5 rounded text-xs border capitalize font-semibold transition-all",
                      textWidth === w ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-surface-sunken"
                    )}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-bold">Font Size</label>
              <div className="grid grid-cols-4 gap-2">
                {(["sm", "base", "lg", "xl"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={cn(
                      "py-1 rounded text-xs border uppercase font-semibold transition-all",
                      fontSize === size ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-surface-sunken"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Line spacing */}
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-bold">Line Spacing</label>
              <div className="grid grid-cols-3 gap-2">
                {(["normal", "relaxed", "double"] as const).map((space) => (
                  <button
                    key={space}
                    onClick={() => setLineSpacing(space)}
                    className={cn(
                      "py-1.5 rounded text-xs border capitalize font-semibold transition-all",
                      lineSpacing === space ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-surface-sunken"
                    )}
                  >
                    {space}
                  </button>
                ))}
              </div>
            </div>

            {/* Dyslexic spacing toggle */}
            <div className="flex items-center justify-between border-t pt-3">
              <div className="space-y-0.5">
                <label className="text-xs font-bold block">Dyslexic Font Spacing</label>
                <span className="text-[10px] text-text-muted block">Enlarge letter and word tracking</span>
              </div>
              <input
                type="checkbox"
                checked={dyslexicFont}
                onChange={(e) => setDyslexicFont(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* Reader Canvas Area */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto px-6 py-12 relative"
        >
          {/* Spacing Ruler Overlay */}
          <ReadingRuler
            show={showRuler}
            followMode={rulerFollow}
            activeIndex={snapshot.sentenceIndex}
            containerRef={containerRef}
          />

          <div 
            ref={contentRef}
            className={cn(
              "mx-auto transition-all duration-200 selection:bg-primary/20",
              textWidth === "narrow" && "max-w-xl",
              textWidth === "normal" && "max-w-3xl",
              textWidth === "wide" && "max-w-5xl",
              fontSize === "sm" && "text-sm",
              fontSize === "base" && "text-base",
              fontSize === "lg" && "text-lg",
              fontSize === "xl" && "text-xl",
              lineSpacing === "normal" && "leading-normal",
              lineSpacing === "relaxed" && "leading-relaxed",
              lineSpacing === "double" && "leading-loose",
              dyslexicFont && "dyslexia-mode"
            )}
          >
            {/* Render sentences */}
            {sentences.length === 0 ? (
              <p className="text-text-muted italic text-center py-20">This document has no content.</p>
            ) : (
              <p className="space-y-4 block">
                {sentences.map((sentence, idx) => {
                  const isActive = snapshot.sentenceIndex === idx;
                  const isSearchResult = searchResults.includes(idx);
                  const isCurrentSearchResult = isSearchResult && searchResults[currentSearchIndex] === idx;
                  
                  return (
                    <span
                      key={idx}
                      data-sentence-index={idx}
                      onClick={() => {
                        engine.playSentence(idx);
                        engine.stop();
                      }}
                      className={cn(
                        "inline mr-1 rounded-sm px-0.5 py-0.25 cursor-pointer transition-all duration-150 border-b border-transparent hover:bg-accent/15",
                        isActive && "bg-primary/20 border-b-2 border-primary font-medium text-text",
                        isSearchResult && !isActive && "bg-yellow-500/20 border-b border-yellow-500",
                        isCurrentSearchResult && "bg-yellow-500/40 ring-1 ring-yellow-500 font-bold"
                      )}
                    >
                      {sentence.text}{" "}
                    </span>
                  );
                })}
              </p>
            )}
          </div>
        </div>

        {/* Reader Footer Controls */}
        <footer className="shrink-0 border-t bg-surface/85 backdrop-blur-md p-4 space-y-3 z-10">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <div className="flex items-center gap-1">
              <span>{remainingStats.percent}% complete</span>
              <span>•</span>
              <span>{formatDuration(remainingStats.timeRemaining)} remaining</span>
            </div>
            <div>
              <span>Sentence {snapshot.sentenceIndex + 1} of {sentences.length}</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <PlaybackBar
              status={snapshot.status}
              sentenceIndex={snapshot.sentenceIndex}
              totalSentences={snapshot.totalSentences}
              disabled={sentences.length === 0}
              autoScroll={prefs.autoScroll}
              onToggle={() => engine.toggle()}
              onStop={() => engine.stop()}
              onPrevSentence={() => engine.prevSentence()}
              onNextSentence={() => engine.nextSentence()}
              onPrevParagraph={() => engine.prevParagraph()}
              onNextParagraph={() => engine.nextParagraph()}
              onToggleAutoScroll={() => updatePrefs({ autoScroll: !prefs.autoScroll })}
              onReplay={() => {
                const current = snapshot.sentenceIndex;
                if (current >= 0) {
                  engine.playSentence(current);
                } else {
                  engine.playSentence(0);
                }
              }}
            />

            <div className="flex items-center gap-4 self-end md:self-auto">
              <div className="w-40 shrink-0">
                <Slider
                  id="reader-speech-rate"
                  label="Speed"
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  largeStep={0.5}
                  value={rate}
                  defaultValue={1.0}
                  onChange={(val: number) => {
                    setRate(val);
                    engine.setSettings({
                      voice: selectedVoice,
                      rate: val,
                      pitch,
                      volume,
                    });
                  }}
                  format={(v) => `${v.toFixed(1)}×`}
                  formatAria={(v) => `${v} times speed`}
                />
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function ReaderPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background text-text">
        <div className="text-center space-y-4">
          <BookOpen className="h-10 w-10 animate-pulse mx-auto text-primary" />
          <p className="text-sm text-text-muted">Initializing reader...</p>
        </div>
      </div>
    }>
      <ReaderContent />
    </Suspense>
  );
}
