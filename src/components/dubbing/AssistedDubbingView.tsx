"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  FileText,
  Globe,
  Sliders,
  Volume2,
  Download,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const DUBBING_STEPS = [
  { id: 1, title: "Source Media Upload", desc: "Select original audio (MP3/WAV) or video (MP4/WebM)." },
  { id: 2, title: "Original Transcription", desc: "Extract timestamped spoken text from the recording." },
  { id: 3, title: "Transcript Verification", desc: "Review and fix any misheard words or acronyms." },
  { id: 4, title: "Target Language", desc: "Choose translation language (Spanish, Hindi, French, etc.)." },
  { id: 5, title: "Glossary & Preserved Terms", desc: "Lock brand names and technical jargon from being translated." },
  { id: 6, title: "Duration & Pacing Match", desc: "Align translated sentence length with original video timing." },
  { id: 7, title: "Voice Model Selection", desc: "Assign natural target language voice actor models." },
  { id: 8, title: "Timeline Pause Calibration", desc: "Fine-tune silence gaps and sentence boundaries." },
  { id: 9, title: "Audio Synthesis & Preview", desc: "Generate translated audio tracks and test synchronization." },
  { id: 10, title: "Export Dubbed Package", desc: "Download dubbed audio, translated SRT/VTT subtitles, and project JSON." },
];

export function AssistedDubbingView() {
  const [currentStep, setCurrentStep] = useState(1);

  // Dubbing State
  const [sourceFile, setSourceFile] = useState<string | null>("sample-intro.mp4");
  const [originalTranscript, setOriginalTranscript] = useState(
    "Welcome to the MK VoiceKit walk-through. Today we are exploring localized voice dubbing."
  );
  const [targetLang, setTargetLang] = useState("Spanish");
  const [preservedTerms, setPreservedTerms] = useState("MK VoiceKit, Web Speech API");
  const [translatedText, setTranslatedText] = useState(
    "Bienvenidos al recorrido de MK VoiceKit. Hoy exploramos el doblaje de voz localizado."
  );
  const [targetVoice, setTargetVoice] = useState("Lucia (Spanish - Spain)");
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleNext = () => setCurrentStep((prev) => Math.min(10, prev + 1));
  const handlePrev = () => setCurrentStep((prev) => Math.max(1, prev - 1));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8 animate-fade-in">
      {/* 10-Step Progress Bar Header */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text">10-Step Assisted Dubbing Pipeline</h1>
            <p className="text-xs text-text-muted mt-1">
              Step {currentStep} of 10: <span className="text-primary font-semibold">{DUBBING_STEPS[currentStep - 1].title}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handlePrev} disabled={currentStep === 1}>
              <ChevronLeft size={14} className="mr-1" /> Previous
            </Button>
            <Button size="sm" onClick={handleNext} disabled={currentStep === 10} className="bg-primary text-on-primary font-bold">
              <span>Next Step</span> <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>

        {/* Step Indicator Pills */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-2 border-t border-border">
          {DUBBING_STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(s.id)}
              className={cn(
                "p-2 rounded-lg text-center text-[10px] font-bold transition-all cursor-pointer truncate",
                currentStep === s.id
                  ? "bg-primary text-on-primary shadow-sm"
                  : currentStep > s.id
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                  : "bg-surface-sunken text-text-muted border border-border"
              )}
            >
              {s.id}. {s.title.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Step Workspace Container */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm min-h-[360px] space-y-6">
        <div className="border-b border-border pb-4">
          <h2 className="text-lg font-bold text-text flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
              {currentStep}
            </span>
            <span>{DUBBING_STEPS[currentStep - 1].title}</span>
          </h2>
          <p className="text-xs text-text-muted mt-1">{DUBBING_STEPS[currentStep - 1].desc}</p>
        </div>

        {/* STEP 1: Upload */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-surface-sunken space-y-3">
              <Upload className="size-10 mx-auto text-text-muted" />
              <div>
                <p className="text-sm font-bold text-text">Drag and drop audio or video file</p>
                <p className="text-xs text-text-muted">Supports MP3, WAV, M4A, MP4, and WebM (up to 50 MB)</p>
              </div>
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={(e) => setSourceFile(e.target.files?.[0]?.name || "uploaded-file.mp3")}
                className="text-xs text-text-muted mx-auto block"
              />
            </div>
            {sourceFile && (
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Selected media: {sourceFile}
              </p>
            )}
          </div>
        )}

        {/* STEP 2 & 3: Original Transcript Review */}
        {(currentStep === 2 || currentStep === 3) && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-text-muted block">Original Spoken Transcript</label>
            <textarea
              rows={6}
              value={originalTranscript}
              onChange={(e) => setOriginalTranscript(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-sunken p-3 text-xs font-mono focus:outline-none focus:border-primary"
            />
          </div>
        )}

        {/* STEP 4: Target Language */}
        {currentStep === 4 && (
          <div className="space-y-3 max-w-md">
            <label className="text-xs font-bold text-text-muted block">Select Target Dubbing Language</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-sunken p-2.5 text-xs font-semibold focus:outline-none"
            >
              <option value="Spanish">Spanish (Español)</option>
              <option value="French">French (Français)</option>
              <option value="German">German (Deutsch)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Japanese">Japanese (日本語)</option>
              <option value="Portuguese">Portuguese (Português)</option>
            </select>
          </div>
        )}

        {/* STEP 5: Glossary */}
        {currentStep === 5 && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-text-muted block">Preserved Glossary Terms (Comma Separated)</label>
            <p className="text-[11px] text-text-muted">These terms will remain in original English without translation.</p>
            <input
              type="text"
              value={preservedTerms}
              onChange={(e) => setPreservedTerms(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-sunken p-2.5 text-xs font-mono focus:outline-none"
            />
          </div>
        )}

        {/* STEP 6 & 7: Translated Text & Voice Model */}
        {(currentStep === 6 || currentStep === 7) && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted block">Translated Script ({targetLang})</label>
              <textarea
                rows={4}
                value={translatedText}
                onChange={(e) => setTranslatedText(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-sunken p-3 text-xs font-mono focus:outline-none"
              />
            </div>

            <div className="max-w-md space-y-1.5">
              <label className="text-xs font-bold text-text-muted block">Assigned Voice Model</label>
              <select
                value={targetVoice}
                onChange={(e) => setTargetVoice(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-sunken p-2.5 text-xs font-semibold focus:outline-none"
              >
                <option value="Lucia (Spanish - Spain)">Lucia (Spanish - Spain)</option>
                <option value="Mateo (Spanish - Mexico)">Mateo (Spanish - Mexico)</option>
                <option value="Swara (Hindi - India)">Swara (Hindi - India)</option>
                <option value="Henri (French - France)">Henri (French - France)</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 8 & 9: Synthesis & Preview */}
        {(currentStep === 8 || currentStep === 9) && (
          <div className="space-y-4 text-center py-6">
            <Button
              size="lg"
              disabled={isSynthesizing}
              onClick={() => {
                setIsSynthesizing(true);
                setTimeout(() => setIsSynthesizing(false), 1200);
              }}
              className="bg-primary text-on-primary font-bold mx-auto"
            >
              {isSynthesizing ? <Sparkles size={16} className="animate-spin mr-2" /> : <Volume2 size={16} className="mr-2" />}
              <span>{isSynthesizing ? "Synthesizing Dubbed Track…" : "Generate & Preview Dubbed Audio"}</span>
            </Button>
            <p className="text-xs text-text-muted">
              Generates synchronized speech track matching original video sentence timings.
            </p>
          </div>
        )}

        {/* STEP 10: Export Package */}
        {currentStep === 10 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text">Your Dubbed Content Package is Ready</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-border bg-surface-sunken space-y-2">
                <p className="font-bold text-xs text-text">Translated Subtitles (.srt)</p>
                <p className="text-[11px] text-text-muted">SubRip subtitles in {targetLang}</p>
                <Button size="sm" variant="secondary" className="w-full" onClick={() => alert("Downloaded translated SRT!")}>
                  <Download size={12} className="mr-1" /> Download SRT
                </Button>
              </div>

              <div className="p-4 rounded-xl border border-border bg-surface-sunken space-y-2">
                <p className="font-bold text-xs text-text">Dubbed Audio Track (.wav)</p>
                <p className="text-[11px] text-text-muted">High-fidelity voice audio in {targetLang}</p>
                <Button size="sm" variant="secondary" className="w-full" onClick={() => alert("Downloaded dubbed audio!")}>
                  <Download size={12} className="mr-1" /> Download WAV
                </Button>
              </div>

              <div className="p-4 rounded-xl border border-border bg-surface-sunken space-y-2">
                <p className="font-bold text-xs text-text">Dubbing Project JSON</p>
                <p className="text-[11px] text-text-muted">Complete alignment manifest</p>
                <Button size="sm" variant="secondary" className="w-full" onClick={() => alert("Downloaded project JSON!")}>
                  <Download size={12} className="mr-1" /> Download JSON
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
