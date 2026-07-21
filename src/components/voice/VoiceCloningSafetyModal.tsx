"use client";

import React, { useState } from "react";
import { ShieldCheck, CircleAlert, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface VoiceCloningSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function VoiceCloningSafetyModal({ isOpen, onClose, onConfirm }: VoiceCloningSafetyModalProps) {
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);

  if (!isOpen) return null;

  const canProceed = check1 && check2 && check3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2 text-primary font-bold text-base sm:text-lg">
            <ShieldCheck size={22} />
            <span>Ethical Voice Cloning Safety Verification</span>
          </div>
          <button onClick={onClose} className="p-1 text-text-muted hover:text-text cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 text-xs space-y-2">
          <p className="font-bold text-accent flex items-center gap-1.5">
            <CircleAlert size={15} /> Strict Anti-Impersonation Policy
          </p>
          <p className="text-text-muted leading-relaxed">
            MK VoiceKit strictly adheres to AI safety standards. Synthetic voice cloning or custom model generation requires explicit written consent from the voice owner.
          </p>
        </div>

        {/* Verification Checkboxes */}
        <div className="space-y-3 text-xs">
          <label className="flex items-start gap-3 p-3 rounded-lg border border-border bg-surface-sunken hover:border-primary/40 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={check1}
              onChange={(e) => setCheck1(e.target.checked)}
              className="mt-0.5 size-4 rounded border-border text-primary shrink-0"
            />
            <span className="text-text leading-relaxed">
              <strong>Owner Consent:</strong> I own this voice or have received explicit, written authorization from the speaker to synthesize their speech.
            </span>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg border border-border bg-surface-sunken hover:border-primary/40 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={check2}
              onChange={(e) => setCheck2(e.target.checked)}
              className="mt-0.5 size-4 rounded border-border text-primary shrink-0"
            />
            <span className="text-text leading-relaxed">
              <strong>No Deceptive Media:</strong> I will not use this voice clone for political impersonation, scam calls, unauthorized deepfakes, or misleading content.
            </span>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg border border-border bg-surface-sunken hover:border-primary/40 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={check3}
              onChange={(e) => setCheck3(e.target.checked)}
              className="mt-0.5 size-4 rounded border-border text-primary shrink-0"
            />
            <span className="text-text leading-relaxed">
              <strong>Audit Logging:</strong> I understand that synthetic audio requests may include cryptographic metadata and usage audit trails.
            </span>
          </label>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!canProceed}
            onClick={onConfirm}
            className="bg-primary text-on-primary font-bold"
          >
            <CheckCircle2 size={16} className="mr-1.5" />
            <span>Confirm & Proceed</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
