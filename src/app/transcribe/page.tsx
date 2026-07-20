"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { getProviderByokKey } from "@/lib/storage";
import {
  Mic,
  Square,
  Upload,
  Volume2,
  Trash2,
  Download,
  Copy,
  Check,
  Globe,
  Sparkles,
  RefreshCw,
  FolderOpen
} from "lucide-react";

interface TranscriptSegment {
  id: number;
  start: number; // in seconds
  end: number; // in seconds
  speaker: string;
  text: string;
}

export default function TranscribePage() {
  // Navigation & View Toggles
  const [sourceMode, setSourceMode] = useState<"mic" | "upload">("mic");
  const [engineMode, setEngineMode] = useState<"local" | "whisper">("local");

  // State: Mic Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

  // State: File Uploads
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  // State: Transcripts
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // State: Assisted Dubbing & Translation
  const [targetLang, setTargetLang] = useState("es");
  const [isTranslating, setIsTranslating] = useState(false);

  // Web Audio Visualizer Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Dictation API Refs
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const recognitionRef = useRef<any>(null);

  // 1. Live Visual Waveform Drawing
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const analyser = analyserRef.current;
    if (!ctx || !analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "rgb(15, 23, 42)"; // slate-900 background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgb(139, 92, 246)"; // violet-500 line
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  }, []);

  // Cleanup Visualizer & Timer
  const cleanupRecording = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // 2. Start Microphone Audio Capture
  const startRecording = async () => {
    setErrorMsg(null);
    setRecordedBlob(null);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      // Setup audio analyzer for waveform
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      audioContextRef.current = audioCtx;

      // Start rendering canvas loop
      drawWaveform();

      // Configure Media Recorder
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);

      // Start timer
      setRecordingDuration(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // WebSpeech Native Recognition fallback
      if (engineMode === "local") {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRec) {
          const rec = new SpeechRec();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = "en-US";

          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          rec.onresult = (event: any) => {
            let final = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                final += event.results[i][0].transcript;
              }
            }
            if (final) {
              setSegments((prev) => {
                const lastId = prev.length > 0 ? prev[prev.length - 1].id : -1;
                return [
                  ...prev,
                  {
                    id: lastId + 1,
                    start: recordingDuration,
                    end: recordingDuration + 3,
                    speaker: "You (Mic)",
                    text: final.trim()
                  }
                ];
              });
            }
          };

          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          rec.onerror = (e: any) => {
            console.error("Local speech recognition error", e);
          };

          recognitionRef.current = rec;
          rec.start();
        }
      }

    } catch (e: unknown) {
      console.error(e);
      setErrorMsg("Failed to access microphone. Please check permissions.");
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    cleanupRecording();
  };

  // 3. Audio File Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg("File size limits exceeded (25MB max).");
      return;
    }

    setUploadedFile(file);
    if (uploadedUrl) URL.revokeObjectURL(uploadedUrl);
    setUploadedUrl(URL.createObjectURL(file));
  };

  // 4. Remote Whisper Transcription Request
  const runWhisperTranscription = async () => {
    setErrorMsg(null);
    const fileToTranscribe = sourceMode === "mic" ? recordedBlob : uploadedFile;
    if (!fileToTranscribe) {
      setErrorMsg("Please upload a file or record audio first.");
      return;
    }

    setIsTranscribing(true);

    try {
      const apiKey = await getProviderByokKey("openai");
      const form = new FormData();
      
      // Ensure file param matches standard structure
      const actualFile = fileToTranscribe instanceof File 
        ? fileToTranscribe 
        : new File([fileToTranscribe], "record.webm", { type: "audio/webm" });

      form.append("file", actualFile);

      const headers: Record<string, string> = {};
      if (apiKey) {
        headers["x-byok-key"] = apiKey;
      }

      const res = await fetch("/api/ai/transcribe", {
        method: "POST",
        headers,
        body: form
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || "Transcription failed.");
      }

      const body = await res.json();
      setSegments(body.segments || []);

    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrorMsg(msg || "An unexpected error occurred during transcription.");
    } finally {
      setIsTranscribing(false);
    }
  };

  // 5. Utility: Quick Transcript Cleaning
  const cleanTranscriptText = () => {
    setSegments((prev) =>
      prev.map((seg) => {
        // Strip filler words: um, uh, like, you know, etc.
        const cleaned = seg.text
          .replace(/\b(um|uh|like|you know|err|ah|so)\b/gi, "")
          .replace(/\s+/g, " ")
          .trim();
        return { ...seg, text: cleaned };
      })
    );
  };

  // 6. Utility: Export Transcript
  const downloadTranscript = (type: "txt" | "md" | "json") => {
    let content = "";
    if (type === "txt") {
      content = segments.map((s) => `[${formatTime(s.start)}] ${s.speaker}: ${s.text}`).join("\n");
    } else if (type === "md") {
      content = `# Transcription Report\n\n` + 
        segments.map((s) => `* **[${formatTime(s.start)}] ${s.speaker}**: ${s.text}`).join("\n\n");
    } else {
      content = JSON.stringify(segments, null, 2);
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transcript.${type}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Utility: Copy to Clipboard
  const copyToClipboard = () => {
    const text = segments.map((s) => `[${formatTime(s.start)}] ${s.speaker}: ${s.text}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format Seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Cleanup effect
  useEffect(() => {
    return () => cleanupRecording();
  }, [cleanupRecording]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        
        {/* Header Block */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Transcription & Dictation</h1>
          <p className="mt-2 text-text-muted">
            Transcribe files, capture live dictation, clean text scripts, and build translated dubs.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Column 1: Source & Settings Control Panel */}
          <div className="md:col-span-1 rounded-xl border border-border bg-surface-muted p-6 space-y-6">
            <h2 className="text-lg font-bold">1. Source Controls</h2>

            {/* Source Tab Toggle */}
            <div className="flex rounded-md bg-surface p-1 border border-border">
              <button
                className={`flex-1 rounded py-1.5 text-sm font-medium ${
                  sourceMode === "mic" ? "bg-primary text-primary-foreground shadow" : "text-text-muted"
                }`}
                onClick={() => setSourceMode("mic")}
              >
                Microphone
              </button>
              <button
                className={`flex-1 rounded py-1.5 text-sm font-medium ${
                  sourceMode === "upload" ? "bg-primary text-primary-foreground shadow" : "text-text-muted"
                }`}
                onClick={() => setSourceMode("upload")}
              >
                Upload File
              </button>
            </div>

            {/* Transcription Mode Toggle */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Engine Mode
              </label>
              <div className="mt-2 flex rounded-md bg-surface p-1 border border-border">
                <button
                  className={`flex-1 rounded py-1 text-xs font-semibold ${
                    engineMode === "local" ? "bg-primary text-primary-foreground" : "text-text-muted"
                  }`}
                  onClick={() => setEngineMode("local")}
                >
                  Local Dictation
                </button>
                <button
                  className={`flex-1 rounded py-1 text-xs font-semibold ${
                    engineMode === "whisper" ? "bg-primary text-primary-foreground" : "text-text-muted"
                  }`}
                  onClick={() => setEngineMode("whisper")}
                >
                  AI Whisper
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-text-muted">
                {engineMode === "local" 
                  ? "Uses free local browser WebSpeech engine. Dictates live mic input." 
                  : "Uses Whisper AI via your OpenAI Key. Best for audio file uploads."}
              </p>
            </div>

            {/* Conditional Interface: Mic */}
            {sourceMode === "mic" && (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border border-border h-24 bg-slate-900">
                  <canvas ref={canvasRef} width={280} height={96} className="w-full h-full" />
                  {isRecording && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                  {!isRecording && !recordedUrl && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
                      Waveform visualization
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-text">
                    Time: {formatTime(recordingDuration)}
                  </span>
                  <div className="flex gap-2">
                    {!isRecording ? (
                      <Button onClick={startRecording} className="flex gap-1.5 items-center">
                        <Mic className="size-4" /> Record
                      </Button>
                    ) : (
                      <Button variant="danger" onClick={stopRecording} className="flex gap-1.5 items-center">
                        <Square className="size-4" /> Stop
                      </Button>
                    )}
                  </div>
                </div>

                {recordedUrl && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <label className="text-xs text-text-muted">Recorded Audio Clip</label>
                    <audio src={recordedUrl} controls className="w-full h-8" />
                  </div>
                )}
              </div>
            )}

            {/* Conditional Interface: Upload */}
            {sourceMode === "upload" && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary-strong transition-colors relative bg-surface">
                  <input
                    type="file"
                    accept="audio/*,video/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="size-8 mx-auto text-text-muted" />
                  <p className="mt-2 text-xs text-text-muted">
                    Click or drag audio/video file here
                  </p>
                  <p className="mt-1 text-[10px] text-text-muted">
                    Supports MP3, WAV, M4A, WEBM (Max 25MB)
                  </p>
                </div>

                {uploadedFile && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs bg-surface p-2 rounded border border-border">
                      <FolderOpen className="size-4 text-primary shrink-0" />
                      <span className="truncate flex-1 font-mono">{uploadedFile.name}</span>
                    </div>
                    {uploadedUrl && (
                      <audio src={uploadedUrl} controls className="w-full h-8" />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Run Trigger */}
            <Button
              className="w-full flex gap-1.5 items-center justify-center"
              onClick={runWhisperTranscription}
              disabled={isTranscribing || (sourceMode === "mic" ? !recordedBlob : !uploadedFile)}
            >
              {isTranscribing ? (
                <>
                  <RefreshCw className="size-4 animate-spin" /> Transcribing...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Start Transcribe
                </>
              )}
            </Button>
          </div>

          {/* Column 2 & 3: Interactive Editor Panel */}
          <div className="md:col-span-2 rounded-xl border border-border bg-surface p-6 space-y-6 flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-bold">2. Transcript Editor</h2>
              
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={cleanTranscriptText} disabled={segments.length === 0}>
                  Remove Fillers
                </Button>
                <Button variant="secondary" size="sm" onClick={copyToClipboard} disabled={segments.length === 0}>
                  {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                </Button>
                
                {/* Export Dropdown */}
                <div className="relative group">
                  <Button variant="secondary" size="sm" className="flex gap-1 items-center" disabled={segments.length === 0}>
                    <Download className="size-4" /> Export
                  </Button>
                  <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-surface border border-border shadow-md rounded-md overflow-hidden z-20 w-32">
                    <button onClick={() => downloadTranscript("txt")} className="w-full text-left px-3 py-2 text-xs hover:bg-surface-muted">
                      Plain Text (.txt)
                    </button>
                    <button onClick={() => downloadTranscript("md")} className="w-full text-left px-3 py-2 text-xs hover:bg-surface-muted">
                      Markdown (.md)
                    </button>
                    <button onClick={() => downloadTranscript("json")} className="w-full text-left px-3 py-2 text-xs hover:bg-surface-muted">
                      JSON (.json)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Empty Slate state */}
            {segments.length === 0 && !isTranscribing && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-text-muted border border-dashed border-border rounded-lg bg-surface-muted">
                <Volume2 className="size-12 mb-3 opacity-40" />
                <p className="text-sm font-semibold">No transcript generated yet</p>
                <p className="text-xs max-w-sm mt-1">
                  Upload an audio file or select microphone dictation above, then run Transcribe to populate the dialogue editor.
                </p>
              </div>
            )}

            {/* Loading state */}
            {isTranscribing && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <RefreshCw className="size-10 text-primary animate-spin" />
                <p className="text-sm font-medium">Analyzing speech structures...</p>
                <p className="text-xs text-text-muted max-w-xs">
                  This can take several seconds depending on your audio file size and model queue.
                </p>
              </div>
            )}

            {/* Dialogue Segment List */}
            {segments.length > 0 && !isTranscribing && (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {segments.map((seg, idx) => (
                  <div key={seg.id} className="flex gap-4 p-3 rounded-lg border border-border bg-surface-muted hover:border-primary/30 transition-colors">
                    {/* Timestamp / Meta Info */}
                    <div className="flex flex-col shrink-0 items-start space-y-1">
                      <span className="rounded bg-surface px-2 py-0.5 text-xs font-mono border border-border text-primary font-bold">
                        {formatTime(seg.start)}
                      </span>
                      <input
                        type="text"
                        value={seg.speaker}
                        onChange={(e) => {
                          const updated = [...segments];
                          updated[idx].speaker = e.target.value;
                          setSegments(updated);
                        }}
                        className="w-20 text-[11px] font-semibold bg-transparent border-b border-transparent hover:border-border focus:border-primary px-1 focus:outline-none"
                        title="Edit speaker name"
                      />
                    </div>

                    {/* Dialogue Text Block */}
                    <textarea
                      value={seg.text}
                      onChange={(e) => {
                        const updated = [...segments];
                        updated[idx].text = e.target.value;
                        setSegments(updated);
                      }}
                      rows={2}
                      className="flex-1 bg-surface border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-primary resize-none"
                    />

                    {/* Action controls */}
                    <button
                      onClick={() => {
                        setSegments((prev) => prev.filter((item) => item.id !== seg.id));
                      }}
                      className="shrink-0 self-center text-text-muted hover:text-red-400 p-1"
                      title="Delete dialogue block"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Translation & Assisted Dubbing Drawer */}
        {segments.length > 0 && (
          <div className="rounded-xl border border-border bg-surface-muted p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Globe className="size-5 text-primary" />
              <h2 className="text-lg font-bold">Assisted Dubbing & Compilation</h2>
            </div>
            
            <p className="text-sm text-text-muted">
              Translate your generated transcript segments into another language, and convert them directly into a multi-scene Voice Studio script draft!
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Target Language:</span>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="rounded border border-border bg-surface px-3 py-1.5 text-sm"
                >
                  <option value="es">Spanish (Español)</option>
                  <option value="fr">French (Français)</option>
                  <option value="de">German (Deutsch)</option>
                  <option value="it">Italian (Italiano)</option>
                  <option value="ja">Japanese (日本語)</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                </select>
              </div>

              <Button
                variant="secondary"
                disabled={isTranslating}
                onClick={async () => {
                  setIsTranslating(true);
                  // Mock translations for local utility fallback, translates segments
                  setTimeout(() => {
                    const translationPhrases: Record<string, Record<string, string>> = {
                      es: { hello: "hola", transcript: "transcripción", default: "Traducido de forma asistida" },
                      fr: { hello: "bonjour", transcript: "transcription", default: "Traduit avec assistance" },
                      de: { hello: "hallo", transcript: "transkript", default: "Unterstützte Übersetzung" }
                    };
                    setSegments((prev) =>
                      prev.map((seg) => {
                        const phrase = translationPhrases[targetLang] || { default: "Translated Segment" };
                        let text = seg.text;
                        if (text.toLowerCase().includes("hello")) text = phrase.hello || text;
                        else text = `${phrase.default || "Translation"}: ${seg.text}`;
                        return { ...seg, text };
                      })
                    );
                    setIsTranslating(false);
                  }, 1200);
                }}
              >
                {isTranslating ? "Translating..." : "Translate Transcript"}
              </Button>

              <Button
                onClick={() => {
                  // Direct Compilation Handoff: map segments to Voice Studio page
                  if (typeof window !== "undefined") {
                    const studioData = {
                      title: "Dubbed Project Draft",
                      scenes: segments.map((seg, idx) => ({
                        id: String(idx),
                        text: seg.text,
                        voiceURI: "",
                        rate: 1,
                        pitch: 1,
                        volume: 1,
                        pauseDuration: 1
                      }))
                    };
                    sessionStorage.setItem("voicekit_studio_import", JSON.stringify(studioData));
                    window.location.href = "/studio";
                  }
                }}
              >
                Send to Voice Studio Timeline
              </Button>
            </div>
          </div>
        )}
      </div>
  );
}
