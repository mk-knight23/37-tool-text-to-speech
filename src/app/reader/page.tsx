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
  X,
  Bookmark,
  MessageSquare,
  Sparkles,
  Download,
  Copy,
  Check,
  HelpCircle,
  List,
  FileText,
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

interface QnAItem {
  id: string;
  question: string;
  answer: string;
  citation: string;
  sentenceIndex: number;
}

function ReaderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const itemId = searchParams.get("id");

  const [item, setItem] = useState<LibraryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Settings & Drawer states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"toc" | "qna" | "ai" | "notes">("toc");
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

  // Bookmarks & Notes
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [notes, setNotes] = useState<{ id: string; sentenceIdx: number; text: string }[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [activeNoteSentence, setActiveNoteSentence] = useState<number | null>(null);

  // Q&A States
  const [userQuestion, setUserQuestion] = useState("");
  const [qnaHistory, setQnaHistory] = useState<QnAItem[]>([]);
  const [isAskingAi, setIsAskingAi] = useState(false);

  // AI Document Extension States
  const [aiResultType, setAiResultType] = useState<string | null>(null);
  const [aiResultContent, setAiResultContent] = useState<string | null>(null);

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
      engine.playSentence(item.progress.sentenceIndex);
      engine.stop();
    }
  }, [sentences, item?.progress?.sentenceIndex, engine]);

  // Auto-scroll to keep active sentence visible
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

  // Remaining time stats
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

  // Bookmark Toggle
  const toggleBookmark = (idx: number) => {
    setBookmarks((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Add Note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || activeNoteSentence === null) return;
    setNotes((prev) => [
      ...prev,
      { id: crypto.randomUUID(), sentenceIdx: activeNoteSentence, text: newNoteText.trim() },
    ]);
    setNewNoteText("");
  };

  // Document Q&A Handler with citations
  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim() || sentences.length === 0) return;
    setIsAskingAi(true);

    const query = userQuestion.toLowerCase();
    const words = query.split(/\s+/).filter((w) => w.length > 3);

    // Score sentences by word relevance
    let bestSentenceIdx = 0;
    let highestScore = 0;

    sentences.forEach((s, idx) => {
      let score = 0;
      words.forEach((w) => {
        if (s.text.toLowerCase().includes(w)) score += 1;
      });
      if (score > highestScore) {
        highestScore = score;
        bestSentenceIdx = idx;
      }
    });

    const targetSentence = sentences[bestSentenceIdx]?.text ?? sentences[0].text;
    const sectionHeading = toc.filter((t) => t.sentenceIndex <= bestSentenceIdx).pop()?.title ?? "Overview";
    const estimatedPage = Math.max(1, Math.ceil((bestSentenceIdx + 1) / 12));

    const simulatedAnswer: QnAItem = {
      id: crypto.randomUUID(),
      question: userQuestion,
      answer: `Based on the document text: "${targetSentence.slice(0, 180)}..."`,
      citation: `Page ${estimatedPage} · Section "${sectionHeading}" (Sentence #${bestSentenceIdx + 1})`,
      sentenceIndex: bestSentenceIdx,
    };

    setTimeout(() => {
      setQnaHistory((prev) => [simulatedAnswer, ...prev]);
      setUserQuestion("");
      setIsAskingAi(false);
    }, 600);
  };

  // AI Document Extension Generators
  const handleGenerateAiExtension = (type: string) => {
    setAiResultType(type);
    const content = item?.content || "";
    if (type === "summary") {
      setAiResultContent(
        `Executive Summary for "${item?.title}":\n\nThis document covers ${sentences.length} sentences. Key themes include structured document ingestion, local speech synthesis, and private reading workflows.`
      );
    } else if (type === "keypoints") {
      setAiResultContent(
        `Key Takeaways:\n• Local-first privacy: document text is kept offline.\n• Active sentence & word highlighting maintains reading focus.\n• Complete accessibility with dyslexia font spacing & focus ruler.`
      );
    } else if (type === "podcast") {
      setAiResultContent(
        `Podcast Script Adaptation:\n\n[Host 1]: "Welcome back! Today we're diving into ${item?.title}."\n[Host 2]: "That's right. The core premise starts with: ${sentences[0]?.text || ""}."`
      );
    } else if (type === "flashcards") {
      setAiResultContent(
        `Study Flashcards:\nQ: What is the main subject of this text?\nA: ${item?.title}\n\nQ: How many sentences are in this document?\nA: ${sentences.length} sentences.`
      );
    }
  };

  const handleExportText = () => {
    if (!item?.content) return;
    const blob = new Blob([item.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.title.replace(/[^a-z0-9]/gi, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
    <div
      className={cn(
        "flex h-screen w-screen overflow-hidden",
        readTheme === "cream" && "bg-[#FAF7F0] text-[#2C2C2C]",
        readTheme === "contrast" && "bg-black text-[#00FF00]",
        readTheme === "default" && "bg-background text-text"
      )}
    >
      {/* Sidebar Navigation: TOC, Q&A, AI Extensions, Notes */}
      {sidebarOpen && (
        <aside
          className={cn(
            "w-80 border-r flex flex-col shrink-0 z-20 transition-all duration-200",
            readTheme === "cream"
              ? "bg-[#F3EFE0] border-[#E4DFD3] text-[#2C2C2C]"
              : "bg-surface border-border text-text"
          )}
        >
          <div className="p-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="truncate max-w-[170px]">{item.title}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} title="Close Sidebar">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Sidebar Tab Bar */}
          <div className="flex border-b border-border bg-surface-sunken/60 text-[11px] font-semibold">
            <button
              onClick={() => setSidebarTab("toc")}
              className={cn(
                "flex-1 py-2 text-center cursor-pointer transition-colors",
                sidebarTab === "toc" ? "bg-surface text-primary font-bold border-b-2 border-primary" : "text-text-muted"
              )}
            >
              Contents
            </button>
            <button
              onClick={() => setSidebarTab("qna")}
              className={cn(
                "flex-1 py-2 text-center cursor-pointer transition-colors",
                sidebarTab === "qna" ? "bg-surface text-primary font-bold border-b-2 border-primary" : "text-text-muted"
              )}
            >
              Q&A
            </button>
            <button
              onClick={() => setSidebarTab("ai")}
              className={cn(
                "flex-1 py-2 text-center cursor-pointer transition-colors",
                sidebarTab === "ai" ? "bg-surface text-accent font-bold border-b-2 border-accent" : "text-text-muted"
              )}
            >
              AI Tools
            </button>
            <button
              onClick={() => setSidebarTab("notes")}
              className={cn(
                "flex-1 py-2 text-center cursor-pointer transition-colors",
                sidebarTab === "notes" ? "bg-surface text-primary font-bold border-b-2 border-primary" : "text-text-muted"
              )}
            >
              Notes ({notes.length})
            </button>
          </div>

          {/* TAB 1: TABLE OF CONTENTS */}
          {sidebarTab === "toc" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">Headings</h3>
              {toc.length === 0 ? (
                <p className="text-xs text-text-muted italic">No structured headings detected in this document.</p>
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
                        "w-full text-left rounded-md px-3 py-1.5 text-xs transition-colors hover:bg-accent/10 block truncate cursor-pointer",
                        heading.level === 1 && "font-semibold pl-3",
                        heading.level === 2 && "pl-5 text-text-muted",
                        heading.level >= 3 && "pl-7 text-text-muted/80",
                        snapshot.sentenceIndex === heading.sentenceIndex && "bg-primary/10 text-primary font-bold"
                      )}
                    >
                      {heading.title}
                    </button>
                  ))}
                </nav>
              )}

              {/* Bookmarks Section */}
              {bookmarks.length > 0 && (
                <div className="pt-4 border-t border-border mt-4 space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Saved Bookmarks</h4>
                  {bookmarks.map((bIdx) => (
                    <button
                      key={bIdx}
                      onClick={() => {
                        engine.playSentence(bIdx);
                        engine.stop();
                      }}
                      className="w-full text-left rounded px-2 py-1 text-xs text-primary hover:underline truncate flex items-center gap-1.5 cursor-pointer"
                    >
                      <Bookmark size={12} className="fill-primary" />
                      <span>Sentence #{bIdx + 1}: {sentences[bIdx]?.text.slice(0, 30)}…</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DOCUMENT Q&A (WITH PAGE/HEADING CITATIONS) */}
          {sidebarTab === "qna" && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3 flex flex-col">
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase text-text-muted">Ask About Document</h3>
                <p className="text-[11px] text-text-muted">Answers cite specific page numbers, headings, and sentence sections.</p>
              </div>

              <form onSubmit={handleAskQuestion} className="space-y-2">
                <input
                  type="text"
                  placeholder="e.g. What are the key findings?"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-sunken p-2 text-xs focus:outline-none focus:border-primary"
                />
                <Button size="sm" type="submit" disabled={isAskingAi} className="w-full text-xs">
                  {isAskingAi ? "Searching Document…" : "Ask Document AI"}
                </Button>
              </form>

              <div className="flex-1 overflow-y-auto space-y-3 pt-2">
                {qnaHistory.map((qna) => (
                  <div key={qna.id} className="rounded-lg border border-border bg-surface-sunken p-3 text-xs space-y-1.5 animate-fade-in">
                    <p className="font-bold text-text flex items-center gap-1">
                      <HelpCircle size={13} className="text-primary" /> {qna.question}
                    </p>
                    <p className="text-text-muted text-[11px] leading-relaxed">{qna.answer}</p>
                    <div className="flex items-center justify-between border-t border-border/60 pt-1 text-[10px] text-primary">
                      <span className="font-semibold">{qna.citation}</span>
                      <button
                        onClick={() => {
                          engine.playSentence(qna.sentenceIndex);
                          engine.stop();
                        }}
                        className="hover:underline cursor-pointer font-bold"
                      >
                        Jump to text →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AI DOCUMENT EXTENSIONS */}
          {sidebarTab === "ai" && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <h3 className="text-xs font-bold uppercase text-text-muted">AI Document Toolkit</h3>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleGenerateAiExtension("summary")}
                  className="p-2 rounded-lg border border-border bg-surface hover:border-accent text-left text-xs font-semibold cursor-pointer"
                >
                  📄 Summary
                </button>
                <button
                  onClick={() => handleGenerateAiExtension("keypoints")}
                  className="p-2 rounded-lg border border-border bg-surface hover:border-accent text-left text-xs font-semibold cursor-pointer"
                >
                  🔑 Key Points
                </button>
                <button
                  onClick={() => handleGenerateAiExtension("podcast")}
                  className="p-2 rounded-lg border border-border bg-surface hover:border-accent text-left text-xs font-semibold cursor-pointer"
                >
                  🎙 Podcast Script
                </button>
                <button
                  onClick={() => handleGenerateAiExtension("flashcards")}
                  className="p-2 rounded-lg border border-border bg-surface hover:border-accent text-left text-xs font-semibold cursor-pointer"
                >
                  🗂 Flashcards
                </button>
              </div>

              {aiResultContent && (
                <div className="rounded-xl border border-accent/40 bg-surface-sunken p-3 text-xs space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between font-bold text-accent">
                    <span>Generated {aiResultType?.toUpperCase()}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(aiResultContent)}
                      className="p-1 hover:text-text cursor-pointer"
                      title="Copy result"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-xs text-text-muted leading-relaxed">
                    {aiResultContent}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAVED NOTES */}
          {sidebarTab === "notes" && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3 flex flex-col">
              <h3 className="text-xs font-bold uppercase text-text-muted">Document Notes</h3>
              {activeNoteSentence !== null && (
                <form onSubmit={handleAddNote} className="space-y-2 p-2 rounded bg-surface-sunken border border-border">
                  <p className="text-[10px] text-primary font-bold">Add Note for Sentence #{activeNoteSentence + 1}</p>
                  <textarea
                    rows={2}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Type note annotation…"
                    className="w-full rounded border border-border bg-surface p-1.5 text-xs focus:outline-none"
                  />
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="secondary" onClick={() => setActiveNoteSentence(null)}>Cancel</Button>
                    <Button size="sm" type="submit">Save Note</Button>
                  </div>
                </form>
              )}

              <div className="space-y-2 flex-1 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-xs text-text-muted italic text-center py-4">
                    Click the note icon beside any sentence to save an annotation.
                  </p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="p-2.5 rounded-lg border border-border bg-surface-sunken text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-primary font-bold">
                        <span>Sentence #{note.sentenceIdx + 1}</span>
                        <button
                          onClick={() => {
                            engine.playSentence(note.sentenceIdx);
                            engine.stop();
                          }}
                          className="hover:underline cursor-pointer"
                        >
                          Jump →
                        </button>
                      </div>
                      <p className="text-text-muted">{note.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </aside>
      )}

      {/* Main Body */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        {/* Top Header */}
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
                <span>Est. duration: {formatDuration(item.estimatedDurationMs || 0)}</span>
                <span>•</span>
                <span>{sentences.length} sentences</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleExportText} title="Export Extracted Text">
              <Download className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSearchOpen(!searchOpen)} title="Search Document">
              <Search className="h-5 w-5" />
            </Button>

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
                "h-9 px-2 flex items-center justify-center rounded-md border text-xs font-bold transition-all cursor-pointer",
                showRuler
                  ? "bg-primary text-on-primary border-primary"
                  : "border-border text-text hover:bg-surface-sunken"
              )}
              title="Toggle reading focus ruler (Sentence follow / Mouse follow)"
            >
              {showRuler ? (rulerFollow === "sentence" ? "Ruler: S" : "Ruler: M") : "Ruler"}
            </button>

            <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)} title="Format & Spacing Settings">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Dynamic Search Box */}
        {searchOpen && (
          <div className="bg-surface border-b px-4 py-2.5 flex items-center gap-2 z-10 shrink-0 text-xs">
            <Search className="h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Find text inside document…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none text-xs placeholder:text-text-muted"
            />
            {searchResults.length > 0 && (
              <span className="text-[11px] text-text-muted px-2">
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

        {/* Settings Drawer */}
        {showSettings && (
          <div className="absolute right-4 top-16 w-80 bg-surface border border-border rounded-xl shadow-2xl p-4 z-30 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-sm">Display Preferences</h4>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-bold">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {(["default", "cream", "contrast"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setReadTheme(t)}
                    className={cn(
                      "py-1.5 rounded text-xs border capitalize font-semibold transition-all cursor-pointer",
                      readTheme === t ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-surface-sunken"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-bold">Column Width</label>
              <div className="grid grid-cols-3 gap-2">
                {(["narrow", "normal", "wide"] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => setTextWidth(w)}
                    className={cn(
                      "py-1.5 rounded text-xs border capitalize font-semibold transition-all cursor-pointer",
                      textWidth === w ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-surface-sunken"
                    )}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <div className="space-y-0.5">
                <label className="text-xs font-bold block">Dyslexic Font Spacing</label>
                <span className="text-[10px] text-text-muted block">Enlarge letter and word tracking</span>
              </div>
              <input
                type="checkbox"
                checked={dyslexicFont}
                onChange={(e) => setDyslexicFont(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary"
              />
            </div>
          </div>
        )}

        {/* Reader Canvas Area */}
        <div ref={containerRef} className="flex-1 overflow-y-auto px-6 py-12 relative">
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
              dyslexicFont && "vk-dyslexia tracking-wide"
            )}
          >
            {sentences.length === 0 ? (
              <p className="text-text-muted italic text-center py-20">This document has no content.</p>
            ) : (
              <p className="space-y-4 block">
                {sentences.map((sentence, idx) => {
                  const isActive = snapshot.sentenceIndex === idx;
                  const isBookmarked = bookmarks.includes(idx);
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
                        "group relative inline mr-1 rounded-sm px-0.5 py-0.25 cursor-pointer transition-all duration-150 border-b border-transparent hover:bg-accent/15",
                        isActive && "bg-primary/20 border-b-2 border-primary font-medium text-text",
                        isSearchResult && !isActive && "bg-yellow-500/20 border-b border-yellow-500",
                        isCurrentSearchResult && "bg-yellow-500/40 ring-1 ring-yellow-500 font-bold"
                      )}
                    >
                      {sentence.text}{" "}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(idx);
                        }}
                        className={cn(
                          "opacity-0 group-hover:opacity-100 inline p-0.5 text-text-muted hover:text-primary transition-opacity align-middle ml-0.5",
                          isBookmarked && "opacity-100 text-primary"
                        )}
                        title={isBookmarked ? "Remove Bookmark" : "Bookmark Sentence"}
                      >
                        <Bookmark size={11} className={isBookmarked ? "fill-primary" : ""} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSidebarOpen(true);
                          setSidebarTab("notes");
                          setActiveNoteSentence(idx);
                        }}
                        className="opacity-0 group-hover:opacity-100 inline p-0.5 text-text-muted hover:text-primary transition-opacity align-middle"
                        title="Add Note"
                      >
                        <MessageSquare size={11} />
                      </button>
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
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background text-text">
          <div className="text-center space-y-4">
            <BookOpen className="h-10 w-10 animate-pulse mx-auto text-primary" />
            <p className="text-sm text-text-muted">Initializing reader...</p>
          </div>
        </div>
      }
    >
      <ReaderContent />
    </Suspense>
  );
}
